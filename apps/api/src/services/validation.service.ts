import {
  PartialACPProduct,
  ValidationResult,
  validateACPProduct,
  validateACPProducts,
  getValidationSummary,
} from '@repo/acp-types';
import {
  llmValidator,
  LLMValidationResult,
  BatchLLMValidationResult,
} from './llm-validator.service';

export { validateACPProduct, validateACPProducts, getValidationSummary };

/**
 * Validate and categorize products (traditional validation)
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

/**
 * Enhanced validation using LLM
 */
export async function validateProductsWithLLM(
  products: PartialACPProduct[]
): Promise<BatchLLMValidationResult> {
  if (!llmValidator.isAvailable()) {
    throw new Error(
      'LLM validation is not available. Please configure OPENROUTER_API_KEY in your environment variables.'
    );
  }

  return llmValidator.validateProducts(products);
}

/**
 * Validate a single product with LLM
 */
export async function validateProductWithLLM(
  product: PartialACPProduct
): Promise<LLMValidationResult> {
  if (!llmValidator.isAvailable()) {
    throw new Error(
      'LLM validation is not available. Please configure OPENROUTER_API_KEY in your environment variables.'
    );
  }

  return llmValidator.validateProduct(product);
}

/**
 * Check if LLM validation is available
 */
export function isLLMValidationAvailable(): boolean {
  return llmValidator.isAvailable();
}

/**
 * Combined validation (traditional + LLM)
 * Returns both traditional validation results and LLM validation for comparison
 *
 * @param products - Products to validate
 * @param options - Validation options
 * @param options.llmSampleSize - Number of products to validate with LLM (default: 5, max: 10)
 * @param options.maxConcurrent - Max concurrent LLM requests (default: 3)
 */
export async function validateProductsCombined(
  products: PartialACPProduct[],
  options?: { llmSampleSize?: number; maxConcurrent?: number }
) {
  const traditional = categorizeProducts(products);

  let llmValidation: BatchLLMValidationResult | null = null;
  if (llmValidator.isAvailable()) {
    try {
      // Limit the number of products validated with LLM to avoid timeouts and costs
      const llmSampleSize = Math.min(options?.llmSampleSize || 5, 10);
      const productsToValidate = products.slice(0, llmSampleSize);

      console.log(
        `🤖 LLM validating ${productsToValidate.length} of ${products.length} products...`
      );
      const startTime = Date.now();

      llmValidation = await llmValidator.validateProducts(productsToValidate, {
        maxConcurrent: options?.maxConcurrent || 3,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ LLM validation completed in ${duration}s`);

      if (productsToValidate.length < products.length) {
        llmValidation.overallSummary += ` (Sample of ${productsToValidate.length}/${products.length} products)`;
      }
    } catch (error) {
      console.error(
        '❌ LLM validation failed, continuing with traditional validation only:',
        error
      );
    }
  }

  return {
    traditional,
    llm: llmValidation,
    hasLLMValidation: llmValidation !== null,
  };
}
