import { useState } from 'react';
import { ProductOptimization } from '../services/api';
import './OptimizationSuggestions.css';

interface OptimizationSuggestionsProps {
  productOptimizations: ProductOptimization[];
  acceptedOptimizations: Set<string>; // Set of "productId:fieldName" keys
  onToggleOptimization: (productId: string, field: string) => void;
  onExport: () => void;
  isExporting: boolean;
}

export function OptimizationSuggestions({
  productOptimizations,
  acceptedOptimizations,
  onToggleOptimization,
  onExport,
  isExporting,
}: OptimizationSuggestionsProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return 'impact-high';
      case 'medium':
        return 'impact-medium';
      case 'low':
        return 'impact-low';
      default:
        return '';
    }
  };

  const getImpactIcon = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return '🚀';
      case 'medium':
        return '📈';
      case 'low':
        return '💡';
      default:
        return '';
    }
  };

  const averageScore =
    productOptimizations.reduce((sum, p) => sum + p.overallScore, 0) /
    productOptimizations.length;
  const averageImprovement =
    productOptimizations.reduce((sum, p) => sum + p.potentialImprovement, 0) /
    productOptimizations.length;

  const totalSuggestions = productOptimizations.reduce(
    (sum, p) => sum + p.optimizations.length,
    0
  );
  const acceptedCount = acceptedOptimizations.size;

  return (
    <div className="optimization-suggestions">
      <div className="optimization-header">
        <div>
          <h2>Optimization Suggestions</h2>
          <p className="subtitle">
            AI-powered recommendations - Select suggestions to include in export
          </p>
        </div>
        <button
          onClick={onExport}
          disabled={isExporting || acceptedCount === 0}
          className="export-btn"
        >
          {isExporting
            ? 'Exporting...'
            : `Export CSV with ${acceptedCount} change${acceptedCount !== 1 ? 's' : ''}`}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{productOptimizations.length}</div>
          <div className="stat-label">Products Analyzed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{averageScore.toFixed(1)}/10</div>
          <div className="stat-label">Average Current Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {acceptedCount} / {totalSuggestions}
          </div>
          <div className="stat-label">Accepted Suggestions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">+{averageImprovement.toFixed(1)}%</div>
          <div className="stat-label">Potential Improvement</div>
        </div>
      </div>

      <div className="products-list">
        {productOptimizations.map((product) => {
          const isExpanded = expandedProducts.has(product.productId);
          const highImpactCount = product.optimizations.filter((o) => o.impact === 'high').length;

          return (
            <div key={product.productId} className="product-card">
              <div className="product-header" onClick={() => toggleProduct(product.productId)}>
                <div className="product-info">
                  <h3>{product.productName}</h3>
                  <div className="product-meta">
                    <span className="score">
                      Score: {product.overallScore}/10
                    </span>
                    <span className="improvement">
                      Potential: +{product.potentialImprovement}%
                    </span>
                    <span className="suggestions-count">
                      {product.optimizations.length} suggestions
                      {highImpactCount > 0 && (
                        <span className="high-impact-badge">
                          {highImpactCount} high impact
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <button className="expand-btn">
                  {isExpanded ? '▼' : '▶'}
                </button>
              </div>

              {isExpanded && (
                <div className="optimizations-list">
                  {product.optimizations.map((optimization, index) => {
                    const optimizationKey = `${product.productId}:${optimization.field}`;
                    const isAccepted = acceptedOptimizations.has(optimizationKey);

                    return (
                      <div
                        key={index}
                        className={`optimization-item ${isAccepted ? 'accepted' : ''}`}
                      >
                        <div className="optimization-header-row">
                          <div className="field-name-with-checkbox">
                            <input
                              type="checkbox"
                              checked={isAccepted}
                              onChange={() =>
                                onToggleOptimization(product.productId, optimization.field)
                              }
                              className="optimization-checkbox"
                            />
                            <strong>{optimization.field}</strong>
                          </div>
                          <span className={`impact-badge ${getImpactColor(optimization.impact)}`}>
                            {getImpactIcon(optimization.impact)} {optimization.impact} impact
                          </span>
                        </div>

                        <div className="value-comparison">
                          <div className="value-box current">
                            <label>Current:</label>
                            <p>{optimization.currentValue || <em>Empty</em>}</p>
                          </div>
                          <div className="arrow">→</div>
                          <div className="value-box suggested">
                            <label>Suggested:</label>
                            <p>{optimization.suggestedValue}</p>
                          </div>
                        </div>

                        <div className="reasoning">
                          <strong>Why this matters:</strong> {optimization.reasoning}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

