import { ACPFieldMetadata } from './acp-product';

/**
 * Complete ACP field definitions
 * Used for validation, UI generation, and documentation
 */
export const ACP_FIELDS: ACPFieldMetadata[] = [
  // Core Required Fields
  {
    name: 'id',
    label: 'Product ID',
    required: true,
    type: 'string',
    category: 'core',
    description: 'Unique identifier for your product',
    example: 'SKU-12345',
  },
  {
    name: 'title',
    label: 'Title',
    required: true,
    type: 'string',
    category: 'core',
    description: 'Product title',
    example: 'Wireless Bluetooth Headphones',
  },
  {
    name: 'description',
    label: 'Description',
    required: true,
    type: 'string',
    category: 'core',
    description: 'Detailed product description',
    example: 'Premium wireless headphones with active noise cancellation',
  },
  {
    name: 'price',
    label: 'Price',
    required: true,
    type: 'string',
    category: 'core',
    description: 'Product price with currency',
    example: '99.99 USD',
  },
  {
    name: 'availability',
    label: 'Availability',
    required: true,
    type: 'enum',
    category: 'core',
    description: 'Product availability status',
    example: 'in_stock',
    enumValues: ['in_stock', 'out_of_stock', 'preorder', 'backorder'],
  },
  {
    name: 'enable_search',
    label: 'Enable Search',
    required: true,
    type: 'boolean',
    category: 'core',
    description: 'Make product discoverable in ChatGPT search',
    example: 'true',
  },
  {
    name: 'enable_checkout',
    label: 'Enable Checkout',
    required: true,
    type: 'boolean',
    category: 'core',
    description: 'Enable direct purchase in ChatGPT',
    example: 'true',
  },
  {
    name: 'inventory_quantity',
    label: 'Inventory Quantity',
    required: true,
    type: 'number',
    category: 'core',
    description: 'Actual stock quantity available',
    example: '150',
  },

  // Recommended Fields
  {
    name: 'image_link',
    label: 'Image URL',
    required: false,
    type: 'string',
    category: 'recommended',
    description: 'Main product image URL',
    example: 'https://example.com/images/product.jpg',
  },
  {
    name: 'brand',
    label: 'Brand',
    required: false,
    type: 'string',
    category: 'recommended',
    description: 'Brand name',
    example: 'Sony',
  },
  {
    name: 'category',
    label: 'Category',
    required: false,
    type: 'string',
    category: 'recommended',
    description: 'Product category',
    example: 'Electronics > Audio > Headphones',
  },
  {
    name: 'condition',
    label: 'Condition',
    required: false,
    type: 'enum',
    category: 'recommended',
    description: 'Product condition',
    example: 'new',
    enumValues: ['new', 'refurbished', 'used'],
  },
  {
    name: 'popularity_score',
    label: 'Popularity Score',
    required: false,
    type: 'number',
    category: 'recommended',
    description: 'Product popularity rating (0-5) for ranking',
    example: '4.8',
  },
  {
    name: 'return_rate',
    label: 'Return Rate',
    required: false,
    type: 'number',
    category: 'recommended',
    description: 'Product return rate percentage for ranking',
    example: '2.5',
  },
  {
    name: 'link',
    label: 'Product URL',
    required: false,
    type: 'string',
    category: 'recommended',
    description: 'Product landing page URL',
    example: 'https://example.com/products/wireless-headphones',
  },
  {
    name: 'google_product_category',
    label: 'Google Product Category',
    required: false,
    type: 'string',
    category: 'recommended',
    description: 'Google product category taxonomy',
    example: 'Electronics > Audio > Headphones',
  },
  {
    name: 'product_type',
    label: 'Product Type',
    required: false,
    type: 'string',
    category: 'recommended',
    description: 'Your custom product categorization',
    example: 'Audio Equipment > Over-Ear Headphones',
  },

  // Optional Fields
  {
    name: 'additional_image_link',
    label: 'Additional Images',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Additional product image URLs (comma-separated)',
    example: 'https://example.com/images/product2.jpg,https://example.com/images/product3.jpg',
  },
  {
    name: 'color',
    label: 'Color',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Product color',
    example: 'Black',
  },
  {
    name: 'size',
    label: 'Size',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Product size',
    example: 'Large',
  },
  {
    name: 'material',
    label: 'Material',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Product material',
    example: 'Plastic, Metal',
  },
  {
    name: 'pattern',
    label: 'Pattern',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Product pattern',
    example: 'Solid',
  },
  {
    name: 'age_group',
    label: 'Age Group',
    required: false,
    type: 'enum',
    category: 'optional',
    description: 'Target age group',
    example: 'adult',
    enumValues: ['newborn', 'infant', 'toddler', 'kids', 'adult'],
  },
  {
    name: 'gender',
    label: 'Gender',
    required: false,
    type: 'enum',
    category: 'optional',
    description: 'Target gender',
    example: 'unisex',
    enumValues: ['male', 'female', 'unisex'],
  },
  {
    name: 'gtin',
    label: 'GTIN',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Global Trade Item Number (UPC, EAN, ISBN)',
    example: '123456789012',
  },
  {
    name: 'mpn',
    label: 'MPN',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Manufacturer Part Number',
    example: 'WH-1000XM4',
  },
  {
    name: 'sale_price',
    label: 'Sale Price',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Sale price with currency',
    example: '79.99 USD',
  },
  {
    name: 'sale_price_effective_date',
    label: 'Sale Price Dates',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Sale price effective date range',
    example: '2025-01-01T00:00:00Z/2025-01-31T23:59:59Z',
  },
  {
    name: 'shipping_weight',
    label: 'Shipping Weight',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Product shipping weight',
    example: '0.5 kg',
  },
  {
    name: 'shipping_dimensions',
    label: 'Shipping Dimensions',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Product shipping dimensions',
    example: '20x15x10 cm',
  },
  {
    name: 'raw_review_data',
    label: 'Reviews',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Raw customer review data (full-text)',
    example: 'Great product! Very comfortable...',
  },
  {
    name: 'q_and_a',
    label: 'Q&A',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Product Q&A data (full-text)',
    example: 'Q: Does it have noise cancellation? A: Yes, active noise cancellation.',
  },
  {
    name: 'related_product_id',
    label: 'Related Products',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Related product IDs (comma-separated)',
    example: 'SKU-12346,SKU-12347',
  },
  {
    name: 'relationship_type',
    label: 'Relationship Type',
    required: false,
    type: 'enum',
    category: 'optional',
    description: 'Type of relationship with related products',
    example: 'often_bought_with',
    enumValues: ['part_of_set', 'often_bought_with', 'substitute'],
  },
  {
    name: 'geo_price',
    label: 'Geographic Price',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Region-specific pricing overrides',
    example: 'US:99.99 USD,UK:89.99 GBP',
  },
  {
    name: 'geo_availability',
    label: 'Geographic Availability',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Region-specific availability overrides',
    example: 'US:in_stock,UK:out_of_stock',
  },
  {
    name: 'item_group_id',
    label: 'Item Group ID',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Variant group identifier',
    example: 'headphones-wireless-123',
  },
  {
    name: 'tax_category',
    label: 'Tax Category',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Product tax category',
    example: 'electronics',
  },
  {
    name: 'custom_label_0',
    label: 'Custom Label 0',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Custom label for categorization',
  },
  {
    name: 'custom_label_1',
    label: 'Custom Label 1',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Custom label for categorization',
  },
  {
    name: 'custom_label_2',
    label: 'Custom Label 2',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Custom label for categorization',
  },
  {
    name: 'custom_label_3',
    label: 'Custom Label 3',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Custom label for categorization',
  },
  {
    name: 'custom_label_4',
    label: 'Custom Label 4',
    required: false,
    type: 'string',
    category: 'optional',
    description: 'Custom label for categorization',
  },
];

/**
 * Get required fields
 */
export const getRequiredFields = (): ACPFieldMetadata[] => {
  return ACP_FIELDS.filter((field) => field.required);
};

/**
 * Get recommended fields
 */
export const getRecommendedFields = (): ACPFieldMetadata[] => {
  return ACP_FIELDS.filter((field) => field.category === 'recommended');
};

/**
 * Get optional fields
 */
export const getOptionalFields = (): ACPFieldMetadata[] => {
  return ACP_FIELDS.filter((field) => field.category === 'optional');
};

/**
 * Get field by name
 */
export const getField = (name: string): ACPFieldMetadata | undefined => {
  return ACP_FIELDS.find((field) => field.name === name);
};

/**
 * Get all field names
 */
export const getAllFieldNames = (): string[] => {
  return ACP_FIELDS.map((field) => field.name);
};
