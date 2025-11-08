import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ACPFieldMetadata } from '@repo/acp-types';
import './FieldMappingCard.css';

// Types
export interface ValidationMessage {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  suggestion?: string;
}

export interface FieldMapping {
  csvColumn: string;
  acpField: string;
  confidence: number;
  sampleData: string[];
  dataType?: string;
  uniqueValues?: number;
  nullCount?: number;
  totalCount?: number;
}

export interface FieldValidation {
  status: 'valid' | 'warning' | 'error';
  messages: ValidationMessage[];
}

export interface FieldResolution {
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface FieldMappingCardProps {
  field: ACPFieldMetadata & {
    chatgptUsage?: string;
    validationRules?: Array<{
      rule: string;
      value?: any;
      message: string;
    }>;
    bestPractices?: string[];
  };
  mapping: FieldMapping;
  validation: FieldValidation;
  resolution: FieldResolution;
  availableColumns?: string[];
  onResolve: (fieldName: string) => void;
  onEditMapping: (fieldName: string, newColumn: string) => void;
  onExpand?: (fieldName: string) => void;
}

type TabType = 'context' | 'validation' | 'data';

// Collapsed View Component
const CollapsedView: React.FC<{
  field: FieldMappingCardProps['field'];
  mapping: FieldMapping;
  resolution: FieldResolution;
  validation: FieldValidation;
  onToggle: () => void;
  isExpanded: boolean;
}> = ({ field, mapping, resolution, validation, onToggle, isExpanded }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  const getStatusIcon = () => {
    if (resolution.isResolved) return '✓';
    if (validation.status === 'error') return '✗';
    if (validation.status === 'warning') return '⚠️';
    return '○';
  };

  const getCategoryLabel = () => {
    if (field.required) return 'Required';
    if (field.category === 'recommended') return 'Recommended';
    return 'Optional';
  };

  const getCategoryClass = () => {
    if (field.required) return 'required';
    if (field.category === 'recommended') return 'recommended';
    return 'optional';
  };

  const formatSampleData = () => {
    const sample = mapping.sampleData[0];
    if (!sample) return 'No data available';
    return sample.length > 50 ? `${sample.substring(0, 50)}...` : sample;
  };

  return (
    <div
      className="collapsed-view"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`${field.label} field mapping. ${getCategoryLabel()}. Press Enter to expand details.`}
    >
      <div className="status-indicator">
        <span className={`status-badge ${getCategoryClass()}`}>{getCategoryLabel()}</span>
        <span
          className={`resolution-icon ${resolution.isResolved ? 'resolved' : ''} ${validation.status}`}
        >
          {getStatusIcon()}
        </span>
      </div>

      <div className="mapping-display">
        <code className="csv-column">{mapping.csvColumn || 'Not mapped'}</code>
        <span className="mapping-arrow">→</span>
        <code className="acp-field">{field.name}</code>
      </div>

      <div className="data-info">
        <div className="data-preview" title={mapping.sampleData[0]}>
          Sample: {formatSampleData()}
        </div>
        <div className="mapping-stats">
          {resolution.isResolved ? (
            <span className="resolved-label">✓ Resolved</span>
          ) : (
            <span className="unresolved-label">Needs review</span>
          )}
          {mapping.totalCount && (
            <span className="data-count">{mapping.totalCount.toLocaleString()} items</span>
          )}
        </div>
      </div>

      <button
        className="expand-toggle"
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={isExpanded ? 'rotated' : ''}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
};

// Context Tab Component
const ContextTab: React.FC<{
  field: FieldMappingCardProps['field'];
}> = ({ field }) => {
  return (
    <div className="tab-panel context-tab">
      <section className="info-section">
        <h4>Why This Field Matters</h4>
        <p>{field.description}</p>
        {field.chatgptUsage && (
          <>
            <h4>ChatGPT Usage</h4>
            <p>{field.chatgptUsage}</p>
          </>
        )}
      </section>

      <section className="info-section">
        <h4>Requirements</h4>
        <ul className="requirements-list">
          {field.required && <li>This field is required for all products</li>}
          {field.type === 'string' && field.description.includes('max') && (
            <li>{field.description.match(/max \d+ characters/)?.[0]}</li>
          )}
          {field.type === 'enum' && field.enumValues && (
            <li>Allowed values: {field.enumValues.join(', ')}</li>
          )}
          {field.validationRules?.map((rule, index) => (
            <li key={index}>{rule.message}</li>
          ))}
        </ul>
      </section>

      <section className="info-section">
        <h4>Good Example</h4>
        <div className="example-box">
          <code>{field.example}</code>
        </div>
      </section>

      {field.bestPractices && field.bestPractices.length > 0 && (
        <section className="info-section">
          <h4>Best Practices</h4>
          <ul className="best-practices-list">
            {field.bestPractices.map((practice, index) => (
              <li key={index}>{practice}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

// Validation Tab Component
const ValidationTab: React.FC<{
  validation: FieldValidation;
  mapping: FieldMapping;
}> = ({ validation, mapping }) => {
  const getStatusMessage = () => {
    switch (validation.status) {
      case 'valid':
        return 'All validation checks passed';
      case 'warning':
        return 'Some issues need attention';
      case 'error':
        return 'Critical issues found';
      default:
        return 'Validation pending';
    }
  };

  return (
    <div className="tab-panel validation-tab">
      <div className={`validation-status ${validation.status}`}>
        <h4>Validation Status</h4>
        <p>{getStatusMessage()}</p>
      </div>

      {validation.messages.length > 0 && (
        <div className="validation-messages">
          <h4>Issues Found</h4>
          {validation.messages.map((msg, index) => (
            <div key={index} className={`validation-message ${msg.type}`}>
              <span className="message-icon">
                {msg.type === 'error' ? '✗' : msg.type === 'warning' ? '⚠' : 'ℹ'}
              </span>
              <div className="message-content">
                <p className="message-text">{msg.message}</p>
                {msg.line && <span className="message-line">Line {msg.line}</span>}
                {msg.suggestion && (
                  <p className="message-suggestion">
                    <strong>Suggestion:</strong> {msg.suggestion}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {mapping.confidence < 1 && (
        <div className="confidence-info">
          <h4>Mapping Confidence</h4>
          <div className="confidence-meter">
            <div
              className="confidence-fill"
              style={{
                width: `${mapping.confidence * 100}%`,
                backgroundColor:
                  mapping.confidence > 0.8
                    ? '#28a745'
                    : mapping.confidence > 0.5
                      ? '#ffc107'
                      : '#dc3545',
              }}
            />
          </div>
          <p className="confidence-text">
            {Math.round(mapping.confidence * 100)}% confident in this mapping
          </p>
        </div>
      )}
    </div>
  );
};

// Data Tab Component
const DataTab: React.FC<{
  mapping: FieldMapping;
  field: FieldMappingCardProps['field'];
}> = ({ mapping, field }) => {
  const coverage =
    mapping.totalCount && mapping.nullCount !== undefined
      ? (((mapping.totalCount - mapping.nullCount) / mapping.totalCount) * 100).toFixed(1)
      : '100';

  return (
    <div className="tab-panel data-tab">
      <section className="data-section">
        <h4>Sample Values</h4>
        <div className="sample-values">
          {mapping.sampleData.length > 0 ? (
            mapping.sampleData.slice(0, 10).map((value, index) => (
              <div key={index} className="sample-value">
                <span className="sample-index">{index + 1}.</span>
                <code className="sample-text" title={value}>
                  {value.length > 100 ? `${value.substring(0, 100)}...` : value}
                </code>
              </div>
            ))
          ) : (
            <p className="no-data">No sample data available</p>
          )}
        </div>
      </section>

      <section className="data-section">
        <h4>Data Analysis</h4>
        <div className="data-stats">
          <div className="stat-item">
            <span className="stat-label">Data Type:</span>
            <span className="stat-value">{mapping.dataType || field.type}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Coverage:</span>
            <span className="stat-value">{coverage}%</span>
          </div>
          {mapping.uniqueValues !== undefined && (
            <div className="stat-item">
              <span className="stat-label">Unique Values:</span>
              <span className="stat-value">{mapping.uniqueValues.toLocaleString()}</span>
            </div>
          )}
          {mapping.totalCount !== undefined && (
            <div className="stat-item">
              <span className="stat-label">Total Records:</span>
              <span className="stat-value">{mapping.totalCount.toLocaleString()}</span>
            </div>
          )}
          {mapping.nullCount !== undefined && mapping.nullCount > 0 && (
            <div className="stat-item warning">
              <span className="stat-label">Empty Values:</span>
              <span className="stat-value">{mapping.nullCount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Expanded View Component
const ExpandedView: React.FC<{
  field: FieldMappingCardProps['field'];
  mapping: FieldMapping;
  validation: FieldValidation;
  activeTab: TabType;
  availableColumns?: string[];
  onTabChange: (tab: TabType) => void;
  onResolve: () => void;
  onEditMapping: (newColumn: string) => void;
  onClose: () => void;
}> = ({
  field,
  mapping,
  validation,
  activeTab,
  availableColumns,
  onTabChange,
  onResolve,
  onEditMapping,
  onClose,
}) => {
  const [isEditingMapping, setIsEditingMapping] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(mapping.csvColumn);

  const handleEditMapping = () => {
    setIsEditingMapping(true);
  };

  const handleSaveMapping = () => {
    onEditMapping(selectedColumn);
    setIsEditingMapping(false);
  };

  const handleCancelEdit = () => {
    setSelectedColumn(mapping.csvColumn);
    setIsEditingMapping(false);
  };

  return (
    <motion.div
      className="expanded-view"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, delay: 0.05 }}
    >
      <div className="expanded-header">
        <div className="field-info">
          <h3>{field.label}</h3>
          <p className="field-name">
            Field ID: <code>{field.name}</code>
          </p>
        </div>
        <button className="close-button" onClick={onClose} aria-label="Close expanded view">
          ✕
        </button>
      </div>

      <div className="mapping-info">
        {isEditingMapping ? (
          <div className="mapping-editor">
            <label htmlFor={`column-select-${field.name}`}>CSV Column:</label>
            <select
              id={`column-select-${field.name}`}
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="column-selector"
            >
              <option value="">-- Not Mapped --</option>
              {availableColumns?.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <button onClick={handleSaveMapping} className="save-button">
              Save
            </button>
            <button onClick={handleCancelEdit} className="cancel-button">
              Cancel
            </button>
          </div>
        ) : (
          <div className="current-mapping">
            <span>
              CSV Column: <code>{mapping.csvColumn || 'Not mapped'}</code>
            </span>
            <span className="mapping-arrow">→</span>
            <span>
              ACP Field: <code>{field.name}</code>
            </span>
          </div>
        )}
      </div>

      <div className="tab-navigation" role="tablist">
        <button
          className={`tab-button ${activeTab === 'context' ? 'active' : ''}`}
          onClick={() => onTabChange('context')}
          role="tab"
          aria-selected={activeTab === 'context'}
          aria-controls="context-panel"
        >
          Context
        </button>
        <button
          className={`tab-button ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => onTabChange('validation')}
          role="tab"
          aria-selected={activeTab === 'validation'}
          aria-controls="validation-panel"
        >
          Validation
        </button>
        <button
          className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => onTabChange('data')}
          role="tab"
          aria-selected={activeTab === 'data'}
          aria-controls="data-panel"
        >
          Data Preview
        </button>
      </div>

      <div className="tab-content" role="tabpanel">
        {activeTab === 'context' && <ContextTab field={field} />}
        {activeTab === 'validation' && <ValidationTab validation={validation} mapping={mapping} />}
        {activeTab === 'data' && <DataTab mapping={mapping} field={field} />}
      </div>

      <div className="action-bar">
        {!isEditingMapping && (
          <>
            <button
              className="action-button secondary"
              onClick={handleEditMapping}
              aria-label="Edit field mapping"
            >
              Edit Mapping
            </button>
            <button
              className="action-button primary"
              onClick={onResolve}
              disabled={validation.status === 'error'}
              aria-label="Mark field as resolved"
            >
              Mark as Resolved
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Main Component
export const FieldMappingCard: React.FC<FieldMappingCardProps> = ({
  field,
  mapping,
  validation,
  resolution,
  availableColumns,
  onResolve,
  onEditMapping,
  onExpand,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('context');
  const cardRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
    if (onExpand && !isExpanded) {
      onExpand(field.name);
    }
  }, [field.name, isExpanded, onExpand]);

  const handleResolve = useCallback(() => {
    onResolve(field.name);
    // Optionally close the expanded view after resolving
    // setIsExpanded(false);
  }, [field.name, onResolve]);

  const handleEditMapping = useCallback(
    (newColumn: string) => {
      onEditMapping(field.name, newColumn);
    },
    [field.name, onEditMapping]
  );

  const handleClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  // Handle Escape key to close expanded view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  const getCategoryClass = () => {
    if (field.required) return 'core';
    if (field.category === 'recommended') return 'recommended';
    return 'optional';
  };

  return (
    <motion.div
      ref={cardRef}
      className={`field-mapping-card ${getCategoryClass()} ${resolution.isResolved ? 'resolved' : ''} ${validation.status}`}
      layout
      initial={false}
      animate={{
        height: isExpanded ? 'auto' : 'auto',
        backgroundColor: resolution.isResolved ? '#F0FFF4' : '#FFFFFF',
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <CollapsedView
        field={field}
        mapping={mapping}
        resolution={resolution}
        validation={validation}
        onToggle={handleToggle}
        isExpanded={isExpanded}
      />

      <AnimatePresence>
        {isExpanded && (
          <ExpandedView
            field={field}
            mapping={mapping}
            validation={validation}
            activeTab={activeTab}
            availableColumns={availableColumns}
            onTabChange={setActiveTab}
            onResolve={handleResolve}
            onEditMapping={handleEditMapping}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
