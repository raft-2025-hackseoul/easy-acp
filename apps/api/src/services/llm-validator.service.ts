import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PartialACPProduct } from '@repo/acp-types';

/**
 * LLM Validation Result
 */
export interface LLMValidationResult {
  isValid: boolean;
  overallScore: number; // 0-100
  issues: LLMValidationIssue[];
  suggestions: string[];
  summary: string;
}

export interface LLMValidationIssue {
  field?: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface BatchLLMValidationResult {
  totalProducts: number;
  validProducts: number;
  invalidProducts: number;
  results: Array<{
    product: PartialACPProduct;
    validation: LLMValidationResult;
  }>;
  overallSummary: string;
}

/**
 * OpenRouter LLM client for validation
 */
class LLMValidatorService {
  private client: OpenAI | null = null;
  private acpSpec: string = '';

  constructor() {
    this.initializeClient();
    this.loadACPSpec();
  }

  /**
   * Initialize OpenRouter client (compatible with OpenAI SDK)
   */
  private initializeClient() {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not configured. LLM validation will be disabled.');
      return;
    }

    // OpenRouter is compatible with OpenAI SDK - just change the base URL
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'ACP Product Feed Validator',
      },
    });
  }

  /**
   * Load ACP specification from markdown file
   */
  private loadACPSpec() {
    try {
      // Try multiple possible paths (handles both dev and production)
      const possiblePaths = [
        join(__dirname, '../specs/acp-product-feed-spec.md'),  // Built version (dist/)
        join(__dirname, '../../src/specs/acp-product-feed-spec.md'),  // From dist/ to src/
        join(process.cwd(), 'src/specs/acp-product-feed-spec.md'),  // From project root
        join(process.cwd(), 'apps/api/src/specs/acp-product-feed-spec.md'),  // Monorepo root
      ];

      for (const specPath of possiblePaths) {
        try {
          this.acpSpec = readFileSync(specPath, 'utf-8');
          console.log(`✅ Loaded ACP spec from: ${specPath}`);
          return;
        } catch {
          // Try next path
        }
      }

      throw new Error('ACP spec file not found in any expected location');
    } catch (error) {
      console.error('Failed to load ACP specification:', error);
      this.acpSpec = 'ACP specification not available';
    }
  }

  /**
   * Check if LLM validation is available
   */
  public isAvailable(): boolean {
    return this.client !== null && this.acpSpec !== 'ACP specification not available';
  }

  /**
   * Validate a single product using LLM
   */
  public async validateProduct(product: PartialACPProduct): Promise<LLMValidationResult> {
    if (!this.isAvailable()) {
      throw new Error('LLM validation is not available. Please configure OPENROUTER_API_KEY.');
    }

    try {
      const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

      const prompt = this.buildValidationPrompt(product);

      const completion = await this.client!.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an expert validator for the Agentic Commerce Protocol (ACP) product feed specification.
Your task is to thoroughly validate product data against the ACP specification and provide detailed, actionable feedback.
Return only valid JSON in the specified format.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      const result = JSON.parse(responseText);

      return this.parseValidationResult(result);
    } catch (error) {
      console.error('LLM validation error:', error);
      throw new Error(`LLM validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate multiple products in batch
   */
  public async validateProducts(
    products: PartialACPProduct[],
    options?: { maxConcurrent?: number }
  ): Promise<BatchLLMValidationResult> {
    if (!this.isAvailable()) {
      throw new Error('LLM validation is not available. Please configure OPENROUTER_API_KEY.');
    }

    const maxConcurrent = options?.maxConcurrent || 5;
    const results: Array<{ product: PartialACPProduct; validation: LLMValidationResult }> = [];

    // Process products in batches to avoid rate limits
    for (let i = 0; i < products.length; i += maxConcurrent) {
      const batch = products.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(async (product) => ({
          product,
          validation: await this.validateProduct(product),
        }))
      );
      results.push(...batchResults);
    }

    const validProducts = results.filter((r) => r.validation.isValid).length;
    const invalidProducts = results.length - validProducts;

    return {
      totalProducts: products.length,
      validProducts,
      invalidProducts,
      results,
      overallSummary: this.generateBatchSummary(results),
    };
  }

  /**
   * Build validation prompt for LLM
   */
  private buildValidationPrompt(product: PartialACPProduct): string {
    return `# Task: Validate Product Against ACP Specification

## ACP Product Feed Specification

${this.acpSpec}

---

## Product Data to Validate

\`\`\`json
${JSON.stringify(product, null, 2)}
\`\`\`

---

## Validation Instructions

1. **Thoroughly review** the product data against ALL requirements in the ACP specification
2. **Check for**:
   - Missing required fields
   - Invalid field values or formats
   - Field length violations
   - Data type mismatches
   - Business rule violations (e.g., sale_price > price)
   - URL validity concerns
   - Currency code requirements
   - Date format compliance (ISO 8601)
   - Enum value compliance
   - Conditional field requirements

3. **Provide**:
   - Overall validity assessment
   - Quality score (0-100)
   - List of all issues found (errors, warnings, info)
   - Actionable suggestions for improvement
   - Brief summary

## Response Format (JSON only)

\`\`\`json
{
  "isValid": boolean,
  "overallScore": number (0-100),
  "issues": [
    {
      "field": "field_name or undefined",
      "severity": "error" | "warning" | "info",
      "message": "Clear description of the issue",
      "suggestion": "How to fix it (optional)"
    }
  ],
  "suggestions": [
    "Overall improvement suggestion 1",
    "Overall improvement suggestion 2"
  ],
  "summary": "Brief 1-2 sentence summary of validation results"
}
\`\`\`

**Important**:
- A product is only valid (isValid: true) if it has NO errors (warnings are acceptable)
- Be thorough but constructive
- Prioritize errors over warnings
- Provide specific, actionable feedback
- Return ONLY valid JSON, no markdown formatting`;
  }

  /**
   * Parse and normalize LLM validation result
   */
  private parseValidationResult(result: any): LLMValidationResult {
    return {
      isValid: result.isValid ?? false,
      overallScore: Math.min(100, Math.max(0, result.overallScore ?? 0)),
      issues: (result.issues || []).map((issue: any) => ({
        field: issue.field,
        severity: issue.severity || 'error',
        message: issue.message || 'Unknown issue',
        suggestion: issue.suggestion,
      })),
      suggestions: result.suggestions || [],
      summary: result.summary || 'Validation completed',
    };
  }

  /**
   * Generate summary for batch validation
   */
  private generateBatchSummary(
    results: Array<{ product: PartialACPProduct; validation: LLMValidationResult }>
  ): string {
    const totalErrors = results.reduce(
      (sum, r) => sum + r.validation.issues.filter((i) => i.severity === 'error').length,
      0
    );
    const totalWarnings = results.reduce(
      (sum, r) => sum + r.validation.issues.filter((i) => i.severity === 'warning').length,
      0
    );
    const avgScore =
      results.reduce((sum, r) => sum + r.validation.overallScore, 0) / results.length;

    return `Validated ${results.length} products. Average quality score: ${avgScore.toFixed(1)}. Found ${totalErrors} errors and ${totalWarnings} warnings.`;
  }
}

// Export singleton instance
export const llmValidator = new LLMValidatorService();

// Export types and class
export { LLMValidatorService };
