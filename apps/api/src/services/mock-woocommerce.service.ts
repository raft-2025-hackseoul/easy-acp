import { v4 as uuid } from 'uuid';

export interface MockWooCommerceProduct {
  // Core Required Fields
  product_id: string;
  product_name: string;
  product_description: string;
  price_usd: string;
  stock_status: string;
  brand_name: string;
  product_category: string; // Hierarchical category with ">"
  main_image: string;
  product_url: string;
  upc_code: string; // GTIN

  // ACP Required Fields
  enable_search: boolean;
  enable_checkout: boolean;
  material: string;
  weight: string; // Weight with unit (e.g., "0.25 kg")
  inventory_quantity: number;
  seller_name: string;
  seller_url: string;
  return_policy_url: string;
  return_window_days: number;

  // Recommended Fields
  mpn: string; // Manufacturer Part Number
  condition: string; // new/refurbished/used
  popularity_score: number; // 0-5
  seller_privacy_policy: string;
  seller_tos: string;

  // Optional Fields (keep minimal)
  color?: string;
  size?: string;
  rating?: string;
  review_count?: string;
}

interface WooCommerceSyncState {
  lastSyncId: string | null;
  lastSyncedAt: string | null;
  totalSyncs: number;
  products: MockWooCommerceProduct[];
}

const MOCK_PRODUCTS: MockWooCommerceProduct[] = [
  {
    // Core Required Fields
    product_id: 'SKU001',
    product_name: 'Sony WH-1000XM5 Wireless Headphones',
    product_description:
      'Industry-leading noise canceling wireless headphones with 30-hour battery life and crystal clear hands-free calling.',
    price_usd: '349.99',
    stock_status: 'in_stock',
    brand_name: 'Sony',
    product_category: 'Electronics > Audio > Headphones > Over-Ear Headphones',
    main_image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    product_url: 'https://example.com/products/headphones-001',
    upc_code: '012345678901',

    // ACP Required Fields
    enable_search: true,
    enable_checkout: true,
    material: 'Plastic, Metal, Synthetic Leather, Foam Padding',
    weight: '0.25 kg',
    inventory_quantity: 150,
    seller_name: 'Premium Electronics Marketplace',
    seller_url: 'https://premium-electronics.example.com',
    return_policy_url: 'https://premium-electronics.example.com/returns',
    return_window_days: 30,

    // Recommended Fields
    mpn: 'WH1000XM5/B',
    condition: 'new',
    popularity_score: 4.8,
    seller_privacy_policy: 'https://premium-electronics.example.com/privacy',
    seller_tos: 'https://premium-electronics.example.com/terms',

    // Optional Fields
    color: 'Black',
    size: 'One Size',
    rating: '4.8',
    review_count: '12847',
  },
  {
    // Core Required Fields
    product_id: 'SKU002',
    product_name: 'Patagonia Organic Cotton T-Shirt',
    product_description:
      'Made with 100% organic cotton, this classic fit t-shirt is soft, breathable and built to last. Fair Trade Certified sewn.',
    price_usd: '29.99',
    stock_status: 'in_stock',
    brand_name: 'Patagonia',
    product_category: 'Apparel & Accessories > Clothing > Shirts & Tops > T-Shirts',
    main_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    product_url: 'https://example.com/products/tshirt-002',
    upc_code: '098765432109',

    // ACP Required Fields
    enable_search: true,
    enable_checkout: true,
    material: '100% Organic Cotton',
    weight: '0.15 kg',
    inventory_quantity: 280,
    seller_name: 'Sustainable Apparel Co',
    seller_url: 'https://sustainable-apparel.example.com',
    return_policy_url: 'https://sustainable-apparel.example.com/returns',
    return_window_days: 60,

    // Recommended Fields
    mpn: 'PTG-OCT-NVY-M',
    condition: 'new',
    popularity_score: 4.6,
    seller_privacy_policy: 'https://sustainable-apparel.example.com/privacy',
    seller_tos: 'https://sustainable-apparel.example.com/terms',

    // Optional Fields
    color: 'Navy Blue',
    size: 'Medium',
    rating: '4.6',
    review_count: '2156',
  },
  {
    // Core Required Fields
    product_id: 'SKU003',
    product_name: 'Hydro Flask 32oz Wide Mouth',
    product_description:
      'Insulated stainless steel water bottle keeps beverages cold up to 24 hours and hot up to 12 hours. BPA-free and dishwasher safe.',
    price_usd: '39.99',
    stock_status: 'in_stock',
    brand_name: 'Hydro Flask',
    product_category: 'Home & Garden > Kitchen & Dining > Drinkware > Water Bottles',
    main_image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
    product_url: 'https://example.com/products/bottle-003',
    upc_code: '123456789012',

    // ACP Required Fields
    enable_search: true,
    enable_checkout: true,
    material: 'Stainless Steel 18/8, BPA-Free Plastic Cap',
    weight: '0.35 kg',
    inventory_quantity: 195,
    seller_name: 'Outdoor Gear Hub',
    seller_url: 'https://outdoor-gear-hub.example.com',
    return_policy_url: 'https://outdoor-gear-hub.example.com/returns',
    return_window_days: 30,

    // Recommended Fields
    mpn: 'HF32WM-PB',
    condition: 'new',
    popularity_score: 4.9,
    seller_privacy_policy: 'https://outdoor-gear-hub.example.com/privacy',
    seller_tos: 'https://outdoor-gear-hub.example.com/terms',

    // Optional Fields
    color: 'Pacific Blue',
    size: '32oz',
    rating: '4.9',
    review_count: '8632',
  },
  {
    // Core Required Fields
    product_id: 'SKU004',
    product_name: 'Apple Watch Series 9 GPS',
    product_description:
      'Advanced health and fitness tracking with heart rate monitor, ECG app, blood oxygen sensor, and sleep stages. Water resistant to 50m.',
    price_usd: '429.99',
    stock_status: 'in_stock',
    brand_name: 'Apple',
    product_category: 'Electronics > Wearable Technology > Smart Watches',
    main_image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
    product_url: 'https://example.com/products/watch-004',
    upc_code: '234567890123',

    // ACP Required Fields
    enable_search: true,
    enable_checkout: true,
    material: 'Aluminum, Ion-X Glass, Fluoroelastomer Band',
    weight: '0.038 kg',
    inventory_quantity: 85,
    seller_name: 'Premium Electronics Marketplace',
    seller_url: 'https://premium-electronics.example.com',
    return_policy_url: 'https://premium-electronics.example.com/returns',
    return_window_days: 14,

    // Recommended Fields
    mpn: 'MRHN3LL/A',
    condition: 'new',
    popularity_score: 4.7,
    seller_privacy_policy: 'https://premium-electronics.example.com/privacy',
    seller_tos: 'https://premium-electronics.example.com/terms',

    // Optional Fields
    color: 'Midnight',
    size: '45mm',
    rating: '4.7',
    review_count: '9421',
  },
];

const syncState: WooCommerceSyncState = {
  lastSyncId: null,
  lastSyncedAt: null,
  totalSyncs: 0,
  products: [...MOCK_PRODUCTS],
};

export function validateWooToken(token: string | undefined | null): boolean {
  return Boolean(token && token.trim().length > 0);
}

export async function fetchMockWooCommerceProducts(): Promise<{
  products: MockWooCommerceProduct[];
  syncId: string;
  syncedAt: string;
  total: number;
}> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  const syncId = uuid();
  const syncedAt = new Date().toISOString();

  syncState.lastSyncId = syncId;
  syncState.lastSyncedAt = syncedAt;
  syncState.totalSyncs += 1;
  syncState.products = [...MOCK_PRODUCTS];

  return {
    products: syncState.products,
    syncId,
    syncedAt,
    total: syncState.products.length,
  };
}

export function getWooCommerceSyncState() {
  return {
    lastSyncId: syncState.lastSyncId,
    lastSyncedAt: syncState.lastSyncedAt,
    totalSyncs: syncState.totalSyncs,
    totalProducts: syncState.products.length,
  };
}

export function getCachedWooCommerceProducts() {
  return syncState.products;
}
