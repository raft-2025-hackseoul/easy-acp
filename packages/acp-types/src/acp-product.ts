/**
 * OpenAI Agentic Commerce Protocol (ACP) Product Feed Types
 * Based on OpenAI Commerce Platform specifications
 */

export type Availability = 'in_stock' | 'out_of_stock' | 'preorder';
export type Condition = 'new' | 'refurbished' | 'used';
export type AgeGroup = 'newborn' | 'infant' | 'toddler' | 'kids' | 'adult';
export type Gender = 'male' | 'female' | 'unisex';
export type RelationshipType =
  | 'part_of_set'
  | 'required_part'
  | 'often_bought_with'
  | 'substitute'
  | 'different_brand'
  | 'accessory';
export type PickupMethod = 'in_store' | 'reserve' | 'not_supported';

/**
 * Core ACP Product interface
 * All required fields for ACP compliance
 */
export interface ACPProductCore {
  /** Unique product identifier (required) - max 100 chars */
  id: string;

  /** Product title (required) - max 150 chars */
  title: string;

  /** Product description (required) - max 5,000 chars, plain text only */
  description: string;

  /** Product landing page URL (required) */
  link: string;

  /** Product price with currency (required) - Format: "19.99 USD" */
  price: string;

  /** Product availability status (required) */
  availability: Availability;

  /** Enable product in ChatGPT search (required) */
  enable_search: boolean;

  /** Enable direct checkout in ChatGPT (required) */
  enable_checkout: boolean;

  /** Actual inventory quantity (required) */
  inventory_quantity: number;

  /** Product category taxonomy (required) - Format: "Category > Subcategory" */
  product_category: string;

  /** Primary material composition (required) - max 100 chars */
  material: string;

  /** Product weight with unit (required) - Format: "0.25 kg" */
  weight: string;

  /** Main product image URL (required) */
  image_link: string;

  /** Seller/merchant name (required) - max 70 chars */
  seller_name: string;

  /** Seller/merchant website URL (required) */
  seller_url: string;

  /** Return policy URL (required) */
  return_policy: string;

  /** Return window in days (required) */
  return_window: number;
}

/**
 * Recommended ACP Product fields
 * Strongly recommended for better ranking and visibility
 */
export interface ACPProductRecommended {
  /** Global Trade Item Number (GTIN: UPC, EAN, JAN, ISBN) - 8-14 digits */
  gtin?: string;

  /** Manufacturer Part Number (required if no GTIN) - max 70 chars */
  mpn?: string;

  /** Brand or manufacturer name - max 70 chars */
  brand?: string;

  /** Product condition (required if not new) */
  condition?: Condition;

  /** Popularity score (0-5 scale or merchant-defined) for ranking */
  popularity_score?: number;

  /** Return rate percentage (0-100) for quality signals */
  return_rate?: number;

  /** Privacy policy URL (required if checkout enabled) */
  seller_privacy_policy?: string;

  /** Terms of service URL (required if checkout enabled) */
  seller_tos?: string;

  /** Product review count */
  product_review_count?: number;

  /** Product review rating (0-5 scale) */
  product_review_rating?: number;

  /** Product Q&A content (plain text FAQ) */
  q_and_a?: string;

  /** Raw customer review data (full-text or JSON) */
  raw_review_data?: string;

  /** Related product IDs (comma-separated) */
  related_product_id?: string;

  /** Relationship type with related products */
  relationship_type?: RelationshipType;

  /** Region-specific pricing (e.g., "US:99.99 USD,CA:129.99 CAD") */
  geo_price?: string;

  /** Region-specific availability (e.g., "US:in_stock,CA:out_of_stock") */
  geo_availability?: string;

  /** Regulatory warnings or disclaimers */
  warning?: string;

  /** URL to detailed warning information */
  warning_url?: string;

  /** Minimum age required to purchase */
  age_restriction?: number;

  /** Google product category taxonomy */
  google_product_category?: string;

  /** Custom product categorization */
  product_type?: string;
}

/**
 * Optional/Advanced ACP Product fields
 */
export interface ACPProductOptional {
  /** Additional product image URLs (comma-separated) */
  additional_image_link?: string;

  /** Product video URL */
  video_link?: string;

  /** 3D model URL (GLB/GLTF format) */
  model_3d_link?: string;

  /** Product color - max 40 chars */
  color?: string;

  /** Product size - max 20 chars */
  size?: string;

  /** Product dimensions (LxWxH format, e.g., "20x18x8 cm") */
  dimensions?: string;

  /** Product length (use with width and height) */
  length?: string;

  /** Product width (use with length and height) */
  width?: string;

  /** Product height (use with length and width) */
  height?: string;

  /** Product pattern */
  pattern?: string;

  /** Target age group */
  age_group?: AgeGroup;

  /** Target gender */
  gender?: Gender;

  /** Sale price with currency (must be ≤ regular price) */
  sale_price?: string;

  /** Sale price effective date range (ISO 8601) */
  sale_price_effective_date?: string;

  /** Product quantity for unit pricing (e.g., "750 ml") */
  unit_pricing_measure?: string;

  /** Base unit for price comparison (e.g., "100 ml") */
  base_measure?: string;

  /** Historical price trend indicator - max 80 chars */
  pricing_trend?: string;

  /** Date when preorder product will be available (ISO 8601) */
  availability_date?: string;

  /** Date to remove product from catalog (ISO 8601) */
  expiration_date?: string;

  /** In-store pickup availability */
  pickup_method?: PickupMethod;

  /** Pickup service level agreement (e.g., "2 hours") */
  pickup_sla?: string;

  /** Item group ID for product variants - max 70 chars */
  item_group_id?: string;

  /** Parent product title for variant group - max 150 chars */
  item_group_title?: string;

  /** Size system standard (ISO 3166 country code) */
  size_system?: string;

  /** Unique offer identifier (SKU + seller + price) */
  offer_id?: string;

  /** Custom variant dimension 1 category */
  custom_variant1_category?: string;

  /** Custom variant dimension 1 option */
  custom_variant1_option?: string;

  /** Custom variant dimension 2 category */
  custom_variant2_category?: string;

  /** Custom variant dimension 2 option */
  custom_variant2_option?: string;

  /** Custom variant dimension 3 category */
  custom_variant3_category?: string;

  /** Custom variant dimension 3 option */
  custom_variant3_option?: string;

  /** Shipping options and costs (format: "country:region:service:price") */
  shipping?: string;

  /** Estimated delivery date (ISO 8601) */
  delivery_estimate?: string;

  /** Store/brand review count */
  store_review_count?: number;

  /** Store/brand review rating (0-5 scale) */
  store_review_rating?: number;

  /** Custom label 0 */
  custom_label_0?: string;

  /** Custom label 1 */
  custom_label_1?: string;

  /** Custom label 2 */
  custom_label_2?: string;

  /** Custom label 3 */
  custom_label_3?: string;

  /** Custom label 4 */
  custom_label_4?: string;

  /** Tax category */
  tax_category?: string;

  /** Excluded destination */
  excluded_destination?: string;

  /** Included destination */
  included_destination?: string;
}

/**
 * Complete ACP Product with all possible fields
 */
export type ACPProduct = ACPProductCore & ACPProductRecommended & ACPProductOptional;

/**
 * Partial ACP Product (for CSV uploads that may be incomplete)
 */
export type PartialACPProduct = Partial<ACPProduct> & { id?: string };

/**
 * Field metadata for validation and UI
 */
export interface ACPFieldMetadata {
  name: keyof ACPProduct;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'enum';
  description: string;
  example?: string;
  enumValues?: string[];
  category: 'core' | 'recommended' | 'optional';
}

/**
 * Validation result for a product
 */
export interface ValidationResult {
  isValid: boolean;
  missingRequired: string[];
  missingRecommended: string[];
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * CSV Processing result
 */
export interface CSVProcessingResult {
  success: boolean;
  products: PartialACPProduct[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  fieldMapping: Record<string, string>;
  validationSummary: {
    missingRequired: string[];
    missingRecommended: string[];
    totalErrors: number;
    totalWarnings: number;
  };
}

/**
 * Field mapping suggestion from AI
 */
export interface FieldMappingSuggestion {
  sourceField: string;
  targetField: keyof ACPProduct;
  confidence: number;
  reasoning?: string;
}

/**
 * Export options
 */
export interface ExportOptions {
  format: 'csv' | 'json' | 'xml' | 'tsv';
  includeOptionalFields: boolean;
  filename?: string;
}
