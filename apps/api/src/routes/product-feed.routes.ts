import { Router, Request, Response } from 'express';
import fs from 'fs';
import { upload } from '../middleware/upload.middleware';
import { parseCSV, convertToCSV, convertToJSON } from '../services/csv-parser.service';
import { suggestFieldMapping, applyFieldMapping } from '../services/ai-mapper.service';
import {
  categorizeProducts,
  validateProductsWithLLM,
  validateProductWithLLM,
  isLLMValidationAvailable,
  validateProductsCombined,
} from '../services/validation.service';
import { PartialACPProduct } from '@repo/acp-types';

const router = Router();

/**
 * Upload and process CSV file
 * POST /api/product-feed/upload
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Read file content
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');

    // Parse CSV
    const parseResult = parseCSV(fileContent);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse CSV',
        details: parseResult.errors,
      });
    }

    // Extract sample data for AI mapping
    const sampleData = parseResult.data.slice(0, 3) as unknown as Record<string, string>[];

    // Suggest field mappings using AI
    const fieldMappings = await suggestFieldMapping(parseResult.headers, sampleData);

    // Apply field mapping
    const mappedProducts = applyFieldMapping(
      parseResult.data as unknown as Record<string, string>[],
      fieldMappings
    );

    // Validate products
    const categorized = categorizeProducts(mappedProducts as PartialACPProduct[]);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        totalRows: parseResult.totalRows,
        validProducts: categorized.valid.length,
        invalidProducts: categorized.invalid.length,
        products: mappedProducts,
        fieldMappings: fieldMappings.map((m) => ({
          source: m.sourceField,
          target: m.targetField,
          confidence: m.confidence,
        })),
        validation: {
          missingRequired: categorized.summary.missingRequired,
          missingRecommended: categorized.summary.missingRecommended,
          totalErrors: categorized.summary.totalErrors,
          totalWarnings: categorized.summary.totalWarnings,
        },
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Validate products
 * POST /api/product-feed/validate
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Products must be an array',
      });
    }

    const categorized = categorizeProducts(products);

    res.json({
      success: true,
      data: {
        valid: categorized.valid,
        invalid: categorized.invalid,
        summary: categorized.summary,
      },
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Export products to CSV
 * POST /api/product-feed/export/csv
 */
router.post('/export/csv', async (req: Request, res: Response) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Products must be an array',
      });
    }

    const csv = convertToCSV(products);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="acp-product-feed.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Export products to JSON
 * POST /api/product-feed/export/json
 */
router.post('/export/json', async (req: Request, res: Response) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Products must be an array',
      });
    }

    const json = convertToJSON(products);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="acp-product-feed.json"');
    res.send(json);
  } catch (error) {
    console.error('Export JSON error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Get ACP field definitions
 * GET /api/product-feed/fields
 */
router.get('/fields', async (_req: Request, res: Response) => {
  try {
    const { ACP_FIELDS, getRequiredFields, getRecommendedFields } = await import('@repo/acp-types');

    res.json({
      success: true,
      data: {
        all: ACP_FIELDS,
        required: getRequiredFields(),
        recommended: getRecommendedFields(),
      },
    });
  } catch (error) {
    console.error('Fields error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Check if LLM validation is available
 * GET /api/product-feed/llm/status
 */
router.get('/llm/status', (_req: Request, res: Response) => {
  try {
    const available = isLLMValidationAvailable();

    res.json({
      success: true,
      data: {
        available,
        message: available
          ? 'LLM validation is available'
          : 'LLM validation is not available. Please configure OPENROUTER_API_KEY.',
      },
    });
  } catch (error) {
    console.error('LLM status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Validate products using LLM
 * POST /api/product-feed/llm/validate
 */
router.post('/llm/validate', async (req: Request, res: Response) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Products must be an array',
      });
    }

    if (!isLLMValidationAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'LLM validation is not available. Please configure OPENROUTER_API_KEY.',
      });
    }

    const validation = await validateProductsWithLLM(products as PartialACPProduct[]);

    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error('LLM validation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Validate a single product using LLM
 * POST /api/product-feed/llm/validate-one
 */
router.post('/llm/validate-one', async (req: Request, res: Response) => {
  try {
    const { product } = req.body;

    if (!product || typeof product !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Product must be an object',
      });
    }

    if (!isLLMValidationAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'LLM validation is not available. Please configure OPENROUTER_API_KEY.',
      });
    }

    const validation = await validateProductWithLLM(product as PartialACPProduct);

    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error('LLM validation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Upload and process CSV file with optional LLM validation
 * POST /api/product-feed/upload-with-llm
 */
router.post('/upload-with-llm', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Read file content
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');

    // Parse CSV
    const parseResult = parseCSV(fileContent);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse CSV',
        details: parseResult.errors,
      });
    }

    // Extract sample data for AI mapping
    const sampleData = parseResult.data.slice(0, 3) as unknown as Record<string, string>[];

    // Suggest field mappings using AI
    const fieldMappings = await suggestFieldMapping(parseResult.headers, sampleData);

    // Apply field mapping
    const mappedProducts = applyFieldMapping(
      parseResult.data as unknown as Record<string, string>[],
      fieldMappings
    );

    // Validate products with both traditional and LLM validation
    // Note: LLM validation is limited to a sample by default to avoid timeouts
    // Use ?llmSampleSize=N query param to change (max 50)
    const llmSampleSize = Math.min(
      parseInt(req.query.llmSampleSize as string) || 5,
      50
    );

    console.log(`📊 Processing ${mappedProducts.length} products...`);
    console.log(`📊 LLM will validate first ${llmSampleSize} products`);

    const validation = await validateProductsCombined(mappedProducts as PartialACPProduct[], {
      llmSampleSize,
      maxConcurrent: 3, // Process 3 at a time to avoid rate limits
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        totalRows: parseResult.totalRows,
        validProducts: validation.traditional.valid.length,
        invalidProducts: validation.traditional.invalid.length,
        products: mappedProducts,
        fieldMappings: fieldMappings.map((m) => ({
          source: m.sourceField,
          target: m.targetField,
          confidence: m.confidence,
        })),
        validation: {
          traditional: {
            missingRequired: validation.traditional.summary.missingRequired,
            missingRecommended: validation.traditional.summary.missingRecommended,
            totalErrors: validation.traditional.summary.totalErrors,
            totalWarnings: validation.traditional.summary.totalWarnings,
          },
          llm: validation.llm,
          hasLLMValidation: validation.hasLLMValidation,
        },
      },
    });
  } catch (error) {
    console.error('Upload with LLM error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

export default router;
