import { Router, Request, Response } from 'express';
import {
  fetchMockWooCommerceProducts,
  getWooCommerceSyncState,
  validateWooToken,
} from '../services/mock-woocommerce.service';

const router = Router();

/**
 * Mock WooCommerce API - Get Products
 * GET /api/woocommerce/products
 * Requires Authorization header with API token
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    // Check for API token in header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Missing authorization header',
        message: 'Please provide an API token in the Authorization header'
      });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    // Validate token (mock validation - accepts any non-empty token)
    if (!validateWooToken(token)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API token',
        message: 'API token cannot be empty'
      });
    }

    // Return mock products via shared service
    const { products, syncId, syncedAt, total } = await fetchMockWooCommerceProducts();

    res.json({
      success: true,
      data: {
        products,
        total,
        provider: 'woocommerce',
        syncId,
        syncedAt,
      },
    });
  } catch (error) {
    console.error('WooCommerce mock API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * Test endpoint to verify connection
 * GET /api/woocommerce/test
 */
router.get('/test', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'WooCommerce mock API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Sync status endpoint
 * GET /api/woocommerce/status
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: getWooCommerceSyncState(),
  });
});

export default router;


