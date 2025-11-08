import './ValidationSummary.css';

interface DataValidation {
  fieldName: string;
  totalRows: number;
  emptyRows: number;
  emptyPercentage: number;
}

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
  dataValidation?: DataValidation[];
}

export function ValidationSummary({
  validation,
  totalRows,
  validProducts,
  invalidProducts,
  dataValidation = [],
}: ValidationSummaryProps) {
  // Filter data validation for required fields with issues
  const requiredFieldsWithIssues = dataValidation.filter(
    (dv) => dv.emptyRows > 0 && dv.emptyPercentage > 0
  );

  return (
    <div className="validation-summary">
      <h2>Validation Summary</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalRows}</div>
          <div className="stat-label">Total Rows</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{validProducts}</div>
          <div className="stat-label">Valid</div>
        </div>
        <div className="stat-card error">
          <div className="stat-value">{invalidProducts}</div>
          <div className="stat-label">Issues</div>
        </div>
      </div>

      {/* Missing Required Field Mappings */}
      {validation.missingRequired.length > 0 && (
        <div className="alert alert-error">
          <div className="alert-title">
            <strong>Missing Required Field Mappings ({validation.missingRequired.length})</strong>
          </div>
          <div className="alert-content">
            <p>The following required ACP fields are not mapped to any CSV column:</p>
            <ul>
              {validation.missingRequired.map((field) => (
                <li key={field}>
                  <code>{field}</code>
                </li>
              ))}
            </ul>
            <p className="alert-help">
              Use the Field Mapping section below to map these required fields.
            </p>
          </div>
        </div>
      )}

      {/* Data Quality Issues */}
      {requiredFieldsWithIssues.length > 0 && (
        <div className="alert alert-warning">
          <div className="alert-title">
            <strong>Data Quality Issues</strong>
          </div>
          <div className="alert-content">
            <p>Some mapped fields have empty values in your CSV data:</p>
            <div className="data-quality-list">
              {requiredFieldsWithIssues.map((dv) => (
                <div key={dv.fieldName} className="data-quality-item">
                  <code>{dv.fieldName}</code>
                  <span className="quality-stats">
                    {dv.emptyRows}/{dv.totalRows} rows empty ({dv.emptyPercentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
            <p className="alert-help">
              Consider fixing empty values in your source CSV for better data quality.
            </p>
          </div>
        </div>
      )}

      {/* Missing Recommended Fields */}
      {validation.missingRecommended.length > 0 && (
        <div className="alert alert-info">
          <div className="alert-title">
            <strong>Missing Recommended Fields ({validation.missingRecommended.length})</strong>
          </div>
          <div className="alert-content">
            <p>Consider mapping these recommended fields for better product visibility:</p>
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
              While optional, these fields improve product discoverability in ChatGPT.
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {validation.missingRequired.length === 0 && requiredFieldsWithIssues.length === 0 && (
        <div className="alert alert-success">
          <strong>All Required Fields Mapped</strong>
          <p>Your column mappings meet ACP compliance requirements!</p>
        </div>
      )}
    </div>
  );
}
