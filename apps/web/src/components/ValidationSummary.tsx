import './ValidationSummary.css';

interface ValidationSummaryProps {
  validation: {
    missingRequired: string[];
    missingRecommended: string[];
    totalErrors: number;
    totalWarnings: number;
  };
  totalRows: number;
  validProducts: number;
  invalidProducts: number;
}

export function ValidationSummary({
  validation,
  totalRows,
  validProducts,
  invalidProducts,
}: ValidationSummaryProps) {
  return (
    <div className="validation-summary">
      <h2>Validation Results</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalRows}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{validProducts}</div>
          <div className="stat-label">Valid</div>
        </div>
        <div className="stat-card error">
          <div className="stat-value">{invalidProducts}</div>
          <div className="stat-label">Invalid</div>
        </div>
      </div>

      {validation.missingRequired.length > 0 && (
        <div className="alert alert-error">
          <div className="alert-title">
            <strong>⚠️ Missing Required Fields</strong>
          </div>
          <div className="alert-content">
            <p>The following required fields are missing or incomplete:</p>
            <ul>
              {validation.missingRequired.map((field) => (
                <li key={field}>
                  <code>{field}</code>
                </li>
              ))}
            </ul>
            <p className="alert-help">
              These fields must be completed for ACP compliance. Products without these fields cannot
              be published.
            </p>
          </div>
        </div>
      )}

      {validation.missingRecommended.length > 0 && (
        <div className="alert alert-warning">
          <div className="alert-title">
            <strong>💡 Missing Recommended Fields</strong>
          </div>
          <div className="alert-content">
            <p>Consider adding these recommended fields for better ranking:</p>
            <ul>
              {validation.missingRecommended.slice(0, 5).map((field) => (
                <li key={field}>
                  <code>{field}</code>
                </li>
              ))}
              {validation.missingRecommended.length > 5 && (
                <li>...and {validation.missingRecommended.length - 5} more</li>
              )}
            </ul>
            <p className="alert-help">
              While optional, these fields improve product visibility and conversion rates in ChatGPT.
            </p>
          </div>
        </div>
      )}

      {validation.missingRequired.length === 0 && (
        <div className="alert alert-success">
          <strong>✓ All Required Fields Present</strong>
          <p>Your product feed meets ACP compliance requirements!</p>
        </div>
      )}
    </div>
  );
}
