import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GenerationSummary {
  totalProducts: number;
  productsEnhanced: number;
  fieldsGenerated: number;
  requiredFieldsGenerated: number;
  recommendedFieldsGenerated: number;
  processingTime: number;
}

export interface GenerationError {
  productIndex: number;
  productId?: string;
  error: string;
}

export interface ProductChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

export interface FieldGenerationPanelProps {
  isGenerating: boolean;
  isAvailable: boolean;
  hasGeneratedFields: boolean;
  summary?: GenerationSummary;
  errors?: GenerationError[];
  changes?: Array<{ productKey: string; changes: ProductChange[] }>;
  onGenerate: () => void;
  onViewChanges?: () => void;
}

export const FieldGenerationPanel: React.FC<FieldGenerationPanelProps> = ({
  isGenerating,
  isAvailable,
  hasGeneratedFields,
  summary,
  errors,
  changes,
  onGenerate,
  onViewChanges,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  return (
    <div className="field-generation-panel bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Automatic Field Generation</h3>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered generation of missing required and recommended fields
          </p>
        </div>

        {!hasGeneratedFields && (
          <button
            onClick={onGenerate}
            disabled={isGenerating || !isAvailable}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              isGenerating
                ? 'bg-blue-400 text-white cursor-wait'
                : isAvailable
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Fields...
              </span>
            ) : (
              'Generate Missing Fields'
            )}
          </button>
        )}
      </div>

      {!isAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Field generation is not available
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Please configure the OPENROUTER_API_KEY environment variable to enable AI-powered
                field generation.
              </p>
            </div>
          </div>
        </div>
      )}

      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                AI is analyzing your products and generating missing fields...
              </p>
              <p className="text-xs text-blue-700 mt-1">This may take a few moments</p>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {hasGeneratedFields && summary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Success Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    Field generation completed successfully!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Generated {summary.fieldsGenerated} fields across {summary.productsEnhanced}{' '}
                    products in {formatTime(summary.processingTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Fields</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{summary.fieldsGenerated}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">Required</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {summary.requiredFieldsGenerated}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-600 font-medium">Recommended</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {summary.recommendedFieldsGenerated}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Products Enhanced</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{summary.productsEnhanced}</p>
              </div>
            </div>

            {/* Errors Section */}
            {errors && errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 mb-2">
                  {errors.length} product{errors.length > 1 ? 's' : ''} could not be enhanced:
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.slice(0, 3).map((error, idx) => (
                    <li key={idx}>
                      Product {error.productIndex + 1}
                      {error.productId && ` (${error.productId})`}: {error.error}
                    </li>
                  ))}
                  {errors.length > 3 && (
                    <li className="text-red-600 font-medium">...and {errors.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}

            {/* View Details Button */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                {showDetails ? 'Hide Details' : 'View Details'}
              </button>
              {onViewChanges && changes && changes.length > 0 && (
                <button
                  onClick={onViewChanges}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  Review All Changes
                </button>
              )}
            </div>

            {/* Details Section */}
            <AnimatePresence>
              {showDetails && changes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Generated Field Details
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {changes.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Product: {item.productKey}
                        </p>
                        <ul className="space-y-1">
                          {item.changes.map((change, changeIdx) => (
                            <li key={changeIdx} className="text-xs text-gray-600">
                              <span className="font-mono font-medium text-blue-600">
                                {change.field}
                              </span>
                              : {String(change.newValue).substring(0, 50)}
                              {String(change.newValue).length > 50 && '...'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {changes.length > 10 && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        ...and {changes.length - 10} more products
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
