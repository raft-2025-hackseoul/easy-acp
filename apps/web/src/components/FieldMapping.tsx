import { useState } from 'react';
import { ACP_FIELDS } from '@repo/acp-types/src/acp-fields';
import './FieldMapping.css';

interface FieldMappingProps {
  mappings: Array<{
    source: string;
    target: string;
    confidence: number;
  }>;
  unmappedColumns?: string[];
  onMappingChange?: (mappings: Array<{ source: string; target: string }>) => void;
}

export function FieldMapping({ mappings, unmappedColumns = [], onMappingChange }: FieldMappingProps) {
  const [localMappings, setLocalMappings] = useState(mappings);
  const [editedMappings, setEditedMappings] = useState<Set<string>>(new Set());

  if (mappings.length === 0 && unmappedColumns.length === 0) {
    return null;
  }

  // Get field category/requirement level
  const getFieldCategory = (fieldName: string): 'required' | 'recommended' | 'optional' => {
    const field = ACP_FIELDS.find((f) => f.name === fieldName);
    if (!field) return 'optional';
    if (field.required) return 'required';
    if (field.category === 'recommended') return 'recommended';
    return 'optional';
  };

  // Get all ACP field options for dropdown
  const acpFieldOptions = ACP_FIELDS.map((field) => ({
    value: field.name,
    label: `${field.label} (${field.name})`,
    category: field.required ? 'required' : field.category === 'recommended' ? 'recommended' : 'optional',
  }));

  // Add "Unmapped" option
  const allOptions = [
    { value: '', label: '-- Unmapped --', category: 'unmapped' },
    ...acpFieldOptions,
  ];

  const handleMappingChange = (source: string, newTarget: string, originalMapping: any) => {
    const updated = localMappings.map((m) =>
      m.source === source
        ? { ...m, target: newTarget, confidence: newTarget === originalMapping.target ? originalMapping.confidence : 0.5 }
        : m
    );
    setLocalMappings(updated);
    setEditedMappings(new Set(editedMappings).add(source));

    if (onMappingChange) {
      onMappingChange(updated.filter(m => m.target).map(({ source, target }) => ({ source, target })));
    }
  };

  const handleUnmapField = (source: string) => {
    const updated = localMappings.map((m) =>
      m.source === source ? { ...m, target: '', confidence: 0 } : m
    );
    setLocalMappings(updated);
    setEditedMappings(new Set(editedMappings).add(source));

    if (onMappingChange) {
      onMappingChange(updated.filter(m => m.target).map(({ source, target }) => ({ source, target })));
    }
  };

  // Get missing required fields
  const mappedTargets = new Set(localMappings.filter(m => m.target).map((m) => m.target));
  const requiredFields = ACP_FIELDS.filter((f) => f.required);
  const missingRequired = requiredFields.filter((f) => !mappedTargets.has(f.name));

  return (
    <div className="field-mapping">
      <div className="mapping-header">
        <h3>Field Mapping</h3>
        <p className="mapping-description">
          AI-powered column mapping to ACP format. Review and adjust mappings as needed.
        </p>
      </div>

      {/* Missing Required Fields Alert */}
      {missingRequired.length > 0 && (
        <div className="missing-required-alert">
          <strong>⚠ Missing Required Fields ({missingRequired.length})</strong>
          <p>The following required ACP fields are not mapped:</p>
          <ul>
            {missingRequired.map((field) => (
              <li key={field.name}>
                <code>{field.name}</code> - {field.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mapped Fields */}
      {localMappings.filter(m => m.target).length > 0 && (
        <div className="mapped-fields-section">
          <h4>Mapped Fields ({localMappings.filter(m => m.target).length})</h4>
          <div className="mapping-grid">
            {localMappings
              .filter((m) => m.target)
              .map((mapping, index) => {
                const category = getFieldCategory(mapping.target);
                const wasEdited = editedMappings.has(mapping.source);

                return (
                  <div key={index} className={`mapping-item ${category}`}>
                    <div className="mapping-source">
                      <span className="mapping-label">CSV Column:</span>
                      <code>{mapping.source}</code>
                    </div>

                    <div className="mapping-arrow">→</div>

                    <div className="mapping-target">
                      <span className="mapping-label">
                        ACP Field {category === 'required' && <span className="required-badge">Required</span>}
                        {category === 'recommended' && <span className="recommended-badge">Recommended</span>}
                      </span>
                      <select
                        value={mapping.target}
                        onChange={(e) => handleMappingChange(mapping.source, e.target.value, mapping)}
                        className="target-selector"
                      >
                        {allOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mapping-confidence">
                      <div className="confidence-bar">
                        <div
                          className="confidence-fill"
                          style={{
                            width: `${mapping.confidence * 100}%`,
                            backgroundColor:
                              mapping.confidence > 0.8
                                ? '#27ae60'
                                : mapping.confidence > 0.6
                                ? '#f39c12'
                                : '#e67e22',
                          }}
                        ></div>
                      </div>
                      <span className="confidence-text">
                        {wasEdited ? 'Edited' : `${Math.round(mapping.confidence * 100)}% confidence`}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Unmapped Columns */}
      {unmappedColumns.length > 0 && (
        <div className="unmapped-columns-section">
          <h4>Unmapped CSV Columns ({unmappedColumns.length})</h4>
          <p className="section-description">
            These columns from your CSV weren't automatically mapped. You can manually map them if needed.
          </p>
          <div className="unmapped-list">
            {unmappedColumns.map((column, index) => (
              <div key={index} className="unmapped-item">
                <div className="unmapped-column">
                  <code>{column}</code>
                </div>
                <div className="unmapped-actions">
                  <select className="target-selector" defaultValue="">
                    <option value="">-- Select ACP field to map --</option>
                    {acpFieldOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Field Legend */}
      <div className="mapping-legend">
        <div className="legend-item">
          <span className="legend-color required"></span>
          <span>Required Field</span>
        </div>
        <div className="legend-item">
          <span className="legend-color recommended"></span>
          <span>Recommended Field</span>
        </div>
        <div className="legend-item">
          <span className="legend-color optional"></span>
          <span>Optional Field</span>
        </div>
      </div>
    </div>
  );
}
