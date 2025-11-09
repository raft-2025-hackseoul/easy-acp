import { Router, Request, Response } from 'express';
import fs from 'fs';
import { upload } from '../middleware/upload.middleware';
import { parseCSV, convertToCSV } from '../services/csv-parser.service';
import { aiSEOService } from '../services/ai-seo.service';

const router = Router();

/**
 * Analyze products and provide optimization suggestions
 * POST /api/ai-seo/analyze
 */
router.post('/analyze', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Check if service is available
    if (!aiSEOService.isServiceAvailable()) {
      return res.status(503).json({
        success: false,
        error:
          'AI SEO service is not available. Please configure OPENAI_API_KEY or OPENROUTER_API_KEY in your environment.',
      });
    }

    // Read and parse CSV file
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const parseResult = parseCSV(fileContent);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse CSV',
        details: parseResult.errors,
      });
    }

    // Analyze products with AI using trend-informed approach
    const analysisResult = await aiSEOService.analyzeProductsWithTrends(parseResult.data);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    console.error('AI SEO analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Export optimized products to CSV
 * POST /api/ai-seo/export
 */
router.post('/export', async (req: Request, res: Response) => {
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
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="optimized-products-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Export optimized CSV error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Check AI SEO service status
 * GET /api/ai-seo/status
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const isAvailable = aiSEOService.isServiceAvailable();

    res.json({
      success: true,
      data: {
        available: isAvailable,
        message: isAvailable
          ? 'AI SEO service is ready'
          : 'AI SEO service requires API key configuration',
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Accept and apply an optimization suggestion
 * POST /api/ai-seo/accept-suggestion
 */
router.post('/accept-suggestion', async (req: Request, res: Response) => {
  try {
    const { productId, field, value } = req.body;

    // Validate required params
    if (!productId || !field || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: productId, field, value',
      });
    }

    // Check if service is available
    if (!aiSEOService.isServiceAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'AI SEO service is not available',
      });
    }

    // Accept suggestion logic here
    // Note: This is currently mocked but would integrate with
    // the actual optimization storage in production
    res.json({
      success: true,
      data: {
        productId,
        field,
        value,
        message: `Successfully applied suggestion for ${field} on product ${productId}`,
      },
    });
  } catch (error) {
    console.error('Error accepting suggestion:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error accepting suggestion',
    });
  }
});

export default router;
