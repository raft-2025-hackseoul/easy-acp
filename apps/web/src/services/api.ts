const API_BASE_URL = '/api';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok || (payload && payload.success === false)) {
    const errorMessage = payload?.error || response.statusText || 'Request failed';
    throw new Error(errorMessage);
  }

  if (payload && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

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

export async function validateProductsWithLLM(products: any[]): Promise<BatchLLMValidationResult> {
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

export async function uploadCSVWithLLM(file: File): Promise<
  UploadResponse & {
    validation: {
      traditional: any;
      llm: BatchLLMValidationResult | null;
      hasLLMValidation: boolean;
    };
  }
> {
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

export interface ProductChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

export interface ProductEnhancementResult {
  enhancedProduct: any;
  changes: ProductChange[];
  summary: string;
  qualityImprovement: number;
}

export async function enhanceProduct(product: any): Promise<ProductEnhancementResult> {
  const response = await fetch(`${API_BASE_URL}/product-feed/llm/enhance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Product enhancement failed');
  }

  const result = await response.json();
  return result.data;
}

export interface IssueResolutionResult {
  suggestedFix: {
    field: string;
    value: any;
    reason: string;
  };
  updatedProduct: any;
}

export async function resolveProductIssue(
  product: any,
  issue: LLMValidationIssue
): Promise<IssueResolutionResult> {
  const response = await fetch(`${API_BASE_URL}/product-feed/llm/resolve-issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product, issue }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Issue resolution failed');
  }

  const result = await response.json();
  return result.data;
}

// AI SEO API Functions

export interface TrendAnalysis {
  category: string;
  trends: string[];
  searchTerms: string[];
  competitiveInsights: string[];
  summary: string;
}

export interface FieldOptimization {
  field: string;
  currentValue: string;
  suggestedValue: string;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ProductOptimization {
  productId: string;
  productName: string;
  originalIndex: number; // Index in original products array
  optimizations: FieldOptimization[];
  overallScore: number;
  potentialImprovement: number;
}

export type ProviderRoadmapStep = 'connect' | 'fetch' | 'map' | 'seo' | 'push' | 'completed';

export interface ProviderFieldMapping {
  providerField: string;
  openAIField: string;
  description?: string;
  required?: boolean;
}

export interface ProviderValidationSummary {
  status: 'idle' | 'validating' | 'complete' | 'error';
  summary?: string;
  issues?: LLMValidationIssue[];
  warnings?: string[];
  errors?: string[];
}

export interface ProviderFeedSnapshot {
  products: any[];
  total: number;
  syncId: string;
  syncedAt: string;
}

export interface ProviderSuggestionsState {
  generatedAt: string | null;
  summary?: string;
  productOptimizations: ProductOptimization[];
}

export interface ProviderPushStatus {
  lastPushedAt: string;
  destinationUrl: string;
  totalProducts: number;
  payloadSample?: any;
}

export interface ProviderSyncState {
  provider: 'woocommerce' | null;
  token: string | null;
  merchantUrl: string | null;
  roadmapStep: ProviderRoadmapStep;
  feed: ProviderFeedSnapshot | null;
  mapping: ProviderFieldMapping[];
  validation: ProviderValidationSummary;
  suggestions: ProviderSuggestionsState;
  overrides: Record<string, Record<string, string>>;
  pushStatus: ProviderPushStatus | null;
  lastUpdatedAt: string | null;
}

export interface AISEOAnalysisResult {
  success: boolean;
  data?: {
    totalProducts: number;
    trendAnalysis: TrendAnalysis;
    productOptimizations: ProductOptimization[];
    originalProducts: any[]; // Original CSV data
    summary: string;
    timestamp: string;
  };
  error?: string;
}

export async function analyzeProductsForSEO(file: File): Promise<AISEOAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/ai-seo/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI SEO analysis failed');
  }

  return response.json();
}

export async function applyOptimizations(
  productOptimizations: ProductOptimization[]
): Promise<{ optimizedProducts: any[]; csvBlob: Blob }> {
  const response = await fetch(`${API_BASE_URL}/ai-seo/apply-optimizations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productOptimizations }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to apply optimizations');
  }

  const result = await response.json();
  return result.data;
}

export async function exportOptimizedCSV(optimizedProducts: any[]): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/ai-seo/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ products: optimizedProducts }),
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
}

// Provider sync demo APIs

export async function getProviderSyncState(): Promise<ProviderSyncState> {
  return apiRequest<ProviderSyncState>('/provider-sync/state');
}

export async function resetProviderSync(): Promise<ProviderSyncState> {
  return apiRequest<ProviderSyncState>('/provider-sync/reset', { method: 'POST' });
}

export async function connectProvider(
  provider: 'woocommerce',
  token: string
): Promise<ProviderSyncState> {
  return apiRequest<ProviderSyncState>('/provider-sync/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ provider, token }),
  });
}

export async function fetchProviderFeed(): Promise<{ feed: ProviderFeedSnapshot | null }> {
  return apiRequest<{ feed: ProviderFeedSnapshot | null }>('/provider-sync/fetch', {
    method: 'POST',
  });
}

export async function mapProviderFeed(): Promise<{
  mapping: ProviderFieldMapping[];
  validation: ProviderValidationSummary;
}> {
  return apiRequest<{ mapping: ProviderFieldMapping[]; validation: ProviderValidationSummary }>(
    '/provider-sync/map',
    {
      method: 'POST',
    }
  );
}

export async function generateProviderSuggestions(): Promise<ProviderSuggestionsState> {
  return apiRequest<ProviderSuggestionsState>('/provider-sync/suggestions/generate', {
    method: 'POST',
  });
}

export async function getProviderSuggestions(): Promise<ProviderSuggestionsState> {
  return apiRequest<ProviderSuggestionsState>('/provider-sync/suggestions');
}

export async function setMerchantUrl(merchantUrl: string): Promise<ProviderSyncState> {
  return apiRequest<ProviderSyncState>('/provider-sync/merchant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ merchantUrl }),
  });
}

export async function acceptSuggestion(
  productId: string,
  field: string,
  value: string
): Promise<ProviderSyncState> {
  return apiRequest<ProviderSyncState>('/provider-sync/suggestions/accept', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, field, value }),
  });
}

export async function removeSuggestion(
  productId: string,
  field: string
): Promise<ProviderSyncState> {
  return apiRequest<ProviderSyncState>('/provider-sync/suggestions/remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, field }),
  });
}

export async function pushToMerchant(): Promise<ProviderSyncState> {
  return apiRequest<ProviderSyncState>('/provider-sync/push', {
    method: 'POST',
  });
}
