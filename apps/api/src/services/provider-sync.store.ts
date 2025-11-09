import { MockWooCommerceProduct } from './mock-woocommerce.service';
import { LLMValidationIssue } from './llm-validator.service';
import { ProductOptimization } from './ai-seo.service';

export type ProviderType = 'woocommerce';

export interface FieldMapping {
  providerField: string;
  openAIField: string;
  description?: string;
  required?: boolean;
}

export interface ValidationSummary {
  status: 'idle' | 'validating' | 'complete' | 'error';
  summary?: string;
  issues?: LLMValidationIssue[];
  warnings?: string[];
  errors?: string[];
}

export interface FeedSnapshot {
  products: MockWooCommerceProduct[];
  total: number;
  syncId: string;
  syncedAt: string;
}

export interface PushStatus {
  lastPushedAt: string;
  destinationUrl: string;
  totalProducts: number;
  payloadSample?: any;
}

export type SuggestionOverrideMap = Record<string, Record<string, string>>;

export interface ProviderSyncState {
  provider: ProviderType | null;
  token: string | null;
  merchantUrl: string | null;
  roadmapStep: 'connect' | 'fetch' | 'map' | 'seo' | 'push' | 'completed';
  feed: FeedSnapshot | null;
  mapping: FieldMapping[];
  validation: ValidationSummary;
  suggestions: {
    generatedAt: string | null;
    productOptimizations: ProductOptimization[];
    summary?: string;
  };
  overrides: SuggestionOverrideMap;
  pushStatus: PushStatus | null;
  lastUpdatedAt: string | null;
}

const defaultState: ProviderSyncState = {
  provider: null,
  token: null,
  merchantUrl: null,
  roadmapStep: 'connect',
  feed: null,
  mapping: [],
  validation: {
    status: 'idle',
  },
  suggestions: {
    generatedAt: null,
    productOptimizations: [],
    summary: undefined,
  },
  overrides: {},
  pushStatus: null,
  lastUpdatedAt: null,
};

let state: ProviderSyncState = { ...defaultState };

function touchState() {
  state = {
    ...state,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function resetProviderSyncState() {
  state = { ...defaultState };
  touchState();
  return state;
}

export function setProviderConnection(provider: ProviderType, token: string) {
  state = {
    ...state,
    provider,
    token,
    roadmapStep: 'fetch',
  };
  touchState();
  return state;
}

export function setMerchantUrl(url: string) {
  state = {
    ...state,
    merchantUrl: url,
  };
  touchState();
  return state;
}

export function setFeedSnapshot(feed: FeedSnapshot) {
  state = {
    ...state,
    feed,
    roadmapStep: 'map',
  };
  touchState();
  return state;
}

export function setFieldMapping(mapping: FieldMapping[]) {
  state = {
    ...state,
    mapping,
  };
  touchState();
  return state;
}

export function setValidationSummary(validation: ValidationSummary) {
  state = {
    ...state,
    validation,
  };
  touchState();
  return state;
}

export function setSuggestions(productOptimizations: ProductOptimization[], summary?: string) {
  state = {
    ...state,
    suggestions: {
      generatedAt: new Date().toISOString(),
      productOptimizations,
      summary,
    },
  };
  touchState();
  return state;
}

export function advanceRoadmap(step: ProviderSyncState['roadmapStep']) {
  state = {
    ...state,
    roadmapStep: step,
  };
  touchState();
  return state;
}

export function saveOverrides(overrides: SuggestionOverrideMap) {
  state = {
    ...state,
    overrides,
  };
  touchState();
  return state;
}

export function mergeOverride(productId: string, field: string, value: string) {
  const existingProduct = state.overrides[productId] || {};
  state = {
    ...state,
    overrides: {
      ...state.overrides,
      [productId]: {
        ...existingProduct,
        [field]: value,
      },
    },
  };
  touchState();
  return state;
}

export function removeOverride(productId: string, field: string) {
  const existingProduct = state.overrides[productId] || {};
  if (!(field in existingProduct)) {
    return state;
  }

  const updatedProduct = { ...existingProduct };
  delete updatedProduct[field];

  state = {
    ...state,
    overrides: {
      ...state.overrides,
      [productId]: updatedProduct,
    },
  };
  touchState();
  return state;
}

export function setPushStatus(status: PushStatus | null) {
  state = {
    ...state,
    pushStatus: status,
    roadmapStep: status ? 'completed' : state.roadmapStep,
  };
  touchState();
  return state;
}

export function getProviderSyncState() {
  return state;
}
