import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ValidationSummary } from './components/ValidationSummary';
import { FieldMapping } from './components/FieldMapping';
import { ExportOptions } from './components/ExportOptions';
import { PricingTiers } from './components/PricingTiers';
import { uploadCSV, UploadResponse } from './services/api';
import './App.css';

function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const result = await uploadCSV(file);
      setUploadResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setUploadResult(null);
    setError('');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🚀 Easy ACP</h1>
        <p className="tagline">Product Feed Automator for OpenAI Agentic Commerce</p>
      </header>

      <main className="app-main">
        <section className="intro-section">
          <p className="intro-text">
            Transform your product CSV into ACP-compliant feeds with AI-powered field mapping.
            <br />
            No technical knowledge required!
          </p>
        </section>

        <FileUpload onFileSelect={handleFileSelect} isUploading={isUploading} />

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

            <ExportOptions
              products={uploadResult.data.products}
              disabled={uploadResult.data.products.length === 0}
            />

            <div className="reset-section">
              <button onClick={handleReset} className="reset-button">
                Upload Another File
              </button>
            </div>
          </>
        )}

        <PricingTiers />
      </main>

      <footer className="app-footer">
        <p>
          Built with ❤️ for non-technical merchants | <a href="#docs">Documentation</a> |{' '}
          <a href="#support">Support</a>
        </p>
        <p className="footer-note">
          Powered by OpenAI Agentic Commerce Protocol (ACP) | Learn more at{' '}
          <a
            href="https://developers.openai.com/commerce"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenAI Commerce
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
