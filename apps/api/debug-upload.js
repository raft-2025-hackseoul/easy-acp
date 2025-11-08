/**
 * Debug script to test CSV upload with LLM validation
 * This will help identify where the issue is
 */

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
  console.log('🔍 Debugging CSV Upload with LLM Validation\n');

  const API_URL = 'http://localhost:3001';

  // 1. Check if server is running
  console.log('1️⃣ Checking server status...');
  try {
    const healthResponse = await fetch(`${API_URL}/api/health`);
    if (healthResponse.ok) {
      console.log('   ✅ Server is running\n');
    } else {
      console.log('   ❌ Server returned error:', healthResponse.status);
      return;
    }
  } catch (error) {
    console.log('   ❌ Server is not running!');
    console.log('   Start it with: npm run dev\n');
    return;
  }

  // 2. Check LLM status
  console.log('2️⃣ Checking LLM validation status...');
  try {
    const statusResponse = await fetch(`${API_URL}/api/product-feed/llm/status`);
    const statusData = await statusResponse.json();

    if (statusData.success && statusData.data.available) {
      console.log('   ✅ LLM validation is available');
      console.log(`   Message: ${statusData.data.message}\n`);
    } else {
      console.log('   ❌ LLM validation not available');
      console.log('   Response:', JSON.stringify(statusData, null, 2));
      return;
    }
  } catch (error) {
    console.log('   ❌ Error checking LLM status:', error.message);
    return;
  }

  // 3. Test single product validation first
  console.log('3️⃣ Testing single product LLM validation...');
  const testProduct = {
    id: 'DEBUG-001',
    title: 'Debug Test Product',
    description: 'This is a test product for debugging',
    price: '19.99 USD',
    image_link: 'https://example.com/test.jpg',
    link: 'https://example.com/product',
    brand: 'TestBrand',
    availability: 'in_stock',
    inventory_quantity: 10,
    enable_search: true,
    enable_checkout: false,
  };

  try {
    console.log('   Sending product to LLM...');
    const startTime = Date.now();

    const validateResponse = await fetch(`${API_URL}/api/product-feed/llm/validate-one`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: testProduct }),
    });

    const duration = Date.now() - startTime;

    if (!validateResponse.ok) {
      console.log(`   ❌ Validation failed (${validateResponse.status})`);
      const errorData = await validateResponse.json();
      console.log('   Error:', JSON.stringify(errorData, null, 2));
      return;
    }

    const validateData = await validateResponse.json();
    console.log(`   ✅ LLM responded in ${duration}ms`);
    console.log('   Validation result:');
    console.log(`      - Is Valid: ${validateData.data.isValid}`);
    console.log(`      - Score: ${validateData.data.overallScore}/100`);
    console.log(`      - Issues: ${validateData.data.issues.length}`);
    console.log('');
  } catch (error) {
    console.log('   ❌ Error during validation:', error.message);
    console.log('   Stack:', error.stack);
    return;
  }

  // 4. Test CSV upload
  console.log('4️⃣ Testing CSV upload with LLM validation...');

  const csvPath = '../../example-products.csv';
  if (!fs.existsSync(csvPath)) {
    console.log(`   ⚠️  CSV file not found: ${csvPath}`);
    console.log('   Skipping CSV upload test\n');
    return;
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(csvPath));

    console.log('   Uploading CSV file...');
    const startTime = Date.now();

    const uploadResponse = await fetch(`${API_URL}/api/product-feed/upload-with-llm`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const duration = Date.now() - startTime;

    if (!uploadResponse.ok) {
      console.log(`   ❌ Upload failed (${uploadResponse.status})`);
      const errorData = await uploadResponse.json();
      console.log('   Error:', JSON.stringify(errorData, null, 2));
      return;
    }

    const uploadData = await uploadResponse.json();
    console.log(`   ✅ Upload completed in ${duration}ms`);
    console.log('   Results:');
    console.log(`      - Total rows: ${uploadData.data.totalRows}`);
    console.log(`      - Valid products: ${uploadData.data.validProducts}`);
    console.log(`      - Invalid products: ${uploadData.data.invalidProducts}`);
    console.log(`      - Has LLM validation: ${uploadData.data.validation.hasLLMValidation}`);

    if (uploadData.data.validation.hasLLMValidation) {
      console.log('   ✅ LLM validation results included!');
      console.log(`      - LLM Summary: ${uploadData.data.validation.llm.overallSummary}`);
    } else {
      console.log('   ⚠️  LLM validation NOT included in results');
      console.log('   This is the issue - LLM did not respond during CSV upload');
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Error during upload:', error.message);
    console.log('   Stack:', error.stack);
  }

  console.log('✅ Debug test complete\n');
}

// Run the test
testUpload().catch(console.error);
