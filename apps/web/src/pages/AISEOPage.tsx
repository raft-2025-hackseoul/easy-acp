import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  acceptSuggestion,
  generateProviderSuggestions,
  getProviderSyncState,
  removeSuggestion,
} from '../services/api';
import type { ProviderSyncState } from '../services/api';
import { useWorkflow } from '../context/WorkflowContext';
import './AISEOPage.css';

export function AISEOPage() {
  const navigate = useNavigate();
  const { providerSyncState, setProviderSyncState } = useWorkflow();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void initialize();
  }, []);

  const initialize = async () => {
    setIsLoading(true);
    setError('');
    try {
      const state = await ensureSuggestions();
      setProviderSyncState(state);
      if (state.suggestions.productOptimizations.length > 0) {
        setCurrentIndex((index) =>
          Math.min(index, state.suggestions.productOptimizations.length - 1)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load AI SEO suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  const ensureSuggestions = async (): Promise<ProviderSyncState> => {
    const state = await getProviderSyncState();
    if (state.mapping.length === 0) {
      return state;
    }

    if (state.suggestions.productOptimizations.length === 0) {
      await generateProviderSuggestions();
      return await getProviderSyncState();
    }

    return state;
  };

  const optimizations = providerSyncState?.suggestions.productOptimizations || [];
  const currentOptimization = optimizations[currentIndex];

  const originalProduct = useMemo(() => {
    const state = providerSyncState;
    if (!state || !state.feed || !currentOptimization) {
      return null;
    }
    return state.feed.products[currentOptimization.originalIndex] || null;
  }, [providerSyncState, currentOptimization]);

  const overrides = currentOptimization
    ? providerSyncState?.overrides[currentOptimization.productId] || {}
    : {};

  const handleSelect = async (field: string, useSuggested: boolean, suggestedValue: string) => {
    if (!currentOptimization) return;

    const currentOverride = overrides[field];
    const selectingSuggested = useSuggested && currentOverride !== suggestedValue;
    const selectingOriginal = !useSuggested && currentOverride !== undefined;

    if (!selectingSuggested && !selectingOriginal) {
      return;
    }

    setPendingField(field);
    setError('');
    try {
      if (useSuggested) {
        await acceptSuggestion(currentOptimization.productId, field, suggestedValue);
      } else {
        await removeSuggestion(currentOptimization.productId, field);
      }
      const updatedState = await getProviderSyncState();
      setProviderSyncState(updatedState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update selection.');
    } finally {
      setPendingField(null);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const handleNext = () => {
    if (!optimizations.length) return;
    setCurrentIndex((index) => Math.min(optimizations.length - 1, index + 1));
  };

  const handleBackToFeed = () => {
    navigate('/product-feed');
  };

  const totalProducts = optimizations.length;
  const progressLabel = totalProducts > 0 ? `${currentIndex + 1} / ${totalProducts}` : '0 / 0';

  return (
    <div className="ai-seo-page">
      <div className="page-header">
        <div>
          <h1>AI SEO Review</h1>
          <p className="page-subtitle">
            Compare AI-generated copy with your live WooCommerce listings and choose what to push to
            OpenAI&apos;s merchant channel.
          </p>
        </div>
        <button onClick={handleBackToFeed} className="link-button">
          ← Back to product feed
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner-large" />
          <p>Loading product suggestions…</p>
        </div>
      ) : null}

      {error && (
        <div className="error-banner">
          <strong>Unable to load suggestions.</strong>
          <span>{error}</span>
          <button className="retry" onClick={initialize}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && totalProducts === 0 && (
        <div className="empty-state">
          <h2>No AI suggestions yet</h2>
          <p>
            Generate a mapping on the Product Feed page first, then return here to review AI-powered
            improvements.
          </p>
          <button className="primary" onClick={handleBackToFeed}>
            Go to Product Feed setup
          </button>
        </div>
      )}

      {!isLoading && !error && currentOptimization && originalProduct && (
        <section className="review-card">
          <header>
            <div>
              <span className="progress">Product {progressLabel}</span>
              <h2>{currentOptimization.productName}</h2>
              <p className="product-id">WooCommerce ID: {originalProduct.product_id}</p>
            </div>
            <div className="nav-buttons">
              <button onClick={handlePrevious} disabled={currentIndex === 0}>
                Previous
              </button>
              <button onClick={handleNext} disabled={currentIndex === totalProducts - 1}>
                Next
              </button>
            </div>
          </header>

          <div className="field-list">
            {currentOptimization.optimizations.map((optimization) => {
              const overrideValue = overrides[optimization.field];
              const suggestedSelected = overrideValue === optimization.suggestedValue;
              const originalSelected = overrideValue === undefined;

              return (
                <div key={optimization.field} className="field-comparison">
                  <div className="field-header">
                    <h3>{optimization.field}</h3>
                    <span>{optimization.impact.toUpperCase()} impact</span>
                  </div>
                  <div className="comparison-columns">
                    <button
                      className={`value-card ${originalSelected ? 'selected' : ''}`}
                      onClick={() =>
                        handleSelect(optimization.field, false, optimization.currentValue)
                      }
                      disabled={pendingField === optimization.field}
                    >
                      <span className="label">Current listing</span>
                      <p>{optimization.currentValue || <em>No value set</em>}</p>
                      {originalSelected && <span className="badge">Active</span>}
                    </button>
                    <button
                      className={`value-card suggested ${suggestedSelected ? 'selected' : ''}`}
                      onClick={() =>
                        handleSelect(optimization.field, true, optimization.suggestedValue)
                      }
                      disabled={pendingField === optimization.field}
                    >
                      <span className="label">AI suggestion</span>
                      <p>{optimization.suggestedValue}</p>
                      <small>{optimization.reasoning}</small>
                      {suggestedSelected && <span className="badge">Selected</span>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
