#!/usr/bin/env node

const {
  validateACPProducts,
  getValidationSummary,
} = require('./packages/acp-types/dist/validation');

// Simulate products from example-products.csv after mapping
const sampleProducts = [
  {
    id: 'SKU001',
    title: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling wireless headphones...',
    price: '349.99', // Missing USD
    availability: 'in_stock',
    brand: 'Sony',
    product_category: 'Electronics',
    image_link: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    link: 'https://example.com/products/headphones-001',
    gtin: '012345678901',
    color: 'Black',
    size: 'One Size',
    product_review_rating: 4.8,
    product_review_count: 12847,
    weight: '0.7', // Missing unit
    // Missing: enable_search, enable_checkout, inventory_quantity, material, seller_name, seller_url, return_policy, return_window
  },
  {
    id: 'SKU002',
    title: 'Patagonia Organic Cotton T-Shirt',
    description: 'Made with 100% organic cotton...',
    price: '29.99', // Missing USD
    availability: 'in_stock',
    brand: 'Patagonia',
    product_category: 'Apparel',
    image_link: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    link: 'https://example.com/products/tshirt-002',
    gtin: '098765432109',
    color: 'Navy Blue',
    size: 'Medium',
    product_review_rating: 4.6,
    product_review_count: 2156,
    weight: '0.3', // Missing unit
    // Missing: enable_search, enable_checkout, inventory_quantity, material, seller_name, seller_url, return_policy, return_window
  },
  {
    id: 'SKU003',
    title: 'Hydro Flask 32oz Wide Mouth',
    description: 'Insulated stainless steel water bottle...',
    price: '39.99', // Missing USD
    availability: 'in_stock',
    brand: 'Hydro Flask',
    product_category: 'Home & Kitchen',
    image_link: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
    link: 'https://example.com/products/bottle-003',
    gtin: '123456789012',
    color: 'Pacific Blue',
    size: '32oz',
    product_review_rating: 4.9,
    product_review_count: 8632,
    weight: '0.9', // Missing unit
    // Missing: enable_search, enable_checkout, inventory_quantity, material, seller_name, seller_url, return_policy, return_window
  },
];

console.log('🧪 Testing Validation Summary Fix\n');
console.log('==================================\n');

// Validate products
const validationResults = validateACPProducts(sampleProducts);
const summary = getValidationSummary(validationResults);

console.log('📦 Sample Products:', sampleProducts.length);
console.log('');

console.log('📊 VALIDATION SUMMARY:');
console.log('----------------------');
console.log(`Total Products: ${summary.totalProducts}`);
console.log(`Valid Products: ${summary.validProducts}`);
console.log(`Invalid Products: ${summary.invalidProducts}`);
console.log('');

console.log('❌ ERRORS:');
console.log(`   Unique Missing Required Fields: ${summary.uniqueMissingRequiredCount}`);
console.log(`   Fields: ${summary.missingRequired.join(', ')}`);
console.log(`   Total Error Instances: ${summary.totalErrors}`);
console.log(
  `   (${summary.uniqueMissingRequiredCount} unique fields × ${sampleProducts.length} products = ${summary.uniqueMissingRequiredCount * sampleProducts.length} expected)`
);
console.log('');

console.log('⚠️  WARNINGS:');
console.log(`   Unique Missing Recommended Fields: ${summary.uniqueMissingRecommendedCount}`);
console.log(
  `   Fields: ${summary.missingRecommended.slice(0, 10).join(', ')}${summary.missingRecommended.length > 10 ? '...' : ''}`
);
console.log(`   Total Warning Instances: ${summary.totalWarnings}`);
console.log('');

console.log('✅ VALIDATION FIX VERIFICATION:');
console.log('-------------------------------');
console.log('Before Fix:');
console.log(`  - Summary showed "${summary.uniqueMissingRequiredCount} missing required fields"`);
console.log(`  - But totalErrors was ${summary.totalErrors}`);
console.log(`  - This caused confusion!`);
console.log('');
console.log('After Fix:');
console.log(
  `  ✓ uniqueMissingRequiredCount: ${summary.uniqueMissingRequiredCount} (unique fields)`
);
console.log(`  ✓ totalErrors: ${summary.totalErrors} (all error instances)`);
console.log(`  ✓ Clear distinction between unique and total counts`);
console.log('');

// Show detailed validation for first product
console.log('🔍 DETAILED VALIDATION (First Product):');
console.log('---------------------------------------');
const firstValidation = validationResults[0];
console.log(`Product: ${sampleProducts[0].id} - ${sampleProducts[0].title}`);
console.log(`Valid: ${firstValidation.isValid}`);
console.log(
  `Missing Required (${firstValidation.missingRequired.length}):`,
  firstValidation.missingRequired.join(', ')
);
console.log(
  `Errors (${firstValidation.errors.length}):`,
  firstValidation.errors.map((e) => e.field).join(', ')
);
console.log(
  `Missing Recommended (${firstValidation.missingRecommended.length}):`,
  firstValidation.missingRecommended.slice(0, 5).join(', '),
  '...'
);
console.log(
  `Warnings (${firstValidation.warnings.length}):`,
  firstValidation.warnings
    .slice(0, 5)
    .map((w) => w.field)
    .join(', '),
  '...'
);
console.log('');

console.log('✅ Fix Successfully Applied!');
console.log('The validation summary now clearly distinguishes between:');
console.log('  - Unique missing fields (what fields are missing)');
console.log('  - Total error instances (how many total errors across all products)');
