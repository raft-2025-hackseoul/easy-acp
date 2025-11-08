import { PartialACPProduct } from '@repo/acp-types';
import { productEnhancer, ProductChange } from './product-enhancer.service';

/**
 * Result from generating missing fields
 */
export interface MissingFieldGenerationResult {
  enhancedProducts: PartialACPProduct[];
  changes: Map<string, ProductChange[]>; // Map of product ID/index to changes
  summary: GenerationSummary;
  errors: GenerationError[];
}

export interface GenerationSummary {
  totalProducts: number;
  productsEnhanced: number;
  fieldsGenerated: number;
  requiredFieldsGenerated: number;
  recommendedFieldsGenerated: number;
  processingTime: number; // milliseconds
}

export interface GenerationError {
  productIndex: number;
  productId?: string;
  error: string;
}

/**
 * Service for generating missing ACP fields across multiple products
 */
class MissingFieldGeneratorService {
  /**
   * Generate missing fields for multiple products
   */
  public async generateMissingFields(
    products: PartialACPProduct[],
    missingRequired: string[],
    missingRecommended: string[] = []
  ): Promise<MissingFieldGenerationResult> {
    const startTime = Date.now();
    const enhancedProducts: PartialACPProduct[] = [];
    const changesMap = new Map<string, ProductChange[]>();
    const errors: GenerationError[] = [];

    let totalFieldsGenerated = 0;
    let requiredFieldsGenerated = 0;
    let recommendedFieldsGenerated = 0;

    // Check if enhancement service is available
    if (!productEnhancer.isAvailable()) {
      throw new Error(
        'Field generation is not available. Please configure OPENROUTER_API_KEY environment variable.'
      );
    }

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      try {
        // Enhance the product to fill missing fields
        const enhancementResult = await productEnhancer.enhanceProduct(product);

        enhancedProducts.push(enhancementResult.enhancedProduct);

        // Track changes
        if (enhancementResult.changes.length > 0) {
          const productKey = product.id || `product_${i}`;
          changesMap.set(productKey, enhancementResult.changes);

          // Count generated fields
          enhancementResult.changes.forEach((change) => {
            if (change.oldValue === null || change.oldValue === undefined) {
              totalFieldsGenerated++;

              if (missingRequired.includes(change.field)) {
                requiredFieldsGenerated++;
              } else if (missingRecommended.includes(change.field)) {
                recommendedFieldsGenerated++;
              }
            }
          });
        }
      } catch (error) {
        // Log error but continue with other products
        errors.push({
          productIndex: i,
          productId: product.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Keep original product if enhancement fails
        enhancedProducts.push(product);
      }

      // Add a small delay to avoid rate limiting (100ms between requests)
      if (i < products.length - 1) {
        await this.delay(100);
      }
    }

    const processingTime = Date.now() - startTime;

    return {
      enhancedProducts,
      changes: changesMap,
      summary: {
        totalProducts: products.length,
        productsEnhanced: changesMap.size,
        fieldsGenerated: totalFieldsGenerated,
        requiredFieldsGenerated,
        recommendedFieldsGenerated,
        processingTime,
      },
      errors,
    };
  }

  /**
   * Generate missing fields for a single product (targeted approach)
   */
  public async generateSpecificFields(
    product: PartialACPProduct,
    targetFields: string[]
  ): Promise<{ product: PartialACPProduct; changes: ProductChange[] }> {
    if (!productEnhancer.isAvailable()) {
      throw new Error('Field generation is not available. Please configure OPENROUTER_API_KEY.');
    }

    // Enhance the product
    const enhancementResult = await productEnhancer.enhanceProduct(product);

    // Filter changes to only include target fields
    const relevantChanges = enhancementResult.changes.filter((change) =>
      targetFields.includes(change.field)
    );

    return {
      product: enhancementResult.enhancedProduct,
      changes: relevantChanges,
    };
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Estimate processing time based on product count
   */
  public estimateProcessingTime(productCount: number): number {
    // Rough estimate: 2 seconds per product + 100ms delay between products
    return productCount * 2100;
  }

  /**
   * Check if the service is available
   */
  public isAvailable(): boolean {
    return productEnhancer.isAvailable();
  }
}

// Export singleton instance
export const missingFieldGenerator = new MissingFieldGeneratorService();

// Export types and class
export { MissingFieldGeneratorService };
