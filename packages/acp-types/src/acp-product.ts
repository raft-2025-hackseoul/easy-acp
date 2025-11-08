/**
 * OpenAI Agentic Commerce Protocol (ACP) Product Feed Types
 * Based on OpenAI Commerce Platform specifications
 */

export type Availability = 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
export type Condition = 'new' | 'refurbished' | 'used';
export type AgeGroup = 'newborn' | 'infant' | 'toddler' | 'kids' | 'adult';
export type Gender = 'male' | 'female' | 'unisex';
export type RelationshipType = 'part_of_set' | 'often_bought_with' | 'substitute';

/**
 * Core ACP Product interface
 * All required fields for ACP compliance
 */
export interface ACPProductCore {
  /** Unique product identifier (required) */
  id: string;

  /** Product title (required) */
  title: string;

  /** Product description (required) */
  description: string;

  /** Product price (required) */
  price: string; // Format: "19.99 USD"

  /** Product availability status (required) */
  availability: Availability;

  /** Enable product in ChatGPT search (required, ACP-specific) */
  enable_search: boolean;

  /** Enable direct checkout in ChatGPT (required, ACP-specific) */
  enable_checkout: boolean;

  /** Actual inventory quantity (required, ACP-specific) */
  inventory_quantity: number;
}

/**
 * Recommended ACP Product fields
 * Strongly recommended for better ranking and visibility
 */
export interface ACPProductRecommended {
  /** Main product image URL */
  image_link?: string;

  /** Brand name */
  brand?: string;

  /** Product category/type */
  category?: string;

  /** Product condition */
  condition?: Condition;

  /** Popularity score (0-5, ACP-specific for ranking) */
  popularity_score?: number;

  /** Return rate percentage (ACP-specific for ranking) */
  return_rate?: number;

  /** Product landing page URL */
  link?: string;

  /** Google product category */
  google_product_category?: string;

  /** Product type */
  product_type?: string;
}

/**
 * Optional/Advanced ACP Product fields
 */
export interface ACPProductOptional {
  /** Additional product image URLs (comma-separated) */
  additional_image_link?: string;

  /** Product color */
  color?: string;

  /** Product size */
  size?: string;

  /** Product material */
  material?: string;

  /** Product pattern */
  pattern?: string;

  /** Age group */
  age_group?: AgeGroup;

  /** Gender */
  gender?: Gender;

  /** GTIN (Global Trade Item Number) */
  gtin?: string;

  /** MPN (Manufacturer Part Number) */
  mpn?: string;

  /** Sale price */
  sale_price?: string;

  /** Sale price effective date range */
  sale_price_effective_date?: string;

  /** Shipping weight */
  shipping_weight?: string;

  /** Shipping dimensions */
  shipping_dimensions?: string;

  /** Raw review data (full-text, ACP-specific) */
  raw_review_data?: string;

  /** Q&A data (full-text, ACP-specific) */
  q_and_a?: string;

  /** Related product IDs (ACP-specific) */
  related_product_id?: string;

  /** Relationship type with related products (ACP-specific) */
  relationship_type?: RelationshipType;

  /** Region-specific pricing (ACP-specific) */
  geo_price?: string;

  /** Region-specific availability (ACP-specific) */
  geo_availability?: string;

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

  /** Item group ID (for product variants) */
  item_group_id?: string;

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
