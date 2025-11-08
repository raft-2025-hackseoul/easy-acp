import { v4 as uuid } from 'uuid';

export interface MockWooCommerceProduct {
  product_id: string;
  product_name: string;
  product_description: string;
  price_usd: string;
  stock_status: string;
  brand_name: string;
  category: string;
  main_image: string;
  product_url: string;
  upc_code: string;
  color?: string;
  size?: string;
  rating?: string;
  review_count?: string;
  weight_lb?: string;
  manufacturer?: string;
  warranty_months?: string;
}

interface WooCommerceSyncState {
  lastSyncId: string | null;
  lastSyncedAt: string | null;
  totalSyncs: number;
  products: MockWooCommerceProduct[];
}

const MOCK_PRODUCTS: MockWooCommerceProduct[] = [
  {
    product_id: 'SKU001',
    product_name: 'Sony WH-1000XM5 Wireless Headphones',
    product_description:
      'Industry-leading noise canceling wireless headphones with 30-hour battery life, crystal clear hands-free calling, and optimized for Alexa and Google Assistant. Premium sound quality with LDAC codec support.',
    price_usd: '349.99',
    stock_status: 'in_stock',
    brand_name: 'Sony',
    category: 'Electronics',
    main_image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    product_url: 'https://example.com/products/headphones-001',
    upc_code: '012345678901',
    color: 'Black',
    size: 'One Size',
    rating: '4.8',
    review_count: '12847',
    weight_lb: '0.7',
    manufacturer: 'Sony Electronics Inc.',
    warranty_months: '24',
  },
  {
    product_id: 'SKU002',
    product_name: 'Patagonia Organic Cotton T-Shirt',
    product_description:
      'Made with 100% organic cotton, this classic fit t-shirt is soft, breathable and built to last. Fair Trade Certified sewn. Perfect for everyday adventures.',
    price_usd: '29.99',
    stock_status: 'in_stock',
    brand_name: 'Patagonia',
    category: 'Apparel',
    main_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    product_url: 'https://example.com/products/tshirt-002',
    upc_code: '098765432109',
    color: 'Navy Blue',
    size: 'Medium',
    rating: '4.6',
    review_count: '2156',
    weight_lb: '0.3',
    manufacturer: 'Patagonia Inc.',
    warranty_months: '12',
  },
  {
    product_id: 'SKU003',
    product_name: 'Hydro Flask 32oz Wide Mouth',
    product_description:
      'Insulated stainless steel water bottle keeps beverages cold up to 24 hours and hot up to 12 hours. BPA-free, dishwasher safe, and fits most bacpack pockets.',
    price_usd: '39.99',
    stock_status: 'in_stock',
    brand_name: 'Hydro Flask',
    category: 'Home & Kitchen',
    main_image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
    product_url: 'https://example.com/products/bottle-003',
    upc_code: '123456789012',
    color: 'Pacific Blue',
    size: '32oz',
    rating: '4.9',
    review_count: '8632',
    weight_lb: '0.9',
    manufacturer: 'Helen of Troy Limited',
    warranty_months: 'Lifetime',
  },
  {
    product_id: 'SKU004',
    product_name: 'Apple Watch Series 9 GPS',
    product_description:
      'Advanced health and fitness tracking with heart rate monitor, ECG app, blood oxygen sensor, and sleep stages. Water resistant to 50m with always-on Retina display.',
    price_usd: '429.99',
    stock_status: 'in_stock',
    brand_name: 'Apple',
    category: 'Electronics',
    main_image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
    product_url: 'https://example.com/products/watch-004',
    upc_code: '234567890123',
    color: 'Midnight',
    size: '45mm',
    rating: '4.7',
    review_count: '9421',
    weight_lb: '0.2',
    manufacturer: 'Apple Inc.',
    warranty_months: '12',
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
