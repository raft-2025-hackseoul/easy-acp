// Load environment variables from .env file
import 'dotenv/config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import productFeedRoutes from './routes/product-feed.routes';
import aiSEORoutes from './routes/ai-seo.routes';
import woocommerceMockRoutes from './routes/woocommerce-mock.routes';
import providerSyncRoutes from './routes/provider-sync.routes';
import mockOpenAIRoutes from './routes/mock-openai.routes';

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

// AI SEO routes
app.use('/api/ai-seo', aiSEORoutes);

// Mock WooCommerce API routes
app.use('/api/woocommerce', woocommerceMockRoutes);

// Provider sync workflow routes
app.use('/api/provider-sync', providerSyncRoutes);

// Mock OpenAI merchant endpoint
app.use('/api/mock-openai', mockOpenAIRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);

  // Display environment variable status
  console.log('\n📋 Environment Configuration:');
  console.log(`   PORT: ${PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

  // Check API keys
  const hasOpenAI =
    !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here';
  const hasOpenRouter =
    !!process.env.OPENROUTER_API_KEY &&
    process.env.OPENROUTER_API_KEY !== 'your-openrouter-api-key-here';

  console.log(`   OPENAI_API_KEY: ${hasOpenAI ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   OPENROUTER_API_KEY: ${hasOpenRouter ? '✅ Configured' : '❌ Not configured'}`);

  if (hasOpenRouter) {
    const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
    console.log(`   OPENROUTER_MODEL: ${model}`);
  }

  console.log('\n💡 Features:');
  console.log(
    `   AI Field Mapping: ${hasOpenAI ? '✅ Enabled' : '⚠️  Disabled (using basic mapping)'}`
  );
  console.log(
    `   LLM Validation: ${hasOpenRouter ? '✅ Enabled' : '⚠️  Disabled (traditional validation only)'}`
  );
  console.log('');
});
