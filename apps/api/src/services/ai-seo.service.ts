import OpenAI from 'openai';
import { PartialACPProduct } from '@repo/acp-types';

/**
 * Trend Analysis Result
 */
export interface TrendAnalysis {
  category: string;
  trends: string[];
  searchTerms: string[];
  competitiveInsights: string[];
  summary: string;
}

/**
 * Field Optimization Suggestion
 */
export interface FieldOptimization {
  field: string;
  currentValue: string;
  suggestedValue: string;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
}

/**
 * Product Optimization Result
 */
export interface ProductOptimization {
  productId: string;
  productName: string;
  originalIndex: number; // Index in original products array
  optimizations: FieldOptimization[];
  overallScore: number; // 1-10
  potentialImprovement: number; // percentage
}

/**
 * Complete AI SEO Analysis Result
 */
export interface AISEOAnalysisResult {
  totalProducts: number;
  trendAnalysis: TrendAnalysis;
  productOptimizations: ProductOptimization[];
  originalProducts: any[]; // Original CSV data
  summary: string;
  timestamp: string;
}

/**
 * AI SEO Service - Uses ChatGPT to analyze trends and suggest optimizations
 */
class AISEOService {
  private client: OpenAI | null = null;
  private isAvailable: boolean = false;

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize OpenRouter or OpenAI client
   */
  private initializeClient() {
    // Try OpenRouter first (for Claude)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey && openRouterKey !== 'your-openrouter-api-key-here') {
      this.client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: openRouterKey,
        defaultHeaders: {
          'HTTP-Referer': 'https://github.com/yourusername/easy-acp',
          'X-Title': 'Easy ACP - AI SEO',
        },
      });
      this.isAvailable = true;
      console.log('✅ AI SEO Service: OpenRouter initialized');
      return;
    }

    // Fall back to OpenAI
    const openAIKey = process.env.OPENAI_API_KEY;
    if (openAIKey && openAIKey !== 'your-openai-api-key-here') {
      this.client = new OpenAI({
        apiKey: openAIKey,
      });
      this.isAvailable = true;
      console.log('✅ AI SEO Service: OpenAI initialized');
      return;
    }

    console.warn('⚠️  AI SEO Service: No API key configured');
    this.isAvailable = false;
  }

  /**
   * Check if AI SEO service is available
   */
  public isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Strip markdown code fences from JSON response
   */
  private stripMarkdownFences(content: string): string {
    // Remove ```json or ``` at the start and end
    return content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
  }

  /**
   * Extract product name from various field possibilities
   */
  private getProductName(product: any): string {
    return (
      product.title ||
      product.name ||
      product.product_name ||
      product.product_title ||
      product.item_name ||
      product.item_title ||
      `Product ${product.id || 'Unknown'}`
    );
  }

  /**
   * Extract product ID from various field possibilities
   */
  private getProductId(product: any, index: number): string {
    return (
      product.id || product.product_id || product.sku || product.item_id || `product_${index + 1}`
    );
  }

  /**
   * Analyze products with trend-informed optimization
   */
  public async analyzeProductsWithTrends(products: any[]): Promise<AISEOAnalysisResult> {
    if (!this.client) {
      throw new Error('AI SEO service not available. Please configure API keys.');
    }

    // Step 1: Get trend insights (used internally for better optimizations)
    const trendAnalysis = await this.analyzeTrends(products);

    // Step 2: Generate optimizations for each product with trend context
    const productOptimizations = await this.generateOptimizationsWithContext(
      products.slice(0, 50), // Process up to 50 products
      trendAnalysis
    );

    const timestamp = new Date().toISOString();

    // Calculate overall summary
    const avgScore =
      productOptimizations.reduce((sum, p) => sum + p.overallScore, 0) /
      productOptimizations.length;
    const avgImprovement =
      productOptimizations.reduce((sum, p) => sum + p.potentialImprovement, 0) /
      productOptimizations.length;

    const summary = `Analyzed ${productOptimizations.length} products with an average SEO score of ${avgScore.toFixed(1)}/10. Potential improvement: +${avgImprovement.toFixed(0)}% with suggested optimizations.`;

    return {
      totalProducts: products.length,
      trendAnalysis: {
        category: 'Products',
        trends: [],
        searchTerms: [],
        competitiveInsights: [],
        summary: '',
      },
      productOptimizations,
      originalProducts: products, // Include original CSV data
      summary,
      timestamp,
    };
  }

  /**
   * Analyze products for SEO optimization (legacy method)
   */
  public async analyzeProducts(products: any[]): Promise<AISEOAnalysisResult> {
    if (!this.client) {
      throw new Error('AI SEO service not available. Please configure API keys.');
    }

    // Step 1: Generate optimizations for each product (no trend analysis needed)
    const productOptimizations = await this.generateOptimizations(
      products.slice(0, 50) // Process up to 50 products
    );

    const timestamp = new Date().toISOString();

    // Calculate overall summary
    const avgScore =
      productOptimizations.reduce((sum, p) => sum + p.overallScore, 0) /
      productOptimizations.length;
    const avgImprovement =
      productOptimizations.reduce((sum, p) => sum + p.potentialImprovement, 0) /
      productOptimizations.length;

    const summary = `Analyzed ${productOptimizations.length} products with an average SEO score of ${avgScore.toFixed(1)}/10. Potential improvement: +${avgImprovement.toFixed(0)}% with suggested optimizations.`;

    return {
      totalProducts: products.length,
      trendAnalysis: {
        category: 'Products',
        trends: [],
        searchTerms: [],
        competitiveInsights: [],
        summary: '',
      },
      productOptimizations,
      originalProducts: products, // Include original CSV data
      summary,
      timestamp,
    };
  }

  /**
   * Analyze current market trends using ChatGPT
   */
  public async analyzeTrends(productSummary: any[]): Promise<TrendAnalysis> {
    if (!this.client) {
      throw new Error('AI client not initialized');
    }

    const model = this.getModel();

    const prompt = `
    You are a senior e-commerce strategist specializing in SEO optimization and ChatGPT's Agentic Commerce Protocol (ACP).
    Your task is to analyze the following products and synthesize high-quality, up-to-date insights based on real 2025 trends and search behaviors.
    
    Use current global and ChatGPT-specific search trends, news, and user behaviors (as of today) to guide your answers.
    
    Products:
    ${JSON.stringify(productSummary, null, 2)}
    
    For these products, return an analysis in this exact JSON format:
    
    {
      "category": "Primary market or category these products fit in",
      "trends": [
        "Top 5 emerging or dominant consumer and AI-commerce trends relevant to these products, phrased clearly and concisely"
      ],
      "searchTerms": [
        "10 popular real-world search terms ChatGPT or web users are using right now to find similar products"
      ],
      "competitiveInsights": [
        "5 insights on what differentiates leading products in this category within ChatGPT’s ACP ecosystem — e.g., metadata quality, trust signals, dynamic pricing, product completeness, eco/AI claims, etc."
      ],
      "summary": "A concise summary (3–5 sentences) describing the current market landscape, AI-commerce opportunities, and how merchants can stand out when surfaced in ChatGPT ACP results."
    }
    
    Guidelines:
    - Base trends and search terms on current news, SEO data, and 2025 AI-commerce patterns.
    - Avoid generic or outdated insights.
    - Use plain, clear phrasing suitable for product feed optimization.
    - Respond ONLY with valid JSON and nothing else.
    `;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert SEO analyst specializing in ChatGPT ACP optimization. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const cleanedContent = this.stripMarkdownFences(content);
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error('Trend analysis error:', error);
      // Return fallback data
      return {
        category: 'General Products',
        trends: [
          'Sustainable and eco-friendly options',
          'Value for money',
          'Fast shipping',
          'User reviews and ratings',
          'Product authenticity',
        ],
        searchTerms: [
          'best products',
          'affordable options',
          'high quality',
          'recommended',
          'top rated',
          'customer favorite',
          'best value',
          'popular choice',
          'trusted brand',
          'verified seller',
        ],
        competitiveInsights: [
          'Detailed product descriptions perform better',
          'Clear pricing and availability information is crucial',
          'Customer reviews significantly impact visibility',
          'High-quality images and specifications matter',
          'Unique value propositions stand out',
        ],
        summary:
          'Focus on clear, detailed product information with strong value propositions. Authenticity and customer reviews are key differentiators.',
      };
    }
  }

  /**
   * Generate optimization suggestions with trend context
   */
  private async generateOptimizationsWithContext(
    products: any[],
    trendAnalysis: TrendAnalysis
  ): Promise<ProductOptimization[]> {
    if (!this.client) {
      throw new Error('AI client not initialized');
    }

    const model = this.getModel();
    const optimizations: ProductOptimization[] = [];

    // Process products in batches of 3 to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      // Prepare batch with extracted names and IDs
      const preparedBatch = batch.map((product, idx) => ({
        ...product,
        _id: this.getProductId(product, i + idx),
        _name: this.getProductName(product),
      }));

      const prompt = `You are an expert in optimizing product listings for ChatGPT's ACP (Affiliate Content Protocol).

Current Market Context:
- Popular search terms: ${trendAnalysis.searchTerms.slice(0, 5).join(', ')}
- Key trends: ${trendAnalysis.trends.slice(0, 3).join(', ')}
- Competitive insights: ${trendAnalysis.competitiveInsights.slice(0, 2).join(', ')}

Analyze these products and suggest specific optimizations to improve their visibility in ChatGPT:
${JSON.stringify(preparedBatch, null, 2)}

For each product, provide:
1. Current SEO score (1-10) based on completeness and quality
2. Potential improvement percentage
3. Specific field optimizations with concrete suggestions that align with current market trends

Focus on:
- Making titles clear, descriptive, and aligned with popular search terms
- Enhancing descriptions with relevant details that match current trends
- Ensuring all important fields are filled
- Improving searchability based on market insights

Respond ONLY with valid JSON array in this exact format:
[
  {
    "productId": "use _id field",
    "productName": "use _name field",
    "overallScore": 7,
    "potentialImprovement": 25,
    "optimizations": [
      {
        "field": "description",
        "currentValue": "current description text",
        "suggestedValue": "improved description with more details",
        "reasoning": "Why this change improves visibility",
        "impact": "high"
      }
    ]
  }
]`;

      try {
        const response = await this.client.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert product optimization specialist for ChatGPT ACP. Always respond with valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        const content = response.choices[0]?.message?.content || '[]';
        const cleanedContent = this.stripMarkdownFences(content);
        const batchOptimizations = JSON.parse(cleanedContent);

        // Add originalIndex to each optimization
        batchOptimizations.forEach((opt: ProductOptimization, batchIdx: number) => {
          opt.originalIndex = i + batchIdx;
          optimizations.push(opt);
        });
      } catch (error) {
        console.error('Optimization generation error:', error);
        // Add fallback optimizations for this batch
        batch.forEach((product, idx) => {
          const productName = this.getProductName(product);
          const productId = this.getProductId(product, i + idx);
          const description = product.description || product.desc || '';

          optimizations.push({
            productId,
            productName,
            originalIndex: i + idx,
            overallScore: 6,
            potentialImprovement: 20,
            optimizations: [
              {
                field: 'title',
                currentValue: productName,
                suggestedValue: `${productName} - High Quality`,
                reasoning: 'Add descriptive keywords to improve searchability',
                impact: 'high',
              },
              {
                field: 'description',
                currentValue: description,
                suggestedValue: description
                  ? `${description} This product offers excellent quality and value.`
                  : 'High-quality product with excellent features and reliable performance.',
                reasoning: 'Enhance description with more details',
                impact: 'high',
              },
            ],
          });
        });
      }
    }

    return optimizations;
  }

  /**
   * Generate optimization suggestions for products
   */
  private async generateOptimizations(products: any[]): Promise<ProductOptimization[]> {
    if (!this.client) {
      throw new Error('AI client not initialized');
    }

    const model = this.getModel();
    const optimizations: ProductOptimization[] = [];

    // Process products in batches of 3 to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      // Prepare batch with extracted names and IDs
      const preparedBatch = batch.map((product, idx) => ({
        ...product,
        _id: this.getProductId(product, i + idx),
        _name: this.getProductName(product),
      }));

      const prompt = `You are an expert in optimizing product listings for ChatGPT's ACP (Affiliate Content Protocol).

Analyze these products and suggest specific optimizations to improve their visibility in ChatGPT:
${JSON.stringify(preparedBatch, null, 2)}

For each product, provide:
1. Current SEO score (1-10) based on completeness and quality
2. Potential improvement percentage
3. Specific field optimizations with concrete suggestions

Focus on:
- Making titles clear and descriptive
- Enhancing descriptions with relevant details
- Ensuring all important fields are filled
- Improving searchability

Respond ONLY with valid JSON array in this exact format:
[
  {
    "productId": "use _id field",
    "productName": "use _name field",
    "overallScore": 7,
    "potentialImprovement": 25,
    "optimizations": [
      {
        "field": "description",
        "currentValue": "current description text",
        "suggestedValue": "improved description with more details",
        "reasoning": "Why this change improves visibility",
        "impact": "high"
      }
    ]
  }
]`;

      try {
        const response = await this.client.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert product optimization specialist for ChatGPT ACP. Always respond with valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        const content = response.choices[0]?.message?.content || '[]';
        const cleanedContent = this.stripMarkdownFences(content);
        const batchOptimizations = JSON.parse(cleanedContent);

        // Add originalIndex to each optimization
        batchOptimizations.forEach((opt: ProductOptimization, batchIdx: number) => {
          opt.originalIndex = i + batchIdx;
          optimizations.push(opt);
        });
      } catch (error) {
        console.error('Optimization generation error:', error);
        // Add fallback optimizations for this batch
        batch.forEach((product, idx) => {
          const productName = this.getProductName(product);
          const productId = this.getProductId(product, i + idx);
          const description = product.description || product.desc || '';

          optimizations.push({
            productId,
            productName,
            originalIndex: i + idx,
            overallScore: 6,
            potentialImprovement: 20,
            optimizations: [
              {
                field: 'title',
                currentValue: productName,
                suggestedValue: `${productName} - High Quality`,
                reasoning: 'Add descriptive keywords to improve searchability',
                impact: 'high',
              },
              {
                field: 'description',
                currentValue: description,
                suggestedValue: description
                  ? `${description} This product offers excellent quality and value.`
                  : 'High-quality product with excellent features and reliable performance.',
                reasoning: 'Enhance description with more details',
                impact: 'high',
              },
            ],
          });
        });
      }
    }

    return optimizations;
  }

  /**
   * Get the appropriate model based on configuration
   */
  private getModel(): string {
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey && openRouterKey !== 'your-openrouter-api-key-here') {
      return process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
    }
    return 'gpt-4o-mini'; // OpenAI fallback
  }
}

// Export singleton instance
export const aiSEOService = new AISEOService();
