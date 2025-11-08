import { useState } from 'react';
import { exportCSV, exportJSON } from '../services/api';
import './ExportOptions.css';

interface ExportOptionsProps {
  products: any[];
  disabled: boolean;
}

export function ExportOptions({ products, disabled }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    if (disabled || isExporting || products.length === 0) return;

    setIsExporting(true);
    try {
      const blob = format === 'csv' ? await exportCSV(products) : await exportJSON(products);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acp-product-feed.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export products');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-options">
      <h3>📥 Export Your ACP Feed</h3>
      <p className="export-description">Download your ACP-compliant product feed in your preferred format:</p>

      <div className="export-buttons">
        <button
          onClick={() => handleExport('csv')}
          disabled={disabled || isExporting || products.length === 0}
          className="export-button csv"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <span>Export as CSV</span>
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={disabled || isExporting || products.length === 0}
          className="export-button json"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M10 12h4" />
            <path d="M10 16h4" />
          </svg>
          <span>Export as JSON</span>
        </button>
      </div>
    </div>
  );
}
