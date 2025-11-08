import {
  ACPProduct,
  PartialACPProduct,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './acp-product';
import { ACP_FIELDS, getRequiredFields, getRecommendedFields } from './acp-fields';

/**
 * Validate a product against ACP requirements
 */
export function validateACPProduct(product: PartialACPProduct): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];

  // Check required fields
  const requiredFields = getRequiredFields();
  for (const field of requiredFields) {
    const value = product[field.name as keyof ACPProduct];
    if (value === undefined || value === null || value === '') {
      missingRequired.push(field.name);
      errors.push({
        field: field.name,
        message: `${field.label} is required`,
      });
    } else {
      // Validate field type
      const validationError = validateFieldType(field.name, value, field.type);
      if (validationError) {
        errors.push(validationError);
      }
    }
  }

  // Check recommended fields
  const recommendedFields = getRecommendedFields();
  for (const field of recommendedFields) {
    const value = product[field.name as keyof ACPProduct];
    if (value === undefined || value === null || value === '') {
      missingRecommended.push(field.name);
      warnings.push({
        field: field.name,
        message: `${field.label} is recommended for better ranking`,
      });
    } else {
      // Validate field type
      const validationError = validateFieldType(field.name, value, field.type);
      if (validationError) {
        warnings.push({
          field: validationError.field,
          message: validationError.message,
          value: validationError.value,
        });
      }
    }
  }

  // Additional validation rules
  validatePrice(product, errors);
  validateInventory(product, errors, warnings);
  validateImages(product, warnings);
  validatePopularityScore(product, warnings);
  validateReturnRate(product, warnings);
  validateConditionalRequirements(product, errors);
  validateCharacterLimits(product, errors, warnings);

  return {
    isValid: errors.length === 0 && missingRequired.length === 0,
    missingRequired,
    missingRecommended,
    errors,
    warnings,
  };
}

function validateFieldType(
  fieldName: string,
  value: unknown,
  expectedType: string
): ValidationError | null {
  const field = ACP_FIELDS.find((f) => f.name === fieldName);
  if (!field) return null;

  if (expectedType === 'number') {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (typeof num !== 'number' || isNaN(num)) {
      return {
        field: fieldName,
        message: `${field.label} must be a number`,
        value,
      };
    }
  }

  if (expectedType === 'boolean') {
    const bool = typeof value === 'string' ? value.toLowerCase() === 'true' : value;
    if (typeof bool !== 'boolean') {
      return {
        field: fieldName,
        message: `${field.label} must be true or false`,
        value,
      };
    }
  }

  if (expectedType === 'enum' && field.enumValues) {
    const strValue = String(value).toLowerCase();
    if (!field.enumValues.includes(strValue)) {
      return {
        field: fieldName,
        message: `${field.label} must be one of: ${field.enumValues.join(', ')}`,
        value,
      };
    }
  }

  return null;
}

function validatePrice(product: PartialACPProduct, errors: ValidationError[]): void {
  if (product.price) {
    const priceRegex = /^\d+\.?\d*\s+[A-Z]{3}$/;
    if (!priceRegex.test(String(product.price))) {
      errors.push({
        field: 'price',
        message: 'Price must be in format "99.99 USD"',
        value: product.price,
      });
    }
  }

  if (product.sale_price) {
    const priceRegex = /^\d+\.?\d*\s+[A-Z]{3}$/;
    if (!priceRegex.test(String(product.sale_price))) {
      errors.push({
        field: 'sale_price',
        message: 'Sale price must be in format "99.99 USD"',
        value: product.sale_price,
      });
    }
  }
}

function validateInventory(
  product: PartialACPProduct,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (product.inventory_quantity !== undefined) {
    const qty = Number(product.inventory_quantity);
    if (qty < 0) {
      errors.push({
        field: 'inventory_quantity',
        message: 'Inventory quantity cannot be negative',
        value: product.inventory_quantity,
      });
    }

    if (qty === 0 && product.availability === 'in_stock') {
      warnings.push({
        field: 'availability',
        message: 'Availability is "in_stock" but inventory is 0',
        value: product.availability,
      });
    }

    if (qty > 0 && product.availability === 'out_of_stock') {
      warnings.push({
        field: 'availability',
        message: 'Availability is "out_of_stock" but inventory is greater than 0',
        value: product.availability,
      });
    }
  }
}

function validateImages(product: PartialACPProduct, warnings: ValidationWarning[]): void {
  const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;

  if (product.image_link && !urlRegex.test(String(product.image_link))) {
    warnings.push({
      field: 'image_link',
      message:
        'Image URL should be a valid HTTP(S) URL ending in .jpg, .jpeg, .png, .gif, or .webp',
      value: product.image_link,
    });
  }

  if (product.additional_image_link) {
    const additionalImages = String(product.additional_image_link).split(',');
    additionalImages.forEach((url, index) => {
      if (!urlRegex.test(url.trim())) {
        warnings.push({
          field: 'additional_image_link',
          message: `Additional image ${index + 1} should be a valid HTTP(S) URL ending in .jpg, .jpeg, .png, .gif, or .webp`,
          value: url.trim(),
        });
      }
    });
  }
}

function validatePopularityScore(product: PartialACPProduct, warnings: ValidationWarning[]): void {
  if (product.popularity_score !== undefined) {
    const score = Number(product.popularity_score);
    if (score < 0 || score > 5) {
      warnings.push({
        field: 'popularity_score',
        message: 'Popularity score should be between 0 and 5',
        value: product.popularity_score,
      });
    }
  }
}

function validateReturnRate(product: PartialACPProduct, warnings: ValidationWarning[]): void {
  if (product.return_rate !== undefined) {
    const rate = Number(product.return_rate);
    if (rate < 0 || rate > 100) {
      warnings.push({
        field: 'return_rate',
        message: 'Return rate should be between 0 and 100 (percentage)',
        value: product.return_rate,
      });
    }
  }
}

function validateConditionalRequirements(
  product: PartialACPProduct,
  errors: ValidationError[]
): void {
  // Check all fields with conditional requirements
  ACP_FIELDS.forEach((field) => {
    if (field.conditionallyRequired) {
      const { when, equals, message } = field.conditionallyRequired;
      const triggerValue = product[when as keyof ACPProduct];
      const fieldValue = product[field.name as keyof ACPProduct];

      // If the condition is met but the field is missing
      if (triggerValue === equals && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
        errors.push({
          field: field.name,
          message: message || `${field.label} is required when ${when} is ${equals}`,
        });
      }
    }
  });

  // Additional validation: at least one of GTIN or MPN must be present
  if (!product.gtin && !product.mpn) {
    errors.push({
      field: 'gtin',
      message: 'Either GTIN or MPN is required',
    });
  }

  // Validate availability_date when availability is preorder
  if (product.availability === 'preorder' && !product.availability_date) {
    errors.push({
      field: 'availability_date',
      message: 'availability_date is required when availability is "preorder"',
    });
  }
}

function validateCharacterLimits(
  product: PartialACPProduct,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  ACP_FIELDS.forEach((field) => {
    if (field.maxLength && field.type === 'string') {
      const value = product[field.name as keyof ACPProduct];
      if (value !== undefined && value !== null) {
        const strValue = String(value);
        if (strValue.length > field.maxLength) {
          // Critical fields get errors, others get warnings
          if (field.required) {
            errors.push({
              field: field.name,
              message: `${field.label} exceeds maximum length of ${field.maxLength} characters (current: ${strValue.length})`,
              value,
            });
          } else {
            warnings.push({
              field: field.name,
              message: `${field.label} exceeds recommended maximum length of ${field.maxLength} characters (current: ${strValue.length})`,
              value,
            });
          }
        }
      }
    }
  });
}

/**
 * Validate multiple products
 */
export function validateACPProducts(products: PartialACPProduct[]): ValidationResult[] {
  return products.map((product) => validateACPProduct(product));
}

/**
 * Get summary of validation results
 */
export function getValidationSummary(results: ValidationResult[]) {
  const validProducts = results.filter((r) => r.isValid).length;
  const invalidProducts = results.filter((r) => !r.isValid).length;

  // Get all unique missing required fields across all products
  const allMissingRequired = new Set<string>();
  const allMissingRecommended = new Set<string>();

  // Count total errors and warnings (duplicates across products)
  let totalErrorInstances = 0;
  let totalWarningInstances = 0;

  results.forEach((result) => {
    result.missingRequired.forEach((field) => allMissingRequired.add(field));
    result.missingRecommended.forEach((field) => allMissingRecommended.add(field));
    totalErrorInstances += result.errors.length;
    totalWarningInstances += result.warnings.length;
  });

  const uniqueMissingRequired = Array.from(allMissingRequired);
  const uniqueMissingRecommended = Array.from(allMissingRecommended);

  return {
    totalProducts: results.length,
    validProducts,
    invalidProducts,
    // Total error/warning instances across all products
    totalErrors: totalErrorInstances,
    totalWarnings: totalWarningInstances,
    // Unique missing fields (not duplicated per product)
    missingRequired: uniqueMissingRequired,
    missingRecommended: uniqueMissingRecommended,
    // Clearer breakdown
    uniqueMissingRequiredCount: uniqueMissingRequired.length,
    uniqueMissingRecommendedCount: uniqueMissingRecommended.length,
  };
}
