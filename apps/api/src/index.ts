import express, { Request, Response } from 'express';
import cors from 'cors';
import productFeedRoutes from './routes/product-feed.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for large product feeds
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Backend is running! Express + TypeScript',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({
    message: 'Hello from Easy ACP API!',
  });
});

// Product feed routes
app.use('/api/product-feed', productFeedRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
