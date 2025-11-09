import {
  fetchMockWooCommerceProducts,
  getCachedWooCommerceProducts,
  validateWooToken,
} from './mock-woocommerce.service';
import {
  advanceRoadmap,
  FieldMapping,
  getProviderSyncState,
  ProviderSyncState,
  ProviderType,
  resetProviderSyncState,
  setFeedSnapshot,
  setFieldMapping,
  setMerchantUrl,
  setProviderConnection,
  setValidationSummary,
  setSuggestions,
  setPushStatus,
  mergeOverride,
  removeOverride,
  ValidationSummary,
} from './provider-sync.store';
import { llmValidator, LLMValidationIssue } from './llm-validator.service';
import { recordMerchantPush } from './mock-openai.service';
import { aiSEOService, FieldOptimization, ProductOptimization } from './ai-seo.service';

const REQUIRED_OPENAI_FIELDS = [
  'id',
  'title',
  'description',
  'link',
  'price',
  'image_link',
  'brand',
  'product_category',
  'gtin',
  'material',
  'weight',
  'inventory_quantity',
  'enable_search',
  'enable_checkout',
  'seller_name',
  'seller_url',
  'return_policy',
  'return_window',
];

const DEFAULT_FIELD_MAPPING: FieldMapping[] = [
  {
    providerField: 'product_id',
    openAIField: 'id',
    description: 'Unique product identifier',
    required: true,
  },
  {
    providerField: 'product_name',
    openAIField: 'title',
    description: 'Product title',
    required: true,
  },
  {
    providerField: 'product_description',
    openAIField: 'description',
    description: 'Detailed description',
    required: true,
  },
  { providerField: 'product_url', openAIField: 'link', description: 'Product URL', required: true },
  {
    providerField: 'main_image',
    openAIField: 'image_link',
    description: 'Primary product image URL',
  },
  {
    providerField: 'price_usd',
    openAIField: 'price',
    description: 'Price with currency',
    required: true,
  },
  {
    providerField: 'stock_status',
    openAIField: 'availability',
    description: 'Inventory availability',
  },
  { providerField: 'brand_name', openAIField: 'brand', description: 'Brand or manufacturer' },
  {
    providerField: 'product_category',
    openAIField: 'product_category',
    description: 'Product category (hierarchical with ">")',
  },
  { providerField: 'upc_code', openAIField: 'gtin', description: 'Global Trade Item Number' },

  // ACP Required Fields
  {
    providerField: 'enable_search',
    openAIField: 'enable_search',
    description: 'Enable ChatGPT search visibility',
  },
  {
    providerField: 'enable_checkout',
    openAIField: 'enable_checkout',
    description: 'Enable direct checkout',
  },
  { providerField: 'material', openAIField: 'material', description: 'Material composition' },
  { providerField: 'weight', openAIField: 'weight', description: 'Weight with unit' },
  {
    providerField: 'inventory_quantity',
    openAIField: 'inventory_quantity',
    description: 'Stock quantity',
  },
  { providerField: 'seller_name', openAIField: 'seller_name', description: 'Seller name' },
  { providerField: 'seller_url', openAIField: 'seller_url', description: 'Seller website URL' },
  {
    providerField: 'return_policy_url',
    openAIField: 'return_policy',
    description: 'Return policy URL',
  },
  {
    providerField: 'return_window_days',
    openAIField: 'return_window',
    description: 'Return window (days)',
  },

  // Recommended Fields
  { providerField: 'mpn', openAIField: 'mpn', description: 'Manufacturer Part Number' },
  { providerField: 'condition', openAIField: 'condition', description: 'Product condition' },
  {
    providerField: 'popularity_score',
    openAIField: 'popularity_score',
    description: 'Popularity score 0-5',
  },
  {
    providerField: 'seller_privacy_policy',
    openAIField: 'seller_privacy_policy',
    description: 'Privacy policy URL',
  },
  {
    providerField: 'seller_tos',
    openAIField: 'seller_tos',
    description: 'Terms of service URL',
  },

  // Optional Fields
  { providerField: 'color', openAIField: 'color' },
  { providerField: 'size', openAIField: 'size' },
  {
    providerField: 'rating',
    openAIField: 'product_review_rating',
    description: 'Product rating',
  },
  {
    providerField: 'review_count',
    openAIField: 'product_review_count',
    description: 'Review count',
  },
];

export function getSyncState() {
  return getProviderSyncState();
}

export function resetSync() {
  return resetProviderSyncState();
}

export async function connectProvider(provider: ProviderType, token: string) {
  if (provider !== 'woocommerce') {
    throw new Error('Only WooCommerce is supported in this demo.');
  }

  if (!validateWooToken(token)) {
    throw new Error('Please provide a valid WooCommerce API token.');
  }

  setProviderConnection(provider, token);
  advanceRoadmap('fetch');

  return getSyncState();
}

export async function fetchProviderProducts() {
  const state = getProviderSyncState();

  if (!state.provider || !state.token) {
    throw new Error('Connect to WooCommerce before fetching products.');
  }

  const { products, syncId, syncedAt, total } = await fetchMockWooCommerceProducts();
  setFeedSnapshot({ products, syncId, syncedAt, total });
  advanceRoadmap('map');

  return {
    feed: getProviderSyncState().feed,
  };
}

export function buildDefaultMapping(): FieldMapping[] {
  return DEFAULT_FIELD_MAPPING;
}

export async function generateMappingAndValidate() {
  const state = getProviderSyncState();
  if (!state.feed) {
    throw new Error('Fetch products before mapping.');
  }

  const mapping = DEFAULT_FIELD_MAPPING;
  setFieldMapping(mapping);

  // Begin validation summary
  setValidationSummary({ status: 'validating' });

  const validationSummary: ValidationSummary = await runValidation();
  setValidationSummary(validationSummary);
  advanceRoadmap('seo');

  return {
    mapping: getProviderSyncState().mapping,
    validation: getProviderSyncState().validation,
  };
}

export function updateMerchantUrl(url: string) {
  if (!url || !url.trim()) {
    throw new Error('Merchant URL is required.');
  }

  setMerchantUrl(url.trim());
  advanceRoadmap('push');
  return getSyncState();
}

export async function generateProductSuggestions() {
  const state = getProviderSyncState();

  if (!state.feed) {
    throw new Error('Fetch products before generating suggestions.');
  }

  try {
    const analysis = await aiSEOService.analyzeProductsWithTrends(state.feed.products);
    setSuggestions(analysis.productOptimizations, analysis.summary);
  } catch (error) {
    console.warn('AI SEO suggestions unavailable, using fallback suggestions:', error);
    const fallback = buildFallbackSuggestions(state.feed.products);
    setSuggestions(fallback, 'Generated fallback suggestions for demo purposes.');
  }

  return getProviderSyncState().suggestions;
}

async function runValidation(): Promise<ValidationSummary> {
  const state = getProviderSyncState();
  if (!state.feed) {
    return { status: 'error', errors: ['No product feed available.'] };
  }

  const products = state.feed.products;

  try {
    if (llmValidator.isAvailable()) {
      const mappedProducts = products.map((product) => mapProductToACP(product));
      const batchResult = await llmValidator.validateProducts(mappedProducts, { maxConcurrent: 3 });

      return {
        status: 'complete',
        summary: batchResult.overallSummary,
        issues: batchResult.results.flatMap((r) => r.validation.issues),
        warnings: batchResult.results
          .flatMap((r) => r.validation.issues)
          .filter((issue) => issue.severity !== 'error')
          .map((issue) => issue.message),
      };
    }
  } catch (error) {
    console.warn('LLM validation unavailable, falling back to local validation:', error);
  }

  // Fallback validation: check for required fields
  const issues: LLMValidationIssue[] = [];
  const warnings: string[] = [];

  products.forEach((product) => {
    REQUIRED_OPENAI_FIELDS.forEach((field) => {
      const providerField = mappingForOpenAIField(field)?.providerField;
      if (providerField && !product[providerField as keyof typeof product]) {
        issues.push({
          field,
          severity: 'error',
          message: `Missing value for required field "${field}"`,
        });
      }
    });
  });

  if (issues && issues.length === 0) {
    warnings.push('Validation completed using local checks.');
  }

  return {
    status: 'complete',
    summary: `Validated ${products.length} products using local rules. Found ${issues.length} issues.`,
    issues,
    warnings,
  };
}

function mapProductToACP(product: Record<string, any>) {
  const mapped: Record<string, any> = {};

  DEFAULT_FIELD_MAPPING.forEach(({ providerField, openAIField }) => {
    if (product[providerField] !== undefined) {
      mapped[openAIField] = product[providerField];
    }
  });

  // Normalize price to include currency if missing
  if (mapped.price && !mapped.price.includes(' USD')) {
    mapped.price = `${mapped.price} USD`;
  }

  return mapped;
}

function mappingForOpenAIField(field: string) {
  return DEFAULT_FIELD_MAPPING.find((mapping) => mapping.openAIField === field);
}

export function getMappedProductsWithOverrides(overrides: ProviderSyncState['overrides']) {
  const products = getCachedWooCommerceProducts();

  return products.map((product) => {
    const mapped = mapProductToACP(product);
    const productOverrides = overrides[product.product_id] || {};

    Object.entries(productOverrides).forEach(([field, value]) => {
      mapped[field] = value;
    });

    return {
      original: product,
      mapped,
    };
  });
}

export async function pushMappedProductsToMerchant() {
  const state = getProviderSyncState();

  if (!state.feed) {
    throw new Error('No product feed available to push.');
  }

  if (!state.merchantUrl) {
    throw new Error('Merchant URL is required before pushing.');
  }

  const mappedProducts = getMappedProductsWithOverrides(state.overrides).map((item) => ({
    ...item.mapped,
    source_product_id: item.original.product_id,
  }));

  recordMerchantPush(mappedProducts, state.merchantUrl);

  setPushStatus({
    lastPushedAt: new Date().toISOString(),
    destinationUrl: state.merchantUrl,
    totalProducts: mappedProducts.length,
    payloadSample: mappedProducts.slice(0, 2),
  });

  return getSyncState();
}

function buildFallbackSuggestions(products: Record<string, any>[]): ProductOptimization[] {
  return products.map((product, index) => {
    const productId = product.product_id || `product_${index + 1}`;
    const productName = product.product_name || `Product ${index + 1}`;
    const currentTitle = product.product_name || '';
    const currentDescription = product.product_description || '';

    const optimizations: FieldOptimization[] = [
      {
        field: 'title',
        currentValue: currentTitle,
        suggestedValue: `${productName} | ${product.brand_name || 'Trusted Brand'} Official Store`,
        reasoning: 'Highlight brand credibility and clarify purchase intent.',
        impact: 'high',
      },
      {
        field: 'description',
        currentValue: currentDescription,
        suggestedValue:
          currentDescription.length > 0
            ? `${currentDescription} Ideal for shoppers seeking reliable quality, fast delivery, and verified seller support.`
            : 'High-quality product with verified seller support, fast shipping, and trusted customer experiences.',
        reasoning: 'Clarify value proposition for AI-driven commerce results.',
        impact: 'high',
      },
    ];

    return {
      productId,
      productName,
      originalIndex: index,
      optimizations,
      overallScore: 7,
      potentialImprovement: 22,
    };
  });
}

export function acceptSuggestionOverride(productId: string, field: string, value: string) {
  mergeOverride(productId, field, value);
  return getProviderSyncState();
}

export function removeSuggestionOverride(productId: string, field: string) {
  removeOverride(productId, field);
  return getProviderSyncState();
}
