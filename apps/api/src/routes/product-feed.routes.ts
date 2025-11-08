import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { upload } from '../middleware/upload.middleware';
import { parseCSV, convertToCSV, convertToJSON } from '../services/csv-parser.service';
import { suggestFieldMapping, applyFieldMapping } from '../services/ai-mapper.service';
import { categorizeProducts } from '../services/validation.service';
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
router.get('/fields', (_req: Request, res: Response) => {
  try {
    const { ACP_FIELDS, getRequiredFields, getRecommendedFields } = require('@repo/acp-types');

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

export default router;
