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
import { WorkflowStep } from '../components/WorkflowStep';
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
  const [merchantUrlInput, setMerchantUrlInput] = useState('https://openai.com/merchant/3rerjskdf');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<LoadingState>(initialLoading);

  useEffect(() => {
    if (!providerSyncState && !providerSyncLoading) {
      void refreshProviderSync();
    }
  }, [providerSyncState, providerSyncLoading, refreshProviderSync]);

  // Sync input fields with provider state only on initial load
  useEffect(() => {
    if (providerSyncState?.token && !tokenInput) {
      setTokenInput(providerSyncState.token);
    }
    if (providerSyncState?.merchantUrl && !merchantUrlInput) {
      setMerchantUrlInput(providerSyncState.merchantUrl);
    }
  }, [providerSyncState]); // Only run when providerSyncState changes

  // Handle merchant URL save completion
  useEffect(() => {
    const isMerchantUrlSaved = providerSyncState?.merchantUrl && 
                              providerSyncState.merchantUrl === merchantUrlInput &&
                              providerSyncState.roadmapStep === 'push';

    if (isMerchantUrlSaved && !loading.merchant) {
      // Call API to update roadmap step
      const updateStep = async () => {
        try {
          await setMerchantUrl(merchantUrlInput.trim());
          await refreshProviderSync();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to complete merchant configuration step');
        }
      };
      void updateStep();
    }
  }, [providerSyncState?.roadmapStep, providerSyncState?.merchantUrl, merchantUrlInput, loading.merchant]);

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
      // Refresh to get updated state with new step
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
      // Push the products to OpenAI merchant endpoint
      await pushToMerchant();

      // Show success message
      alert('Successfully synchronized products to OpenAI merchant platform! Your product feed is now live.');

      // Mark step as completed
      // Refresh state to show updated push status
      await refreshProviderSync();

      // Mark UI as completed
      const stepIndex = ROADMAP.findIndex((item) => item.step === 'completed');
      const newDerivedStatus = ROADMAP.map((_, index) => {
        if (index <= stepIndex) return 'completed';
        return 'upcoming';
      });
      
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

      {error && (
        <div className="error-banner">
          <strong>Something went wrong.</strong>
          <span>{error}</span>
        </div>
      )}

      <WorkflowStep
        title="WooCommerce Connection"
        stepNumber={1}
        isActive={currentStep === 'connect'}
        isCompleted={derivedStatus[0] === 'completed'}
        defaultExpanded={true}
      >
        <p className="text-gray-600 mb-4">Use a read-only API token for this demo environment.</p>
        <div className="form-row">
          <label htmlFor="woocommerce-token">API token</label>
          <input
            id="woocommerce-token"
            type="text"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="woo_XXXXXXXXXXXXXXXX"
            disabled={loading.connect}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="actions mt-4 flex gap-3">
          <button
            onClick={handleConnect}
            disabled={!canConnect || loading.connect}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.connect ? 'Connecting…' : 'Connect WooCommerce'}
          </button>
          <button 
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Reset demo
          </button>
        </div>
      </WorkflowStep>

      {providerSyncState?.provider && (
        <WorkflowStep
          title="Product Feed Import"
          stepNumber={2}
          isActive={currentStep === 'fetch'}
          isCompleted={derivedStatus[1] === 'completed'}
          defaultExpanded={currentStep === 'fetch'}
        >
          <p className="text-gray-600 mb-4">Pull the latest products from WooCommerce.</p>
          {providerSyncState.feed ? (
            <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-sm text-gray-600 block">Products synced</span>
                <strong className="text-lg">{providerSyncState.feed.total}</strong>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Last sync</span>
                <strong className="text-lg">{new Date(providerSyncState.feed.syncedAt).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Sync reference</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{providerSyncState.feed.syncId}</code>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic mb-4">No feed imported yet.</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleFetch}
              disabled={!canFetch || loading.fetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.fetch ? 'Importing…' : 'Import product feed'}
            </button>
          </div>
        </WorkflowStep>
      )}

      {providerSyncState?.feed && (
        <WorkflowStep
          title="Field Mapping & Validation"
          stepNumber={3}
          isActive={currentStep === 'map'}
          isCompleted={derivedStatus[2] === 'completed'}
          defaultExpanded={currentStep === 'map'}
        >
          <p className="text-gray-600 mb-4">Map WooCommerce fields to ACP and review validation highlights.</p>
          {providerSyncState.mapping.length > 0 ? (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WooCommerce field</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OpenAI field</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mappingRows}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic mb-4">Mapping not generated yet.</p>
          )}

          {providerSyncState.validation.status === 'validating' && (
            <p className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-md mb-4">
              Validating with LLM…
            </p>
          )}

          {providerSyncState.validation.summary && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <strong className="block mb-2">{providerSyncState.validation.summary}</strong>
              {validationIssues.length > 0 && (
                <ul className="space-y-2">
                  {validationIssues.map((issue, index) => (
                    <li key={`${issue.field || 'general'}-${index}`} className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        issue.severity === 'error' ? 'bg-red-100 text-red-800' :
                        issue.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {issue.severity}
                      </span>
                      <span className="text-gray-700">{issue.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={handleMap}
              disabled={!canMap || loading.map}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.map ? 'Mapping…' : 'Generate mapping & validate'}
            </button>
          </div>
        </WorkflowStep>
      )}

      {providerSyncState?.mapping.length ? (
        <WorkflowStep
          title="AI SEO Suggestions"
          stepNumber={4}
          isActive={currentStep === 'seo'}
          isCompleted={derivedStatus[3] === 'completed'}
          defaultExpanded={currentStep === 'seo'}
        >
          <p className="text-gray-600 mb-4">Review one product at a time and choose improved titles/descriptions.</p>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateSuggestions}
              disabled={!canGenerateSuggestions || loading.suggestions}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.suggestions ? 'Preparing…' : 'Open AI SEO review'}
            </button>
          </div>
        </WorkflowStep>
      ) : null}

      {providerSyncState?.mapping.length ? (
        <WorkflowStep
          title="Merchant Configuration"
          stepNumber={5}
          isActive={currentStep === 'push'}
          isCompleted={derivedStatus[4] === 'completed'}
          defaultExpanded={currentStep === 'push'}
        >
          <p className="text-gray-600 mb-4">
            Provide the destination URL where OpenAI should send purchase-ready shoppers. This is
            mocked for the demo but required in production.
          </p>
          <div className="form-row mb-4">
            <label htmlFor="merchant-url" className="block text-sm font-medium text-gray-700 mb-1">
              Merchant URL
            </label>
            <input
              id="merchant-url"
              type="url"
              placeholder="https://shop.example.com"
              value={merchantUrlInput}
              onChange={(event) => {
                setMerchantUrlInput(event.target.value);
                setError(''); // Clear any previous errors
              }}
              disabled={loading.merchant}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleMerchantSave}
              disabled={!canSaveMerchant || loading.merchant}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.merchant ? 'Saving…' : 'Save merchant URL'}
            </button>
          </div>
        </WorkflowStep>
      ) : null}

      {providerSyncState?.merchantUrl && (
        <WorkflowStep
          title="Publish to OpenAI"
          stepNumber={6}
          isActive={currentStep === 'completed'}
          isCompleted={derivedStatus[5] === 'completed'}
          defaultExpanded={currentStep === 'completed'}
        >
          <p className="text-gray-600 mb-4">
            Push the mapped feed and accepted suggestions to the mocked OpenAI merchant API.
          </p>
          {providerSyncState.pushStatus ? (
            <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-sm text-gray-600 block">Last push</span>
                <strong className="text-lg">
                  {new Date(providerSyncState.pushStatus.lastPushedAt).toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Destination</span>
                <strong className="text-lg break-all">
                  {providerSyncState.pushStatus.destinationUrl}
                </strong>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Products pushed</span>
                <strong className="text-lg">
                  {providerSyncState.pushStatus.totalProducts}
                </strong>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic mb-4">No pushes recorded yet.</p>
          )}
          <div className="flex gap-3">
            <button 
              onClick={handlePush}
              disabled={!canPush || loading.push}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.push ? 'Pushing…' : 'Push feed to OpenAI'}
            </button>
          </div>
        </WorkflowStep>
      )}
    </div>
  );
}
