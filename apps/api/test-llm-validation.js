/**
 * Test script to verify LLM validation setup
 * Run with: node test-llm-validation.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing LLM Validation Setup\n');

// 1. Check environment variables
console.log('1️⃣ Checking environment variables...');
require('dotenv').config();

const hasOpenRouterKey =
  !!process.env.OPENROUTER_API_KEY &&
  process.env.OPENROUTER_API_KEY !== 'your-openrouter-api-key-here';
const hasOpenAIKey =
  !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here';

console.log(
  `   OPENROUTER_API_KEY: ${hasOpenRouterKey ? '✅ Set' : '❌ Not set or using placeholder'}`
);
console.log(`   OPENAI_API_KEY: ${hasOpenAIKey ? '✅ Set' : '❌ Not set or using placeholder'}`);
console.log(`   OPENROUTER_MODEL: ${process.env.OPENROUTER_MODEL || '(using default)'}`);

if (!hasOpenRouterKey) {
  console.log('\n⚠️  WARNING: OPENROUTER_API_KEY is not configured!');
  console.log('   LLM validation will not work without this key.');
  console.log('   Get your key at: https://openrouter.ai/keys');
  console.log('   Then add it to apps/api/.env file\n');
}

// 2. Check if ACP spec file exists
console.log('\n2️⃣ Checking ACP specification file...');
const specPath = path.join(__dirname, 'src/specs/acp-product-feed-spec.md');
const specExists = fs.existsSync(specPath);
console.log(`   Spec file: ${specExists ? '✅ Found' : '❌ Not found'}`);
if (specExists) {
  const specSize = fs.statSync(specPath).size;
  console.log(`   Size: ${(specSize / 1024).toFixed(2)} KB`);
}

// 3. Check if OpenAI SDK is installed
console.log('\n3️⃣ Checking dependencies...');
try {
  require.resolve('openai');
  console.log('   openai package: ✅ Installed');
} catch (e) {
  console.log('   openai package: ❌ Not installed');
}

// 4. Test LLM validator initialization
console.log('\n4️⃣ Testing LLM validator service...');
try {
  // Dynamic import to handle TypeScript
  const validatorPath = path.join(__dirname, 'dist/services/llm-validator.service.js');

  if (!fs.existsSync(validatorPath)) {
    console.log('   ⚠️  Service not compiled. Run: npm run build');
  } else {
    console.log('   ✅ Service compiled');

    // Try to load the service
    const { llmValidator } = require(validatorPath);
    const isAvailable = llmValidator.isAvailable();
    console.log(`   LLM validation available: ${isAvailable ? '✅ Yes' : '❌ No'}`);

    if (!isAvailable && hasOpenRouterKey && specExists) {
      console.log('   ⚠️  Service exists but not available. Check logs for errors.');
    }
  }
} catch (error) {
  console.log(`   ❌ Error loading service: ${error.message}`);
}

// 5. Summary
console.log('\n📋 Summary:');
console.log('─────────────────────────────────────────');

if (hasOpenRouterKey && specExists) {
  console.log('✅ LLM validation should work!');
  console.log('\nNext steps:');
  console.log('1. Build the project: npm run build');
  console.log('2. Start the server: npm run dev');
  console.log('3. Test the endpoint: curl http://localhost:3001/api/product-feed/llm/status');
} else {
  console.log('❌ LLM validation is NOT configured properly\n');

  if (!hasOpenRouterKey) {
    console.log('TODO:');
    console.log('1. Get OpenRouter API key from https://openrouter.ai/keys');
    console.log('2. Copy .env.example to .env');
    console.log('3. Add your API key to .env file');
    console.log('4. Restart the server');
  }

  if (!specExists) {
    console.log('\nERROR: ACP spec file is missing!');
    console.log('Expected location: ' + specPath);
  }
}

console.log('─────────────────────────────────────────\n');
