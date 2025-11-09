import { useState, useMemo } from 'react';
import { ACP_FIELDS } from '@repo/acp-types/src/acp-fields';
import type { ACPFieldMetadata } from '@repo/acp-types';
import { FieldMappingCard } from './FieldMappingCard/FieldMappingCard';
import type {
  FieldMapping as FieldMappingType,
  FieldValidation,
  FieldResolution,
} from './FieldMappingCard/FieldMappingCard';
import './FieldMapping.css';

interface FieldMappingProps {
  mappings: Array<{
    source?: string;
    sourceField?: string;
    target?: string;
    targetField?: string;
    confidence: number;
    sampleData?: string[];
  }>;
  unmappedColumns?: string[];
  onMappingChange?: (mappings: Array<{ source: string; target: string }>) => void;
}

export function FieldMapping({
  mappings,
  unmappedColumns = [],
  onMappingChange,
}: FieldMappingProps) {
  const [resolvedFields, setResolvedFields] = useState<Set<string>>(new Set());
  const [editedMappings, setEditedMappings] = useState<
    Record<string, { csvColumn: string; acpField: string }>
  >({});

  // Normalize mappings to handle both formats (source/target and sourceField/targetField)
  const normalizedMappings = useMemo(() => {
    return mappings.map((m) => ({
      source: m.source || m.sourceField || '',
      target: m.target || m.targetField || '',
      confidence: m.confidence,
      sampleData: m.sampleData || [],
    }));
  }, [mappings]);

  // Get all CSV columns for the dropdown
  const availableColumns = useMemo(() => {
    const csvColumns = normalizedMappings.map((m) => m.source).filter(Boolean);
    return [...csvColumns, ...unmappedColumns];
  }, [normalizedMappings, unmappedColumns]);

  // Group fields by category
  const fieldsByCategory = useMemo(() => {
    const mapped = new Map(normalizedMappings.filter((m) => m.target).map((m) => [m.target, m]));

    const required: typeof normalizedMappings = [];
    const recommended: typeof normalizedMappings = [];
    const optional: typeof normalizedMappings = [];
    const missing: ACPFieldMetadata[] = [];

    ACP_FIELDS.forEach((field) => {
      const mapping = mapped.get(field.name);

      if (mapping) {
        if (field.required) {
          required.push(mapping);
        } else if (field.category === 'recommended') {
          recommended.push(mapping);
        } else {
          optional.push(mapping);
        }
      } else if (field.required) {
        missing.push(field);
      }
    });

    return { required, recommended, optional, missing };
  }, [normalizedMappings]);

  const handleResolve = (fieldName: string) => {
    setResolvedFields((prev) => {
      const newSet = new Set(prev);
      newSet.add(fieldName);
      return newSet;
    });
  };

  const handleEditMapping = (fieldName: string, newColumn: string) => {
    setEditedMappings((prev) => ({
      ...prev,
      [fieldName]: { csvColumn: newColumn, acpField: fieldName },
    }));

    // Notify parent of the change
    if (onMappingChange) {
      const updatedMappings = normalizedMappings.map((m) => {
        if (m.target === fieldName) {
          return { source: newColumn, target: fieldName };
        }
        return { source: m.source, target: m.target };
      });
      onMappingChange(updatedMappings);
    }
  };

  const createFieldMappingData = (mapping: (typeof normalizedMappings)[0]): FieldMappingType => {
    const edited = editedMappings[mapping.target];

    return {
      csvColumn: edited?.csvColumn || mapping.source,
      acpField: mapping.target,
      confidence: edited ? 0.5 : mapping.confidence,
      sampleData: mapping.sampleData || [],
      totalCount: mapping.sampleData?.length || 0,
      nullCount: 0,
    };
  };

  const createValidation = (
    mapping: (typeof normalizedMappings)[0],
    field: ACPFieldMetadata
  ): FieldValidation => {
    const messages: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
      suggestion?: string;
    }> = [];

    // Check for low confidence
    if (mapping.confidence < 0.6) {
      messages.push({
        type: 'warning' as const,
        message: 'Low confidence mapping. Please verify this is correct.',
        suggestion: 'Review the sample data to ensure the mapping makes sense.',
      });
    }

    // Check for missing data
    if (!mapping.sampleData || mapping.sampleData.length === 0) {
      messages.push({
        type: 'warning' as const,
        message: 'No sample data available for validation.',
      });
    }

    // Check for required fields
    if (field.required && !mapping.source) {
      messages.push({
        type: 'error' as const,
        message: 'This is a required field and must be mapped.',
        suggestion: 'Select a CSV column that contains this information.',
      });
    }

    return {
      status: messages.some((m) => m.type === 'error')
        ? 'error'
        : messages.some((m) => m.type === 'warning')
          ? 'warning'
          : 'valid',
      messages,
    };
  };

  const createResolution = (fieldName: string): FieldResolution => {
    return {
      isResolved: resolvedFields.has(fieldName),
      resolvedAt: resolvedFields.has(fieldName) ? new Date() : undefined,
    };
  };

  const renderFieldCards = (mappings: typeof normalizedMappings) => {
    return mappings.map((mapping) => {
      const field = ACP_FIELDS.find((f) => f.name === mapping.target);
      if (!field) return null;

      const enhancedField: ACPFieldMetadata & {
        chatgptUsage?: string;
        validationRules?: Array<{ rule: string; value?: unknown; message: string }>;
        bestPractices?: string[];
      } = {
        ...field,
        chatgptUsage: `This field helps ChatGPT ${field.required ? 'accurately display and process' : 'better understand'} your products.`,
      };

      return (
        <FieldMappingCard
          key={mapping.target}
          field={enhancedField}
          mapping={createFieldMappingData(mapping)}
          validation={createValidation(mapping, field)}
          resolution={createResolution(mapping.target)}
          availableColumns={availableColumns}
          onResolve={handleResolve}
          onEditMapping={handleEditMapping}
        />
      );
    });
  };

  if (mappings.length === 0 && unmappedColumns.length === 0) {
    return null;
  }

  const totalMapped = normalizedMappings.filter((m) => m.target).length;
  const totalResolved = resolvedFields.size;

  return (
    <div className="field-mapping">
      <div className="mapping-header">
        <h3>Field Mapping Review</h3>
        <p className="mapping-description">
          AI has mapped {totalMapped} columns to ACP fields. Review each mapping and mark as
          resolved when verified.
        </p>
        <div className="mapping-stats">
          <span className="stat">
            <strong>{totalMapped}</strong> mapped
          </span>
          <span className="stat">
            <strong>{totalResolved}</strong> resolved
          </span>
          <span className="stat">
            <strong>{fieldsByCategory.missing.length}</strong> missing required
          </span>
        </div>
      </div>

      {/* Missing Required Fields Alert */}
      {fieldsByCategory.missing.length > 0 && (
        <div className="missing-required-alert">
          <strong>⚠ Missing Required Fields ({fieldsByCategory.missing.length})</strong>
          <p>The following required ACP fields are not mapped:</p>
          <ul>
            {fieldsByCategory.missing.map((field) => (
              <li key={field.name}>
                <code>{field.name}</code> - {field.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Fields Section */}
      {fieldsByCategory.required.length > 0 && (
        <div className="field-category-section">
          <h4 className="category-header">
            <span className="category-badge required">Required</span>
            Required Fields ({fieldsByCategory.required.length})
          </h4>
          <div className="field-cards-container">{renderFieldCards(fieldsByCategory.required)}</div>
        </div>
      )}

      {/* Recommended Fields Section */}
      {fieldsByCategory.recommended.length > 0 && (
        <div className="field-category-section">
          <h4 className="category-header">
            <span className="category-badge recommended">Recommended</span>
            Recommended Fields ({fieldsByCategory.recommended.length})
          </h4>
          <div className="field-cards-container">
            {renderFieldCards(fieldsByCategory.recommended)}
          </div>
        </div>
      )}

      {/* Optional Fields Section */}
      {fieldsByCategory.optional.length > 0 && (
        <div className="field-category-section optional-section">
          <h4 className="category-header">
            <span className="category-badge optional">Optional</span>
            Optional Fields ({fieldsByCategory.optional.length})
          </h4>
          <div className="field-cards-container">{renderFieldCards(fieldsByCategory.optional)}</div>
        </div>
      )}

      {/* Unmapped Columns */}
      {unmappedColumns.length > 0 && (
        <div className="unmapped-columns-section">
          <h4>Unmapped CSV Columns ({unmappedColumns.length})</h4>
          <p className="section-description">
            These columns weren't automatically mapped. They can be mapped manually if needed.
          </p>
          <div className="unmapped-list">
            {unmappedColumns.map((column, index) => (
              <div key={index} className="unmapped-item">
                <code>{column}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
