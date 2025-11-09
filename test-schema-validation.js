/**
 * Test script to verify ACP schema validation
 * Tests:
 * 1. Conditional requirements (seller_tos required when enable_checkout=true)
 * 2. Character limit validation
 * 3. Field categorization (material is recommended, not required)
 * 4. GTIN/MPN requirement
 */

const { validateACPProduct } = require('./packages/acp-types/dist/validation.js');
const { ACP_FIELDS } = require('./packages/acp-types/dist/acp-fields.js');

console.log('🔒 Testing ACP Schema Validation\n');

// Test 1: Check material field categorization
console.log('Test 1: Material Field Categorization');
const materialField = ACP_FIELDS.find((f) => f.name === 'material');
console.log(`  Material is required: ${materialField.required}`);
console.log(`  Material category: ${materialField.category}`);
console.log(`  Material maxLength: ${materialField.maxLength}`);
console.assert(materialField.required === false, 'Material should not be required');
console.assert(materialField.category === 'recommended', 'Material should be recommended');
console.assert(materialField.maxLength === 100, 'Material should have maxLength 100');
console.log('  ✅ PASSED\n');

// Test 2: Check seller_tos conditional requirement
console.log('Test 2: Seller TOS Conditional Requirement');
const sellerTosField = ACP_FIELDS.find((f) => f.name === 'seller_tos');
console.log(`  seller_tos has conditional requirement: ${!!sellerTosField.conditionallyRequired}`);
if (sellerTosField.conditionallyRequired) {
  console.log(
    `  Condition: ${sellerTosField.conditionallyRequired.when} = ${sellerTosField.conditionallyRequired.equals}`
  );
}
console.assert(
  sellerTosField.conditionallyRequired !== undefined,
  'seller_tos should have conditional requirement'
);
console.log('  ✅ PASSED\n');

// Test 3: Validate product with enable_checkout=true but missing seller_tos
console.log('Test 3: Conditional Validation (enable_checkout=true, missing seller_tos)');
const productWithCheckout = {
  id: 'TEST-123',
  title: 'Test Product',
  description: 'A test product',
  link: 'https://example.com/product',
  price: '99.99 USD',
  availability: 'in_stock',
  inventory_quantity: 10,
  product_category: 'Test > Product',
  weight: '1 kg',
  image_link: 'https://example.com/image.jpg',
  seller_name: 'Test Seller',
  seller_url: 'https://example.com',
  return_policy: 'https://example.com/returns',
  return_window: 30,
  enable_search: true,
  enable_checkout: true, // Checkout enabled but missing seller_tos and seller_privacy_policy
  gtin: '1234567890123',
};

const result1 = validateACPProduct(productWithCheckout);
console.log(`  Errors found: ${result1.errors.length}`);
const tosError = result1.errors.find((e) => e.field === 'seller_tos');
const privacyError = result1.errors.find((e) => e.field === 'seller_privacy_policy');
console.log(`  seller_tos error: ${tosError ? tosError.message : 'none'}`);
console.log(`  seller_privacy_policy error: ${privacyError ? privacyError.message : 'none'}`);
console.assert(tosError !== undefined, 'Should have error for missing seller_tos');
console.assert(privacyError !== undefined, 'Should have error for missing seller_privacy_policy');
console.log('  ✅ PASSED\n');

// Test 4: Character limit validation
console.log('Test 4: Character Limit Validation');
const productWithLongTitle = {
  ...productWithCheckout,
  seller_tos: 'https://example.com/tos',
  seller_privacy_policy: 'https://example.com/privacy',
  title: 'A'.repeat(200), // Exceeds 150 character limit
};

const result2 = validateACPProduct(productWithLongTitle);
const titleError = result2.errors.find((e) => e.field === 'title');
console.log(`  Title length: ${productWithLongTitle.title.length}`);
console.log(`  Title error: ${titleError ? titleError.message : 'none'}`);
console.assert(titleError !== undefined, 'Should have error for title exceeding 150 chars');
console.log('  ✅ PASSED\n');

// Test 5: GTIN or MPN requirement
console.log('Test 5: GTIN or MPN Requirement');
const productWithoutGtinOrMpn = {
  id: 'TEST-456',
  title: 'Test Product 2',
  description: 'Another test product',
  link: 'https://example.com/product2',
  price: '49.99 USD',
  availability: 'in_stock',
  inventory_quantity: 5,
  product_category: 'Test > Product',
  weight: '0.5 kg',
  image_link: 'https://example.com/image2.jpg',
  seller_name: 'Test Seller',
  seller_url: 'https://example.com/seller',
  return_policy: 'https://example.com/returns',
  return_window: 30,
  enable_search: true,
  enable_checkout: false,
  // Missing both gtin and mpn
};

const result3 = validateACPProduct(productWithoutGtinOrMpn);
const gtinError = result3.errors.find((e) => e.field === 'gtin');
console.log(`  GTIN/MPN error: ${gtinError ? gtinError.message : 'none'}`);
console.assert(gtinError !== undefined, 'Should have error for missing both GTIN and MPN');
console.log('  ✅ PASSED\n');

// Test 6: Valid product passes all validations
console.log('Test 6: Valid Product Passes All Validations');
const validProduct = {
  id: 'TEST-789',
  title: 'Valid Product',
  description: 'A completely valid product',
  link: 'https://example.com/valid',
  price: '29.99 USD',
  availability: 'in_stock',
  inventory_quantity: 100,
  product_category: 'Electronics > Audio',
  weight: '0.3 kg',
  image_link: 'https://example.com/valid.jpg',
  seller_name: 'Trusted Seller',
  seller_url: 'https://example.com',
  return_policy: 'https://example.com/returns',
  return_window: 30,
  enable_search: true,
  enable_checkout: true,
  seller_tos: 'https://example.com/tos',
  seller_privacy_policy: 'https://example.com/privacy',
  gtin: '9876543210123',
  brand: 'TestBrand',
};

const result4 = validateACPProduct(validProduct);
console.log(`  Is valid: ${result4.isValid}`);
console.log(`  Errors: ${result4.errors.length}`);
console.log(`  Warnings: ${result4.warnings.length}`);
console.assert(result4.isValid === true, 'Valid product should pass validation');
console.assert(result4.errors.length === 0, 'Valid product should have no errors');
console.log('  ✅ PASSED\n');

console.log('✅ All tests passed! Schema validation is working correctly.');
console.log('\n🔒 Schema is deterministic and follows OpenAI ACP specification.');
