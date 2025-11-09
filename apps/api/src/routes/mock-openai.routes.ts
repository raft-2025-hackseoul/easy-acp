import { Router, Request, Response } from 'express';
import {
  getMerchantStatus,
  recordMerchantPush,
  resetMerchantState,
} from '../services/mock-openai.service';

const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: getMerchantStatus(),
  });
});

router.post('/push', (req: Request, res: Response) => {
  const { products, destinationUrl } = req.body || {};

  if (!Array.isArray(products)) {
    return res.status(400).json({
      success: false,
      error: 'Payload must include a products array.',
    });
  }

  const url =
    typeof destinationUrl === 'string' && destinationUrl.trim().length > 0
      ? destinationUrl
      : 'https://mock.openai.com/merchant-feed';

  const state = recordMerchantPush(products, url);

  res.json({
    success: true,
    data: {
      message: 'Products received by mocked OpenAI merchant endpoint.',
      status: getMerchantStatus(),
      storedPayload: state.lastPayload ? { total: products.length } : null,
    },
  });
});

router.post('/reset', (_req: Request, res: Response) => {
  const status = resetMerchantState();
  res.json({ success: true, data: status });
});

export default router;
