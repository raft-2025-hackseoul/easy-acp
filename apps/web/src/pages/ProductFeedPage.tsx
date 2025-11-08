import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  connectProvider,
  fetchProviderFeed,
  generateProviderSuggestions,
  getProviderSuggestions,
  mapProviderFeed,
  ProviderFieldMapping,
  ProviderRoadmapStep,
  pushToMerchant,
  resetProviderSync,
  setMerchantUrl,
} from '../services/api';
import { useWorkflow } from '../context/WorkflowContext';
import './ProductFeedPage.css';

const ROADMAP: Array<{ step: ProviderRoadmapStep; title: string; description: string }> = [
  {
    step: 'connect',
    title: '1. Connect WooCommerce',
    description: 'Authenticate with a read-only token so we can pull your product catalogue.',
  },
  {
    step: 'fetch',
    title: '2. Import product feed',
    description: 'Pull the latest products from your store and stage them for mapping.',
  },
  {
    step: 'map',
    title: '3. Map fields & validate',
    description: 'Align WooCommerce fields to OpenAI requirements and validate with LLM.',
  },
  {
    step: 'seo',
    title: '4. Review AI SEO suggestions',
    description: 'Improve titles and descriptions before pushing to ChatGPT discovery.',
  },
  {
    step: 'push',
    title: '5. Provide merchant URL',
    description: 'Tell OpenAI where customers should land for transactions.',
  },
  {
    step: 'completed',
    title: '6. Push feed to OpenAI',
    description: 'Send your optimised feed to the mocked OpenAI merchant endpoint.',
  },
];

interface LoadingState {
  connect: boolean;
  fetch: boolean;
  map: boolean;
  merchant: boolean;
  push: boolean;
  suggestions: boolean;
}

const initialLoading: LoadingState = {
  connect: false,
  fetch: false,
  map: false,
  merchant: false,
  push: false,
  suggestions: false,
};

export function ProductFeedPage() {
  const navigate = useNavigate();
  const { providerSyncState, refreshProviderSync, providerSyncLoading } = useWorkflow();
  const [tokenInput, setTokenInput] = useState('');
  const [merchantUrlInput, setMerchantUrlInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<LoadingState>(initialLoading);

  useEffect(() => {
    if (!providerSyncState && !providerSyncLoading) {
      void refreshProviderSync();
    }
  }, [providerSyncState, providerSyncLoading, refreshProviderSync]);

  useEffect(() => {
    if (providerSyncState?.token && providerSyncState.token !== tokenInput) {
      setTokenInput(providerSyncState.token);
    }
    if (providerSyncState?.merchantUrl && providerSyncState.merchantUrl !== merchantUrlInput) {
      setMerchantUrlInput(providerSyncState.merchantUrl);
    }
  }, [providerSyncState, tokenInput, merchantUrlInput]);

  const handleConnect = async () => {
    setLoading((prev) => ({ ...prev, connect: true }));
    setError('');
    try {
      await connectProvider('woocommerce', tokenInput.trim());
      await refreshProviderSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to WooCommerce');
    } finally {
      setLoading((prev) => ({ ...prev, connect: false }));
    }
  };

  const handleFetch = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    setError('');
    try {
      await fetchProviderFeed();
      await refreshProviderSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product feed');
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const handleMap = async () => {
    setLoading((prev) => ({ ...prev, map: true }));
    setError('');
    try {
      await mapProviderFeed();
      await refreshProviderSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to map fields');
    } finally {
      setLoading((prev) => ({ ...prev, map: false }));
    }
  };

  const handleMerchantSave = async () => {
    setLoading((prev) => ({ ...prev, merchant: true }));
    setError('');
    try {
      await setMerchantUrl(merchantUrlInput.trim());
      await refreshProviderSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save merchant URL');
    } finally {
      setLoading((prev) => ({ ...prev, merchant: false }));
    }
  };

  const handleGenerateSuggestions = async () => {
    setLoading((prev) => ({ ...prev, suggestions: true }));
    setError('');
    try {
      const existing = await getProviderSuggestions();
      if (!existing || existing.productOptimizations.length === 0) {
        await generateProviderSuggestions();
      }
      await refreshProviderSync();
      navigate('/ai-seo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prepare AI SEO suggestions');
    } finally {
      setLoading((prev) => ({ ...prev, suggestions: false }));
    }
  };

  const handlePush = async () => {
    setLoading((prev) => ({ ...prev, push: true }));
    setError('');
    try {
      await pushToMerchant();
      await refreshProviderSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to push to merchant');
    } finally {
      setLoading((prev) => ({ ...prev, push: false }));
    }
  };

  const handleReset = async () => {
    setLoading(initialLoading);
    setError('');
    setTokenInput('');
    setMerchantUrlInput('');
    await resetProviderSync();
    await refreshProviderSync();
  };

  const currentStep = providerSyncState?.roadmapStep || 'connect';

  const derivedStatus = useMemo(() => {
    const stepIndex = ROADMAP.findIndex((item) => item.step === currentStep);
    return ROADMAP.map((step, index) => {
      if (index < stepIndex) return 'completed';
      if (index === stepIndex) return 'active';
      return 'upcoming';
    });
  }, [currentStep]);

  const mappingRows = (providerSyncState?.mapping || []).map((mapping: ProviderFieldMapping) => (
    <tr key={`${mapping.providerField}-${mapping.openAIField}`}>
      <td>{mapping.providerField}</td>
      <td>{mapping.openAIField}</td>
      <td>{mapping.description || '—'}</td>
      <td>{mapping.required ? 'Required' : 'Optional'}</td>
    </tr>
  ));

  const validationIssues = (providerSyncState?.validation.issues || []).slice(0, 6);

  const canConnect = tokenInput.trim().length > 0;
  const canFetch = Boolean(providerSyncState?.provider && !loading.fetch);
  const canMap = Boolean(providerSyncState?.feed && !loading.map);
  const canGenerateSuggestions = Boolean(providerSyncState?.mapping.length && !loading.suggestions);
  const canSaveMerchant = merchantUrlInput.trim().length > 0 && !loading.merchant;
  const canPush = Boolean(providerSyncState?.merchantUrl && !loading.push);

  return (
    <div className="product-feed-page">
      <div className="page-header">
        <h1>Product Feed Automation</h1>
        <p className="page-subtitle">
          Automate WooCommerce ingestion, mapping, validation, and publishing to OpenAI&apos;s
          merchant API.
        </p>
      </div>

      <section className="roadmap">
        {ROADMAP.map((item, index) => (
          <div key={item.step} className={`roadmap-step roadmap-${derivedStatus[index]}`}>
            <div className="roadmap-index">{index + 1}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </section>

      {error && (
        <div className="error-banner">
          <strong>Something went wrong.</strong>
          <span>{error}</span>
        </div>
      )}

      <section className="card">
        <header>
          <h2>WooCommerce connection</h2>
          <p>Use a read-only API token for this demo environment.</p>
        </header>
        <div className="form-row">
          <label htmlFor="woocommerce-token">API token</label>
          <input
            id="woocommerce-token"
            type="text"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="woo_XXXXXXXXXXXXXXXX"
            disabled={loading.connect}
          />
        </div>
        <div className="actions">
          <button
            onClick={handleConnect}
            disabled={!canConnect || loading.connect}
            className="primary"
          >
            {loading.connect ? 'Connecting…' : 'Connect WooCommerce'}
          </button>
          <button onClick={handleReset} className="ghost">
            Reset demo
          </button>
        </div>
      </section>

      {providerSyncState?.provider && (
        <section className="card">
          <header>
            <h2>Product feed</h2>
            <p>Pull the latest products from WooCommerce.</p>
          </header>
          {providerSyncState.feed ? (
            <div className="feed-summary">
              <div>
                <span className="label">Products synced</span>
                <strong>{providerSyncState.feed.total}</strong>
              </div>
              <div>
                <span className="label">Last sync</span>
                <strong>{new Date(providerSyncState.feed.syncedAt).toLocaleString()}</strong>
              </div>
              <div>
                <span className="label">Sync reference</span>
                <code>{providerSyncState.feed.syncId}</code>
              </div>
            </div>
          ) : (
            <p className="placeholder">No feed imported yet.</p>
          )}
          <div className="actions">
            <button onClick={handleFetch} disabled={!canFetch || loading.fetch} className="primary">
              {loading.fetch ? 'Importing…' : 'Import product feed'}
            </button>
          </div>
        </section>
      )}

      {providerSyncState?.feed && (
        <section className="card">
          <header>
            <h2>Field mapping & validation</h2>
            <p>Map WooCommerce fields to ACP and review validation highlights.</p>
          </header>
          {providerSyncState.mapping.length > 0 ? (
            <div className="mapping-table">
              <table>
                <thead>
                  <tr>
                    <th>WooCommerce field</th>
                    <th>OpenAI field</th>
                    <th>Description</th>
                    <th>Requirement</th>
                  </tr>
                </thead>
                <tbody>{mappingRows}</tbody>
              </table>
            </div>
          ) : (
            <p className="placeholder">Mapping not generated yet.</p>
          )}

          {providerSyncState.validation.status === 'validating' && (
            <p className="status-badge">Validating with LLM…</p>
          )}

          {providerSyncState.validation.summary && (
            <div className="validation-summary">
              <strong>{providerSyncState.validation.summary}</strong>
              {validationIssues.length > 0 && (
                <ul>
                  {validationIssues.map((issue, index) => (
                    <li key={`${issue.field || 'general'}-${index}`}>
                      <span className={`issue-tag issue-${issue.severity}`}>{issue.severity}</span>
                      <span>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="actions">
            <button onClick={handleMap} disabled={!canMap} className="primary">
              {loading.map ? 'Mapping…' : 'Generate mapping & validate'}
            </button>
          </div>
        </section>
      )}

      {providerSyncState?.mapping.length ? (
        <section className="card">
          <header>
            <h2>AI SEO suggestions</h2>
            <p>Review one product at a time and choose improved titles/descriptions.</p>
          </header>
          <div className="actions">
            <button
              onClick={handleGenerateSuggestions}
              disabled={!canGenerateSuggestions}
              className="primary"
            >
              {loading.suggestions ? 'Preparing…' : 'Open AI SEO review'}
            </button>
          </div>
        </section>
      ) : null}

      {providerSyncState?.mapping.length ? (
        <section className="card">
          <header>
            <h2>Merchant configuration</h2>
            <p>
              Provide the destination URL where OpenAI should send purchase-ready shoppers. This is
              mocked for the demo but required in production.
            </p>
          </header>
          <div className="form-row">
            <label htmlFor="merchant-url">Merchant URL</label>
            <input
              id="merchant-url"
              type="url"
              placeholder="https://shop.example.com"
              value={merchantUrlInput}
              onChange={(event) => setMerchantUrlInput(event.target.value)}
              disabled={loading.merchant}
            />
          </div>
          <div className="actions">
            <button onClick={handleMerchantSave} disabled={!canSaveMerchant} className="primary">
              {loading.merchant ? 'Saving…' : 'Save merchant URL'}
            </button>
          </div>
        </section>
      ) : null}

      {providerSyncState?.merchantUrl && (
        <section className="card">
          <header>
            <h2>Publish to OpenAI</h2>
            <p>Push the mapped feed and accepted suggestions to the mocked OpenAI merchant API.</p>
          </header>
          {providerSyncState.pushStatus ? (
            <div className="push-summary">
              <div>
                <span className="label">Last push</span>
                <strong>
                  {new Date(providerSyncState.pushStatus.lastPushedAt).toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="label">Destination</span>
                <strong>{providerSyncState.pushStatus.destinationUrl}</strong>
              </div>
              <div>
                <span className="label">Products pushed</span>
                <strong>{providerSyncState.pushStatus.totalProducts}</strong>
              </div>
            </div>
          ) : (
            <p className="placeholder">No pushes recorded yet.</p>
          )}
          <div className="actions">
            <button onClick={handlePush} disabled={!canPush} className="primary">
              {loading.push ? 'Pushing…' : 'Push feed to OpenAI'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
