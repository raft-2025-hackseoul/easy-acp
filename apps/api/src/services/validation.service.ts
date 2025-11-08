import {
  PartialACPProduct,
  ValidationResult,
  validateACPProduct,
  validateACPProducts,
  getValidationSummary,
} from '@repo/acp-types';

export { validateACPProduct, validateACPProducts, getValidationSummary };

/**
 * Validate and categorize products
 */
export function categorizeProducts(products: PartialACPProduct[]) {
  const validationResults = validateACPProducts(products);

  const valid: PartialACPProduct[] = [];
  const invalid: { product: PartialACPProduct; validation: ValidationResult }[] = [];

  products.forEach((product, index) => {
    const validation = validationResults[index];
    if (validation.isValid) {
      valid.push(product);
    } else {
      invalid.push({ product, validation });
    }
  });

  return {
    valid,
    invalid,
    summary: getValidationSummary(validationResults),
  };
}
