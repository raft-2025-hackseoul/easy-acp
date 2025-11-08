import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PartialACPProduct } from '@repo/acp-types';
import { LLMValidationIssue } from './llm-validator.service';

/**
 * Product Enhancement Result
 */
export interface ProductEnhancementResult {
  enhancedProduct: PartialACPProduct;
  changes: ProductChange[];
  summary: string;
  qualityImprovement: number; // Score difference
}

export interface ProductChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

/**
 * Issue Resolution Result
 */
export interface IssueResolutionResult {
  suggestedFix: {
    field: string;
    value: any;
    reason: string;
  };
  updatedProduct: PartialACPProduct;
}

/**
 * Product Enhancer Service using LLM
 */
class ProductEnhancerService {
  private client: OpenAI | null = null;
  private acpSpec: string = '';

  constructor() {
    this.initializeClient();
    this.loadACPSpec();
  }

  /**
   * Initialize OpenRouter client
   */
  private initializeClient() {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not configured. Product enhancement will be disabled.');
      return;
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'ACP Product Feed Enhancer',
      },
    });
  }

  /**
   * Load ACP specification
   */
  private loadACPSpec() {
    try {
      const possiblePaths = [
        join(__dirname, '../specs/acp-product-feed-spec.md'),
        join(__dirname, '../../src/specs/acp-product-feed-spec.md'),
        join(process.cwd(), 'src/specs/acp-product-feed-spec.md'),
        join(process.cwd(), 'apps/api/src/specs/acp-product-feed-spec.md'),
      ];

      for (const specPath of possiblePaths) {
        try {
          this.acpSpec = readFileSync(specPath, 'utf-8');
          console.log(`✅ Product Enhancer loaded ACP spec from: ${specPath}`);
          return;
        } catch {
          // Try next path
        }
      }

      throw new Error('ACP spec file not found');
    } catch (error) {
      console.error('Failed to load ACP specification for enhancer:', error);
      this.acpSpec = 'ACP specification not available';
    }
  }

  /**
   * Check if enhancement service is available
   */
  public isAvailable(): boolean {
    return this.client !== null && this.acpSpec !== 'ACP specification not available';
  }

  /**
   * Enhance a product using LLM
   */
  public async enhanceProduct(product: PartialACPProduct): Promise<ProductEnhancementResult> {
    if (!this.isAvailable()) {
      throw new Error('Product enhancement is not available. Please configure OPENROUTER_API_KEY.');
    }

    try {
      const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

      const prompt = this.buildEnhancementPrompt(product);

      const completion = await this.client!.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an expert at enhancing product data for e-commerce compliance with the Agentic Commerce Protocol (ACP).
Your task is to analyze product data and enhance it by:
1. Filling missing required and recommended fields with realistic, appropriate values
2. Improving existing field values for better quality and compliance
3. Ensuring all data meets ACP specification requirements
4. Providing clear explanations for each change

Return only valid JSON in the specified format.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      const result = JSON.parse(responseText);

      return this.parseEnhancementResult(result, product);
    } catch (error) {
      console.error('Product enhancement error:', error);
      throw new Error(
        `Product enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Resolve a specific validation issue
   */
  public async resolveIssue(
    product: PartialACPProduct,
    issue: LLMValidationIssue
  ): Promise<IssueResolutionResult> {
    if (!this.isAvailable()) {
      throw new Error('Issue resolution is not available. Please configure OPENROUTER_API_KEY.');
    }

    try {
      const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

      const prompt = this.buildIssueResolutionPrompt(product, issue);

      const completion = await this.client!.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an expert at fixing product data issues for the Agentic Commerce Protocol (ACP).
Your task is to provide a specific fix for a validation issue.
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

      return this.parseIssueResolutionResult(result, product);
    } catch (error) {
      console.error('Issue resolution error:', error);
      throw new Error(
        `Issue resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build enhancement prompt
   */
  private buildEnhancementPrompt(product: PartialACPProduct): string {
    return `# Task: Enhance Product Data for ACP Compliance

## ACP Product Feed Specification

${this.acpSpec}

---

## Current Product Data

\`\`\`json
${JSON.stringify(product, null, 2)}
\`\`\`

---

## Enhancement Instructions

1. **Analyze** the current product data
2. **Identify** missing required and recommended fields
3. **Enhance** the product by:
   - Filling missing required fields with appropriate, realistic values
   - Filling missing recommended fields when beneficial
   - Improving existing field values for better quality
   - Ensuring all values meet ACP specification requirements
   - Making intelligent inferences based on existing data

4. **Guidelines**:
   - If title exists, use it to infer product category, brand, etc.
   - Generate realistic descriptions if missing
   - Infer availability from inventory_count if present
   - Use consistent currency codes
   - Generate valid URLs in proper format
   - Ensure prices are realistic and properly formatted
   - Make intelligent choices based on product context

## Response Format (JSON only)

\`\`\`json
{
  "enhancedProduct": {
    // Complete product object with all enhancements applied
    // Include ALL original fields plus new/modified ones
  },
  "changes": [
    {
      "field": "field_name",
      "oldValue": "previous value or null if new",
      "newValue": "new enhanced value",
      "reason": "Clear explanation of why this change improves the product"
    }
  ],
  "summary": "Brief summary of enhancements made",
  "qualityImprovement": number // Estimated quality score improvement (0-100)
}
\`\`\`

**Important**:
- Preserve all existing valid data
- Only modify fields that need improvement
- Be conservative with changes - don't change good data
- Provide clear, helpful explanations
- Return ONLY valid JSON, no markdown formatting`;
  }

  /**
   * Build issue resolution prompt
   */
  private buildIssueResolutionPrompt(
    product: PartialACPProduct,
    issue: LLMValidationIssue
  ): string {
    return `# Task: Resolve Specific Product Validation Issue

## ACP Product Feed Specification

${this.acpSpec}

---

## Product Data

\`\`\`json
${JSON.stringify(product, null, 2)}
\`\`\`

---

## Issue to Resolve

**Field**: ${issue.field || 'General product issue'}
**Severity**: ${issue.severity}
**Problem**: ${issue.message}
${issue.suggestion ? `**Suggested Fix**: ${issue.suggestion}` : ''}

---

## Resolution Instructions

1. **Analyze** the specific issue
2. **Provide** a concrete fix:
   - The exact field to modify
   - The exact value to use
   - Clear explanation of why this fixes the issue

3. **Consider**:
   - Context from other fields
   - ACP specification requirements
   - Best practices for product data

## Response Format (JSON only)

\`\`\`json
{
  "suggestedFix": {
    "field": "field_name",
    "value": "corrected value",
    "reason": "Detailed explanation of how this fixes the issue"
  },
  "updatedProduct": {
    // Complete product object with the fix applied
  }
}
\`\`\`

**Important**:
- Provide a specific, actionable fix
- Ensure the fix fully resolves the issue
- Don't change unrelated fields
- Return ONLY valid JSON, no markdown formatting`;
  }

  /**
   * Parse enhancement result
   */
  private parseEnhancementResult(
    result: any,
    originalProduct: PartialACPProduct
  ): ProductEnhancementResult {
    return {
      enhancedProduct: result.enhancedProduct || originalProduct,
      changes: (result.changes || []).map((change: any) => ({
        field: change.field || 'unknown',
        oldValue: change.oldValue,
        newValue: change.newValue,
        reason: change.reason || 'No reason provided',
      })),
      summary: result.summary || 'Product enhanced',
      qualityImprovement: Math.min(100, Math.max(0, result.qualityImprovement ?? 0)),
    };
  }

  /**
   * Parse issue resolution result
   */
  private parseIssueResolutionResult(
    result: any,
    originalProduct: PartialACPProduct
  ): IssueResolutionResult {
    return {
      suggestedFix: {
        field: result.suggestedFix?.field || 'unknown',
        value: result.suggestedFix?.value,
        reason: result.suggestedFix?.reason || 'No reason provided',
      },
      updatedProduct: result.updatedProduct || originalProduct,
    };
  }
}

// Export singleton instance
export const productEnhancer = new ProductEnhancerService();

// Export types and class
export { ProductEnhancerService };
