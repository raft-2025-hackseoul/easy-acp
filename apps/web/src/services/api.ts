const API_BASE_URL = '/api';

export interface UploadResponse {
  success: boolean;
  data?: {
    totalRows: number;
    validProducts: number;
    invalidProducts: number;
    products: any[];
    fieldMappings: Array<{
      source: string;
      target: string;
      confidence: number;
    }>;
    validation: {
      missingRequired: string[];
      missingRecommended: string[];
      totalErrors: number;
      totalWarnings: number;
    };
  };
  error?: string;
}

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/product-feed/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

export async function exportCSV(products: any[]): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/product-feed/export/csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ products }),
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
}

export async function exportJSON(products: any[]): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/product-feed/export/json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ products }),
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
}

export async function getACPFields() {
  const response = await fetch(`${API_BASE_URL}/product-feed/fields`);

  if (!response.ok) {
    throw new Error('Failed to fetch ACP fields');
  }

  return response.json();
}

export interface LLMValidationStatus {
  available: boolean;
  message: string;
}

export interface LLMValidationIssue {
  field?: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface LLMValidationResult {
  isValid: boolean;
  overallScore: number;
  issues: LLMValidationIssue[];
  suggestions: string[];
  summary: string;
}

export interface BatchLLMValidationResult {
  totalProducts: number;
  validProducts: number;
  invalidProducts: number;
  results: Array<{
    product: any;
    validation: LLMValidationResult;
  }>;
  overallSummary: string;
}

export async function checkLLMValidationStatus(): Promise<LLMValidationStatus> {
  const response = await fetch(`${API_BASE_URL}/product-feed/llm/status`);

  if (!response.ok) {
    throw new Error('Failed to check LLM validation status');
  }

  const result = await response.json();
  return result.data;
}

export async function validateProductsWithLLM(
  products: any[]
): Promise<BatchLLMValidationResult> {
  const response = await fetch(`${API_BASE_URL}/product-feed/llm/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ products }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'LLM validation failed');
  }

  const result = await response.json();
  return result.data;
}

export async function validateProductWithLLM(product: any): Promise<LLMValidationResult> {
  const response = await fetch(`${API_BASE_URL}/product-feed/llm/validate-one`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'LLM validation failed');
  }

  const result = await response.json();
  return result.data;
}

export async function uploadCSVWithLLM(file: File): Promise<UploadResponse & {
  validation: {
    traditional: any;
    llm: BatchLLMValidationResult | null;
    hasLLMValidation: boolean;
  };
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/product-feed/upload-with-llm`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}
