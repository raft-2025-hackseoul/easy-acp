import './FieldMapping.css';

interface FieldMappingProps {
  mappings: Array<{
    source: string;
    target: string;
    confidence: number;
  }>;
}

export function FieldMapping({ mappings }: FieldMappingProps) {
  if (mappings.length === 0) {
    return null;
  }

  return (
    <div className="field-mapping">
      <h3>🤖 AI Field Mapping</h3>
      <p className="mapping-description">
        Our AI automatically mapped your CSV columns to ACP-compliant fields:
      </p>

      <div className="mapping-grid">
        {mappings.map((mapping, index) => (
          <div key={index} className="mapping-item">
            <div className="mapping-source">
              <span className="mapping-label">Your Field:</span>
              <code>{mapping.source}</code>
            </div>
            <div className="mapping-arrow">→</div>
            <div className="mapping-target">
              <span className="mapping-label">ACP Field:</span>
              <code>{mapping.target}</code>
            </div>
            <div className="mapping-confidence">
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{
                    width: `${mapping.confidence * 100}%`,
                    backgroundColor:
                      mapping.confidence > 0.8 ? '#4caf50' : mapping.confidence > 0.6 ? '#ff9800' : '#f44336',
                  }}
                ></div>
              </div>
              <span className="confidence-text">{Math.round(mapping.confidence * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
