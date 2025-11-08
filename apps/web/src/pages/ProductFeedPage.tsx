import { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { ValidationSummary } from '../components/ValidationSummary';
import { FieldMapping } from '../components/FieldMapping';
import { ExportOptions } from '../components/ExportOptions';
import { uploadCSV, UploadResponse } from '../services/api';
import { useWorkflow } from '../context/WorkflowContext';
import './ProductFeedPage.css';

export function ProductFeedPage() {
  const { workflow, updateStep, updateProductFeed, currentUser } = useWorkflow();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>('');

  const productFeedStep = workflow.steps.find((s) => s.tool === 'product-feed');

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const result = await uploadCSV(file);
      setUploadResult(result);

      if (result.success && result.data) {
        updateProductFeed({
          status: 'in-progress',
          uploadedFile: file.name,
          validationResult: {
            totalRows: result.data.totalRows,
            validProducts: result.data.validProducts,
            invalidProducts: result.data.invalidProducts,
            missingRequired: result.data.validation.missingRequired,
            missingRecommended: result.data.validation.missingRecommended,
          },
        });

        if (productFeedStep) {
          updateStep(productFeedStep.id, {
            status: 'in-progress',
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = () => {
    updateProductFeed({
      status: 'completed',
      exportedFeed: true,
      completedBy: currentUser,
      completedAt: new Date(),
    });

    if (productFeedStep) {
      updateStep(productFeedStep.id, {
        status: 'completed',
        completedBy: currentUser,
        completedAt: new Date(),
      });
    }
  };

  const handleReset = () => {
    setUploadResult(null);
    setError('');
  };

  return (
    <div className="product-feed-page">
      <div className="page-header">
        <h1>Product Feed Automator</h1>
        <p className="page-subtitle">
          Transform your product CSV into ACP-compliant feeds with AI-powered field mapping
        </p>
      </div>

      {!uploadResult && <FileUpload onFileSelect={handleFileSelect} isUploading={isUploading} />}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {uploadResult && uploadResult.success && uploadResult.data && (
        <>
          <ValidationSummary
            validation={uploadResult.data.validation}
            totalRows={uploadResult.data.totalRows}
            validProducts={uploadResult.data.validProducts}
            invalidProducts={uploadResult.data.invalidProducts}
          />

          <FieldMapping mappings={uploadResult.data.fieldMappings} />

          <div onClick={handleExport}>
            <ExportOptions products={uploadResult.data.products} disabled={false} />
          </div>

          <div className="reset-section">
            <button onClick={handleReset} className="reset-button">
              Upload Another File
            </button>
          </div>
        </>
      )}
    </div>
  );
}
