#!/usr/bin/env node

/**
 * Test script for the automatic field generation feature
 *
 * This script tests:
 * 1. Field generation service availability
 * 2. Missing field generation endpoint
 * 3. Product enhancement with LLM
 */

const API_BASE = 'http://localhost:3001/api';

// Sample product with missing required fields
const sampleProducts = [
  {
    product_id: 'test-001',
    title: 'Organic Cotton T-Shirt - Blue',
    price: '29.99 USD',
    availability: 'in stock',
  },
  {
    product_id: 'test-002',
    title: 'Wireless Bluetooth Headphones',
    price: '89.99 USD',
  },
];

const missingRequired = ['description', 'product_category'];
const missingRecommended = ['brand', 'image_url'];

async function testFieldGenerationStatus() {
  console.log('🔍 Checking field generation service status...\n');

  try {
    const response = await fetch(`${API_BASE}/product-feed/generation-status`);
    const result = await response.json();

    if (result.success) {
      console.log(`✅ Service Status: ${result.data.available ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
      console.log(`   Message: ${result.data.message}\n`);
      return result.data.available;
    } else {
      console.log('❌ Failed to check service status\n');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error checking status: ${error.message}\n`);
    return false;
  }
}

async function testGenerateMissingFields() {
  console.log('🚀 Testing missing field generation...\n');
  console.log('Sample Products:');
  console.log(JSON.stringify(sampleProducts, null, 2));
  console.log('\nMissing Required Fields:', missingRequired);
  console.log('Missing Recommended Fields:', missingRecommended);
  console.log('\n⏳ Generating fields (this may take a few seconds)...\n');

  try {
    const startTime = Date.now();

    const response = await fetch(`${API_BASE}/product-feed/generate-missing-fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: sampleProducts,
        missingRequired,
        missingRecommended,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(`❌ API Error: ${error.error || 'Unknown error'}\n`);
      return false;
    }

    const result = await response.json();
    const duration = Date.now() - startTime;

    if (result.success) {
      console.log('✅ Field generation completed!\n');
      console.log('📊 Summary:');
      console.log(`   Total Products: ${result.data.summary.totalProducts}`);
      console.log(`   Products Enhanced: ${result.data.summary.productsEnhanced}`);
      console.log(`   Fields Generated: ${result.data.summary.fieldsGenerated}`);
      console.log(`   Required Fields: ${result.data.summary.requiredFieldsGenerated}`);
      console.log(`   Recommended Fields: ${result.data.summary.recommendedFieldsGenerated}`);
      console.log(`   Processing Time: ${result.data.summary.processingTime}ms`);
      console.log(`   Total Request Time: ${duration}ms\n`);

      if (result.data.errors && result.data.errors.length > 0) {
        console.log('⚠️  Errors:');
        result.data.errors.forEach((error) => {
          console.log(`   Product ${error.productIndex}: ${error.error}`);
        });
        console.log();
      }

      console.log('📝 Changes Made:');
      if (result.data.changes && result.data.changes.length > 0) {
        result.data.changes.forEach((item) => {
          console.log(`\n   Product: ${item.productKey}`);
          item.changes.forEach((change) => {
            console.log(`   ✏️  ${change.field}:`);
            console.log(`      Old: ${JSON.stringify(change.oldValue)}`);
            console.log(`      New: ${JSON.stringify(change.newValue)}`);
            console.log(`      Reason: ${change.reason}`);
          });
        });
      }
      console.log();

      console.log('🎯 Enhanced Products:');
      console.log(JSON.stringify(result.data.enhancedProducts, null, 2));
      console.log();

      console.log('✅ Validation After Generation:');
      console.log(`   Valid Products: ${result.data.validation.validProducts}`);
      console.log(`   Invalid Products: ${result.data.validation.invalidProducts}`);
      console.log(`   Remaining Missing Required: ${result.data.validation.uniqueMissingRequiredCount}`);
      console.log(`   Remaining Missing Recommended: ${result.data.validation.uniqueMissingRecommendedCount}`);
      console.log();

      return true;
    } else {
      console.log('❌ Field generation failed\n');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error during generation: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('        Automatic Field Generation - Integration Test         ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test 1: Check service status
  const isAvailable = await testFieldGenerationStatus();

  if (!isAvailable) {
    console.log('⚠️  Field generation service is not available.');
    console.log('   Make sure OPENROUTER_API_KEY is configured in your .env file\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  }

  // Test 2: Generate missing fields
  const success = await testGenerateMissingFields();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`         Test Result: ${success ? '✅ PASSED' : '❌ FAILED'}         `);
  console.log('═══════════════════════════════════════════════════════════════\n');

  process.exit(success ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
