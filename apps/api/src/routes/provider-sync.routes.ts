import { Router, Request, Response } from 'express';
import {
  connectProvider,
  fetchProviderProducts,
  generateMappingAndValidate,
  getSyncState,
  generateProductSuggestions,
  acceptSuggestionOverride,
  removeSuggestionOverride,
  pushMappedProductsToMerchant,
  resetSync,
  updateMerchantUrl,
} from '../services/provider-sync.service';

const router = Router();

router.get('/state', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: getSyncState(),
  });
});

router.post('/reset', (_req: Request, res: Response) => {
  const state = resetSync();
  res.json({
    success: true,
    data: state,
  });
});

router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { provider, token } = req.body;
    const state = await connectProvider(provider, token);
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect provider',
    });
  }
});

router.post('/fetch', async (_req: Request, res: Response) => {
  try {
    const data = await fetchProviderProducts();
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
    });
  }
});

router.post('/map', async (_req: Request, res: Response) => {
  try {
    const data = await generateMappingAndValidate();
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to map feed',
    });
  }
});

router.post('/merchant', (req: Request, res: Response) => {
  try {
    const { merchantUrl } = req.body;
    const state = updateMerchantUrl(merchantUrl);
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save merchant URL',
    });
  }
});

router.post('/push', async (_req: Request, res: Response) => {
  try {
    const state = await pushMappedProductsToMerchant();
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to push products',
    });
  }
});

router.get('/suggestions', (_req: Request, res: Response) => {
  const state = getSyncState();
  res.json({ success: true, data: state.suggestions });
});

router.post('/suggestions/generate', async (_req: Request, res: Response) => {
  try {
    const suggestions = await generateProductSuggestions();
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate suggestions',
    });
  }
});

router.post('/suggestions/accept', (req: Request, res: Response) => {
  const { productId, field, value } = req.body || {};

  if (!productId || !field || typeof value !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'productId, field, and value are required to accept a suggestion.',
    });
  }

  const state = acceptSuggestionOverride(productId, field, value);
  res.json({ success: true, data: state });
});

router.post('/suggestions/remove', (req: Request, res: Response) => {
  const { productId, field } = req.body || {};

  if (!productId || !field) {
    return res.status(400).json({
      success: false,
      error: 'productId and field are required to remove a suggestion override.',
    });
  }

  const state = removeSuggestionOverride(productId, field);
  res.json({ success: true, data: state });
});

export default router;
