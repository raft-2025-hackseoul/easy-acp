/**
 * Test CSV validation with example file
 * Run with: node test-csv-validation.js
 *
 * This will:
 * 1. Parse the example CSV
 * 2. Map fields to ACP format
 * 3. Validate with traditional validation
 * 4. Validate with LLM (if available)
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing CSV Validation Flow\n');

async function testValidation() {
  // Load environment
  require('dotenv').config();

  try {
    // Import compiled services
    const { parseCSV } = require('./dist/services/csv-parser.service');
    const { suggestFieldMapping, applyFieldMapping } = require('./dist/services/ai-mapper.service');
    const {
      categorizeProducts,
      validateProductsWithLLM,
      isLLMValidationAvailable,
    } = require('./dist/services/validation.service');

    // 1. Read example CSV
    console.log('1️⃣ Reading example CSV file...');
    const csvPath = path.join(__dirname, '../../example-products.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    console.log(`   ✅ Loaded: ${csvPath}\n`);

    // 2. Parse CSV
    console.log('2️⃣ Parsing CSV...');
    const parseResult = parseCSV(csvContent);
    if (!parseResult.success) {
      console.error('   ❌ Failed to parse CSV:', parseResult.errors);
      return;
    }
    console.log(`   ✅ Parsed ${parseResult.totalRows} rows`);
    console.log(`   Headers: ${parseResult.headers.join(', ')}\n`);

    // 3. Map fields
    console.log('3️⃣ Mapping fields to ACP format...');
    const sampleData = parseResult.data.slice(0, 3);
    const fieldMappings = await suggestFieldMapping(parseResult.headers, sampleData);
    console.log(`   ✅ Suggested ${fieldMappings.length} field mappings`);
    fieldMappings.slice(0, 5).forEach((m) => {
      console.log(
        `      ${m.sourceField} → ${m.targetField} (${(m.confidence * 100).toFixed(0)}%)`
      );
    });
    console.log('');

    // 4. Apply mapping
    console.log('4️⃣ Applying field mappings...');
    const mappedProducts = applyFieldMapping(parseResult.data, fieldMappings);
    console.log(`   ✅ Mapped ${mappedProducts.length} products\n`);

    // 5. Traditional validation
    console.log('5️⃣ Running traditional validation...');
    const traditional = categorizeProducts(mappedProducts);
    console.log(`   Valid products: ${traditional.valid.length}`);
    console.log(`   Invalid products: ${traditional.invalid.length}`);
    console.log(`   Total errors: ${traditional.summary.totalErrors}`);
    console.log(`   Total warnings: ${traditional.summary.totalWarnings}`);

    if (traditional.summary.missingRequired.length > 0) {
      console.log(
        `   Missing required fields: ${traditional.summary.missingRequired.slice(0, 5).join(', ')}`
      );
    }
    console.log('');

    // 6. LLM validation (if available)
    console.log('6️⃣ Checking LLM validation...');
    const llmAvailable = isLLMValidationAvailable();

    if (!llmAvailable) {
      console.log('   ⚠️  LLM validation not available');
      console.log('   Check OPENROUTER_API_KEY in .env file\n');
      return;
    }

    console.log('   ✅ LLM validation available');
    console.log('   Testing with first product...\n');

    // Test with just the first product to save API costs
    const testProduct = mappedProducts[0];
    console.log('7️⃣ Validating first product with LLM...');
    console.log(`   Product ID: ${testProduct.id || 'N/A'}`);
    console.log(`   Title: ${testProduct.title || 'N/A'}`);
    console.log('');

    try {
      const llmResult = await validateProductsWithLLM([testProduct]);

      console.log('📊 LLM Validation Results:');
      console.log('─────────────────────────────────────────');
      console.log(`Overall Summary: ${llmResult.overallSummary}`);
      console.log('');

      const result = llmResult.results[0];
      const validation = result.validation;

      console.log(`✓ Is Valid: ${validation.isValid ? '✅ Yes' : '❌ No'}`);
      console.log(`✓ Quality Score: ${validation.overallScore}/100`);
      console.log(`✓ Issues Found: ${validation.issues.length}`);
      console.log('');

      if (validation.issues.length > 0) {
        console.log('Issues:');
        validation.issues.slice(0, 10).forEach((issue, idx) => {
          const icon =
            issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          console.log(
            `  ${idx + 1}. ${icon} [${issue.severity.toUpperCase()}] ${issue.field || 'General'}`
          );
          console.log(`     ${issue.message}`);
          if (issue.suggestion) {
            console.log(`     💡 ${issue.suggestion}`);
          }
          console.log('');
        });
      }

      if (validation.suggestions.length > 0) {
        console.log('Suggestions for improvement:');
        validation.suggestions.forEach((suggestion, idx) => {
          console.log(`  ${idx + 1}. ${suggestion}`);
        });
        console.log('');
      }

      console.log(`Summary: ${validation.summary}`);
      console.log('─────────────────────────────────────────\n');

      console.log('✅ CSV validation test completed successfully!');
      console.log('\n💡 To validate all products, use the API endpoint:');
      console.log('   POST /api/product-feed/upload-with-llm\n');
    } catch (error) {
      console.error('   ❌ LLM validation failed:', error.message);
      console.log('\nPossible causes:');
      console.log('  - Invalid OpenRouter API key');
      console.log('  - API rate limit exceeded');
      console.log('  - Network connectivity issues');
      console.log('  - Model not available\n');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nStack trace:', error.stack);
  }
}

// Run the test
testValidation().catch(console.error);
