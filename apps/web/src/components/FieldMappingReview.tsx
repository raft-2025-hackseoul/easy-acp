import { useState, useEffect } from 'react';
import './FieldMappingReview.css';

interface FieldMapping {
  source: string;
  target: string;
  confidence?: number;
}

interface FieldMappingReviewProps {
  mappings: FieldMapping[];
  availableCSVFields: string[];
  missingRequired: string[];
  missingRecommended: string[];
  onMappingChange: (oldSource: string, newSource: string, target: string) => void;
  onSaveMappings: () => void;
  onFieldsUpdate?: (filledFields: string[]) => void;
}

export function FieldMappingReview({
  mappings,
  availableCSVFields,
  missingRequired,
  missingRecommended,
  onMappingChange,
  onSaveMappings,
  onFieldsUpdate,
}: FieldMappingReviewProps) {
  const [localMappings, setLocalMappings] = useState<FieldMapping[]>(mappings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalMappings(mappings);
  }, [mappings]);

  // Update parent with filled fields count
  useEffect(() => {
    if (onFieldsUpdate) {
      const filledFields = localMappings
        .filter((m) => m.source && m.source !== '')
        .map((m) => m.target);
      onFieldsUpdate(filledFields);
    }
  }, [localMappings, onFieldsUpdate]);

  // Categorize fields - MISSING REQUIRED FIRST
  const unmappedRequired = missingRequired.filter(
    (field) => !localMappings.some((m) => m.target === field && m.source)
  );

  const mappedFields = localMappings.filter((m) => m.source && m.source !== '');

  const unmappedRecommended = missingRecommended.filter(
    (field) => !localMappings.some((m) => m.target === field && m.source)
  );

  // Get available fields that aren't already mapped
  const getAvailableFieldsForTarget = (currentSource: string) => {
    const usedFields = localMappings
      .filter((m) => m.source && m.source !== currentSource)
      .map((m) => m.source);
    return availableCSVFields.filter((f) => !usedFields.includes(f));
  };

  const handleMappingChange = (target: string, newSource: string) => {
    const oldMapping = localMappings.find((m) => m.target === target);
    const oldSource = oldMapping?.source || '';

    setLocalMappings((prev) =>
      prev.map((m) => (m.target === target ? { ...m, source: newSource } : m))
    );

    onMappingChange(oldSource, newSource, target);
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Field mappings saved:', localMappings);
    onSaveMappings();
    setHasChanges(false);
  };

  return (
    <div className="field-mapping-review-minimal">
      <div className="mapping-header-minimal">
        <h3>Field Mapping</h3>
        <p>Map your data fields to ACP standard</p>
      </div>

      {/* Missing Required Fields - FIRST */}
      {unmappedRequired.length > 0 && (
        <div className="mapping-section-minimal">
          <div className="section-header-minimal required">
            <h4>Required Fields</h4>
            <span className="count-badge required">{unmappedRequired.length}</span>
          </div>
          <div className="mapping-list-minimal">
            {unmappedRequired.map((field) => {
              const mapping = localMappings.find((m) => m.target === field);
              return (
                <div key={field} className="mapping-row missing">
                  <div className="mapping-fields">
                    <div className="field-info">
                      <code className="field-name">{field}</code>
                      <span className="field-type-badge required">Required</span>
                    </div>
                    <div className="mapping-arrow">←</div>
                    <select
                      className="field-select"
                      value={mapping?.source || ''}
                      onChange={(e) => handleMappingChange(field, e.target.value)}
                    >
                      <option value="">Select field...</option>
                      {getAvailableFieldsForTarget(mapping?.source || '').map((csvField) => (
                        <option key={csvField} value={csvField}>
                          {csvField}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Matched Fields */}
      {mappedFields.length > 0 && (
        <div className="mapping-section-minimal">
          <div className="section-header-minimal matched">
            <h4>Mapped Fields</h4>
            <span className="count-badge matched">{mappedFields.length}</span>
          </div>
          <div className="mapping-list-minimal">
            {mappedFields.map((mapping) => (
              <div key={mapping.target} className="mapping-row mapped">
                <div className="mapping-fields">
                  <div className="field-info">
                    <code className="field-name">{mapping.target}</code>
                  </div>
                  <div className="mapping-arrow">←</div>
                  <select
                    className="field-select"
                    value={mapping.source}
                    onChange={(e) => handleMappingChange(mapping.target, e.target.value)}
                  >
                    <option value={mapping.source}>{mapping.source}</option>
                    {getAvailableFieldsForTarget(mapping.source).map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Recommended Fields */}
      {unmappedRecommended.length > 0 && (
        <div className="mapping-section-minimal">
          <div className="section-header-minimal recommended">
            <h4>Recommended Fields</h4>
            <span className="count-badge recommended">{unmappedRecommended.length}</span>
          </div>
          <div className="mapping-list-minimal">
            {unmappedRecommended.map((field) => {
              const mapping = localMappings.find((m) => m.target === field);
              return (
                <div key={field} className="mapping-row optional">
                  <div className="mapping-fields">
                    <div className="field-info">
                      <code className="field-name">{field}</code>
                      <span className="field-type-badge recommended">Recommended</span>
                    </div>
                    <div className="mapping-arrow">←</div>
                    <select
                      className="field-select"
                      value={mapping?.source || ''}
                      onChange={(e) => handleMappingChange(field, e.target.value)}
                    >
                      <option value="">Select field...</option>
                      {getAvailableFieldsForTarget(mapping?.source || '').map((csvField) => (
                        <option key={csvField} value={csvField}>
                          {csvField}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mapping-actions-minimal">
        <button className={`save-button ${hasChanges ? 'has-changes' : ''}`} onClick={handleSave}>
          {hasChanges ? 'Save Mappings' : 'Saved'}
        </button>
      </div>
    </div>
  );
}
