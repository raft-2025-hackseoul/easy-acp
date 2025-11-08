import { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import './APIValidatorPage.css';

export function APIValidatorPage() {
  const { workflow, workflowData, updateStep, updateAPIValidator, currentUser } = useWorkflow();
  const [apiResponse, setApiResponse] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);

  const apiValidatorStep = workflow.steps.find((s) => s.tool === 'api-validator');

  const handleMarkAsCreated = () => {
    updateAPIValidator({
      apiCreated: true,
      status: 'in-progress',
      completedBy: currentUser,
      completedAt: new Date(),
    });

    if (apiValidatorStep) {
      updateStep(apiValidatorStep.id, {
        status: 'in-progress',
        completedBy: currentUser,
        completedAt: new Date(),
      });
    }
  };

  const validateAPIResponse = () => {
    try {
      const parsed = JSON.parse(apiResponse);

      const errors: string[] = [];

      // Check for required ACP fields
      if (!parsed.items || !Array.isArray(parsed.items)) {
        errors.push('Response must contain an "items" array');
      }

      if (parsed.items && parsed.items.length > 0) {
        const item = parsed.items[0];
        const requiredFields = ['id', 'title', 'description', 'price', 'availability'];

        requiredFields.forEach((field) => {
          if (!item[field]) {
            errors.push(`Missing required field: "${field}"`);
          }
        });
      }

      const isValid = errors.length === 0;

      setValidationResult({ isValid, errors });

      if (isValid) {
        updateAPIValidator({
          apiResponse,
          isValid: true,
          validationErrors: [],
          status: 'verified',
        });

        if (apiValidatorStep) {
          updateStep(apiValidatorStep.id, {
            status: 'verified',
          });
        }
      } else {
        updateAPIValidator({
          apiResponse,
          isValid: false,
          validationErrors: errors,
          status: 'in-progress',
        });
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ['Invalid JSON format'],
      });
    }
  };

  return (
    <div className="api-validator-page">
      <div className="page-header">
        <h1>🔌 API Validator</h1>
        <p className="page-subtitle">
          Create and validate your ACP-compliant API endpoints
        </p>
      </div>

      {/* Step 1 */}
      <div className="api-step">
        <div className="step-header">
          <h2>Step 1: Create Your API</h2>
          {workflowData.apiValidator.apiCreated && (
            <span className="step-badge completed">✓ Completed</span>
          )}
        </div>

        <div className="step-content">
          <p>
            Create an ACP-compliant API endpoint that returns your product catalog in the correct
            format.
          </p>

          <div className="code-example">
            <h4>Example API Response Format:</h4>
            <pre>
              <code>
                {`{
  "items": [
    {
      "id": "product-123",
      "title": "Product Name",
      "description": "Product description",
      "price": "99.99 USD",
      "availability": "in_stock",
      "image_link": "https://example.com/image.jpg",
      "brand": "Brand Name"
    }
  ]
}`}
              </code>
            </pre>
          </div>

          {!workflowData.apiValidator.apiCreated ? (
            <button onClick={handleMarkAsCreated} className="primary-button">
              Mark API as Created
            </button>
          ) : (
            <div className="completion-info">
              <p>
                <strong>Completed by:</strong> {workflowData.apiValidator.completedBy?.name}
              </p>
              {workflowData.apiValidator.completedAt && (
                <p>
                  <strong>Completed on:</strong>{' '}
                  {new Date(workflowData.apiValidator.completedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step 2 */}
      <div className="api-step">
        <div className="step-header">
          <h2>Step 2: Validate API Response</h2>
          {workflowData.apiValidator.isValid && (
            <span className="step-badge verified">✓✓ Verified</span>
          )}
        </div>

        <div className="step-content">
          <p>Paste your API response below to verify it follows the correct ACP format:</p>

          <textarea
            className="api-response-input"
            placeholder='Paste your API JSON response here... {"items": [...]}'
            value={apiResponse}
            onChange={(e) => setApiResponse(e.target.value)}
            rows={12}
          ></textarea>

          <button
            onClick={validateAPIResponse}
            className="primary-button"
            disabled={!apiResponse.trim()}
          >
            Validate API Response
          </button>

          {validationResult && (
            <div className={`validation-result ${validationResult.isValid ? 'valid' : 'invalid'}`}>
              {validationResult.isValid ? (
                <div className="success-message">
                  <h3>✓ API Response is Valid!</h3>
                  <p>Your API response follows the correct ACP format.</p>
                </div>
              ) : (
                <div className="error-message">
                  <h3>⚠ Validation Errors</h3>
                  <ul>
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="api-resources">
        <h3>📚 Resources</h3>
        <ul>
          <li>
            <a
              href="https://developers.openai.com/commerce/guides/get-started"
              target="_blank"
              rel="noopener noreferrer"
            >
              ACP API Documentation
            </a>
          </li>
          <li>
            <a
              href="https://developers.openai.com/commerce/specs/feed"
              target="_blank"
              rel="noopener noreferrer"
            >
              Product Feed Specification
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
