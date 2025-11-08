# OpenAI Agent Commerce Protocol (ACP) Product Feed Specification

## 🔒 AUTHORITATIVE SCHEMA - SINGLE SOURCE OF TRUTH

**This document defines the deterministic, fixed schema for all ACP product feeds.**

### Schema Rules

1. **Field Names**: All field names MUST use `snake_case` format (e.g., `product_id`, `image_link`, `seller_name`)
2. **Deterministic Output**: Input data is converted to match these exact field names - no variations allowed
3. **Fixed Categorization**: Field requirements (required/recommended/optional) are fixed per OpenAI specification
4. **No Label Substitution**: Field labels are for UI display only - exports always use snake_case field names
5. **Validation Enforcement**: All character limits, formats, and conditional requirements must be enforced

---

## Overview

The Product Feed Spec enables merchants to share structured product data with OpenAI so ChatGPT can accurately index and display their catalog. Merchants must first register at chatgpt.com/merchants.

## Delivery & Format

- **Delivery Method**: Merchants push feeds to OpenAI via encrypted HTTPS
- **Supported Formats**: TSV, CSV, XML, or JSON
- **Refresh Frequency**: Updates accepted every 15 minutes
- **Initial Setup**: Sample or complete feed required for validation before live updates begin

---

## Field Categories & Requirements

### OpenAI Flags (Control Discovery)

#### enable_search (Required, Boolean)

- **Type**: Boolean
- **Description**: Controls whether the product can be surfaced in ChatGPT search results
- **Validation**: Required for all products

#### enable_checkout (Required, Boolean)

- **Type**: Boolean
- **Description**: Allows direct purchase through ChatGPT
- **Validation**: Requires `enable_search=true` to be effective

---

### Basic Product Data

#### id (Required, String)

- **Type**: String
- **Max Length**: 100 characters
- **Description**: Unique merchant product ID
- **Validation**: Alphanumeric; must remain stable over time
- **Example**: "SKU-12345"

#### title (Required, String)

- **Type**: String
- **Max Length**: 150 characters
- **Description**: Product name
- **Validation**: Avoid all-caps; UTF-8 text encoding
- **Example**: "Wireless Bluetooth Headphones"

#### description (Required, String)

- **Type**: String
- **Max Length**: 5,000 characters
- **Description**: Full product description in plain text only
- **Validation**: Plain text only (no HTML tags); UTF-8 encoding
- **Example**: "Premium wireless headphones with active noise cancellation..."

#### link (Required, URL)

- **Type**: URL
- **Description**: Product detail page URL
- **Validation**: Must resolve with HTTP 200 status; HTTPS preferred
- **Example**: "https://example.com/products/wireless-headphones"

#### gtin (Recommended, String)

- **Type**: String
- **Length**: 8-14 digits
- **Description**: Global Trade Item Number (UPC, EAN, JAN, ISBN)
- **Validation**: Must be valid GTIN format
- **Example**: "00123456789012"

#### mpn (Required if no GTIN, String)

- **Type**: String
- **Max Length**: 70 characters
- **Description**: Manufacturer Part Number
- **Validation**: Required if GTIN not provided
- **Example**: "WH-1000XM4"

---

### Item Information

#### condition (Required if not new, Enum)

- **Type**: Enum
- **Values**: `new`, `refurbished`, `used`
- **Description**: Product condition
- **Validation**: Required if condition is not new; defaults to `new` if omitted
- **Example**: "new"

#### product_category (Required, String)

- **Type**: String
- **Description**: Product category taxonomy using ">" separator
- **Validation**: Must use hierarchical format with ">" separator
- **Example**: "Electronics > Audio > Headphones"

#### brand (Required for most products, String)

- **Type**: String
- **Max Length**: 70 characters
- **Description**: Brand or manufacturer name
- **Validation**: Required except for movies, books, and music
- **Example**: "Sony"

#### material (Recommended, String)

- **Type**: String
- **Max Length**: 100 characters
- **Description**: Primary material composition
- **Validation**: Recommended for physical products
- **Example**: "Plastic, Metal, Foam"

#### weight (Required, String)

- **Type**: String
- **Description**: Product weight with unit
- **Validation**: Positive number with unit (kg, lbs, g, oz)
- **Example**: "0.25 kg" or "8.8 oz"

#### dimensions (Optional, String)

- **Type**: String
- **Description**: Product dimensions in LxWxH format
- **Format**: "LengthxWidthxHeight unit"
- **Example**: "20x18x8 cm"

#### length (Optional, String)

- **Type**: String
- **Description**: Product length (use with width and height)
- **Validation**: All three dimensions required if using individual fields
- **Example**: "20 cm"

#### width (Optional, String)

- **Type**: String
- **Description**: Product width (use with length and height)
- **Example**: "18 cm"

#### height (Optional, String)

- **Type**: String
- **Description**: Product height (use with length and width)
- **Example**: "8 cm"

#### age_group (Optional, Enum)

- **Type**: Enum
- **Values**: `newborn`, `infant`, `toddler`, `kids`, `adult`
- **Description**: Target age group
- **Example**: "adult"

---

### Media Assets

#### image_link (Required, URL)

- **Type**: URL
- **Description**: Main product image URL
- **Format**: JPEG or PNG
- **Validation**: Must resolve; HTTPS preferred
- **Example**: "https://example.com/images/product.jpg"

#### additional_image_link (Optional, String)

- **Type**: String
- **Description**: Additional product image URLs
- **Format**: Comma-separated URLs
- **Example**: "https://example.com/img2.jpg,https://example.com/img3.jpg"

#### video_link (Optional, URL)

- **Type**: URL
- **Description**: Publicly accessible product video
- **Validation**: Must be publicly accessible
- **Example**: "https://example.com/videos/product-demo.mp4"

#### model_3d_link (Optional, URL)

- **Type**: URL
- **Description**: 3D model file URL
- **Format**: GLB or GLTF format preferred
- **Example**: "https://example.com/models/product.glb"

---

### Pricing & Promotions

#### price (Required, String)

- **Type**: String
- **Description**: Regular product price with ISO 4217 currency code
- **Format**: "amount currency_code" (e.g., "29.99 USD")
- **Validation**: Must include ISO 4217 currency code
- **Example**: "99.99 USD"

#### sale_price (Optional, String)

- **Type**: String
- **Description**: Discounted sale price with currency code
- **Format**: "amount currency_code"
- **Validation**: Must be ≤ regular price; requires ISO 4217 currency code
- **Example**: "79.99 USD"

#### sale_price_effective_date (Required if sale_price, String)

- **Type**: String
- **Description**: Date range when sale price is active
- **Format**: ISO 8601 date range "start/end"
- **Validation**: Start date must precede end date
- **Example**: "2025-01-01T00:00:00Z/2025-01-31T23:59:59Z"

#### unit_pricing_measure (Optional, String)

- **Type**: String
- **Description**: Product quantity for unit pricing
- **Format**: Number + unit
- **Validation**: Must be used with base_measure
- **Example**: "750 ml"

#### base_measure (Optional, String)

- **Type**: String
- **Description**: Base unit for price comparison
- **Format**: Number + unit
- **Validation**: Must be used with unit_pricing_measure
- **Example**: "100 ml"

#### pricing_trend (Optional, String)

- **Type**: String
- **Max Length**: 80 characters
- **Description**: Historical price trend indicator
- **Example**: "Lowest price in 6 months"

---

### Availability & Inventory

#### availability (Required, Enum)

- **Type**: Enum
- **Values**: `in_stock`, `out_of_stock`, `preorder`
- **Description**: Current product availability status
- **Validation**: Required for all products
- **Example**: "in_stock"

#### availability_date (Required for preorder, String)

- **Type**: String
- **Description**: Date when preorder product will be available
- **Format**: ISO 8601 date
- **Validation**: Required if availability is `preorder`; must be future date
- **Example**: "2025-03-15T00:00:00Z"

#### inventory_quantity (Required, Number)

- **Type**: Number
- **Description**: Actual stock quantity available
- **Validation**: Non-negative integer
- **Example**: 150

#### expiration_date (Optional, String)

- **Type**: String
- **Description**: Date to remove product from catalog
- **Format**: ISO 8601 date
- **Validation**: Must be future date
- **Example**: "2025-12-31T23:59:59Z"

#### pickup_method (Optional, Enum)

- **Type**: Enum
- **Values**: `in_store`, `reserve`, `not_supported`
- **Description**: In-store pickup availability
- **Example**: "in_store"

#### pickup_sla (Optional, String)

- **Type**: String
- **Description**: Pickup service level agreement (time to ready)
- **Format**: Positive integer + time unit
- **Validation**: Requires pickup_method to be set
- **Example**: "2 hours" or "1 day"

---

### Variants (For Multi-SKU Products)

#### item_group_id (Required if variants exist, String)

- **Type**: String
- **Max Length**: 70 characters
- **Description**: Groups related product variants; same ID for all SKUs of the same product
- **Validation**: Required if product has variants
- **Example**: "headphones-wireless-2024"

#### item_group_title (Optional, String)

- **Type**: String
- **Max Length**: 150 characters
- **Description**: Parent product title for variant group
- **Example**: "Wireless Headphones"

#### color (Recommended for apparel, String)

- **Type**: String
- **Max Length**: 40 characters
- **Description**: Product color
- **Example**: "Midnight Black"

#### size (Recommended for apparel, String)

- **Type**: String
- **Max Length**: 20 characters
- **Description**: Product size
- **Example**: "Large" or "10.5"

#### size_system (Recommended, String)

- **Type**: String
- **Description**: Size system standard
- **Format**: ISO 3166 two-letter country code
- **Example**: "US" or "UK" or "EU"

#### gender (Recommended for apparel, Enum)

- **Type**: Enum
- **Values**: `male`, `female`, `unisex`
- **Description**: Target gender
- **Example**: "unisex"

#### offer_id (Recommended, String)

- **Type**: String
- **Description**: Unique identifier combining SKU, seller, and price point
- **Example**: "SKU-12345-seller123-99.99"

#### custom_variant1_category (Optional, String)

- **Type**: String
- **Description**: Custom variant dimension category (e.g., "Material")
- **Example**: "Material"

#### custom_variant1_option (Optional, String)

- **Type**: String
- **Description**: Custom variant dimension value
- **Example**: "Leather"

#### custom_variant2_category (Optional, String)

- **Type**: String
- **Description**: Second custom variant dimension category
- **Example**: "Finish"

#### custom_variant2_option (Optional, String)

- **Type**: String
- **Description**: Second custom variant dimension value
- **Example**: "Matte"

#### custom_variant3_category (Optional, String)

- **Type**: String
- **Description**: Third custom variant dimension category
- **Example**: "Edition"

#### custom_variant3_option (Optional, String)

- **Type**: String
- **Description**: Third custom variant dimension value
- **Example**: "Limited"

---

### Fulfillment

#### shipping (Required where applicable, String)

- **Type**: String
- **Description**: Shipping options and costs
- **Format**: "country:region:service_class:price"
- **Validation**: Multiple entries allowed (comma-separated)
- **Example**: "US:CA:Standard:5.99 USD,US:NY:Express:15.99 USD"

#### delivery_estimate (Optional, String)

- **Type**: String
- **Description**: Estimated delivery date
- **Format**: ISO 8601 date
- **Validation**: Must be future date
- **Example**: "2025-02-15T00:00:00Z"

---

### Merchant Information

#### seller_name (Required, String)

- **Type**: String
- **Max Length**: 70 characters
- **Description**: Seller or merchant display name
- **Validation**: Required for all products
- **Example**: "Premium Electronics Store"

#### seller_url (Required, URL)

- **Type**: URL
- **Description**: Seller/merchant website URL
- **Validation**: Must resolve; HTTPS preferred
- **Example**: "https://example.com"

#### seller_privacy_policy (Required for checkout, URL)

- **Type**: URL
- **Description**: Privacy policy URL
- **Validation**: Required if enable_checkout is true; HTTPS preferred
- **Example**: "https://example.com/privacy"

#### seller_tos (Required for checkout, URL)

- **Type**: URL
- **Description**: Terms of service URL
- **Validation**: Required if enable_checkout is true; HTTPS preferred
- **Example**: "https://example.com/terms"

---

### Returns Policy

#### return_policy (Required, URL)

- **Type**: URL
- **Description**: Link to complete returns policy
- **Validation**: Must resolve; HTTPS preferred
- **Example**: "https://example.com/returns"

#### return_window (Required, Number)

- **Type**: Number
- **Description**: Number of days allowed for returns
- **Validation**: Positive integer
- **Example**: 30

---

### Performance Signals

#### popularity_score (Recommended, Number)

- **Type**: Number
- **Description**: Product popularity or trending score for ranking
- **Range**: 0-5 scale or merchant-defined metric
- **Example**: 4.5

#### return_rate (Recommended, Number)

- **Type**: Number
- **Description**: Product return rate percentage for quality signals
- **Range**: 0-100
- **Format**: Percentage value
- **Example**: 2.5

---

### Compliance

#### warning (Recommended for checkout, String)

- **Type**: String
- **Description**: Regulatory disclaimers or product warnings
- **Example**: "California Prop 65 Warning: This product contains chemicals..."

#### warning_url (Recommended for checkout, URL)

- **Type**: URL
- **Description**: URL to detailed warning information
- **Example**: "https://example.com/warnings/prop65"

#### age_restriction (Recommended, Number)

- **Type**: Number
- **Description**: Minimum age required to purchase
- **Validation**: Positive integer
- **Example**: 18

---

### Reviews & Q&A

#### product_review_count (Recommended, Number)

- **Type**: Number
- **Description**: Total number of product reviews
- **Validation**: Non-negative integer
- **Example**: 245

#### product_review_rating (Recommended, Number)

- **Type**: Number
- **Description**: Average product rating
- **Range**: 0-5 scale
- **Example**: 4.7

#### store_review_count (Optional, Number)

- **Type**: Number
- **Description**: Total number of store/brand reviews
- **Validation**: Non-negative integer
- **Example**: 1542

#### store_review_rating (Optional, Number)

- **Type**: Number
- **Description**: Average store/brand rating
- **Range**: 0-5 scale
- **Example**: 4.3

#### q_and_a (Recommended, String)

- **Type**: String
- **Description**: Product Q&A content in plain text
- **Format**: Plain text FAQ data
- **Example**: "Q: Is it waterproof? A: Yes, IP67 rated. Q: Battery life? A: Up to 30 hours."

#### raw_review_data (Recommended, String)

- **Type**: String
- **Description**: Full customer review text
- **Format**: Plain text or JSON blob
- **Example**: "Great product! Very comfortable and excellent sound quality..."

---

### Related Products

#### related_product_id (Recommended, String)

- **Type**: String
- **Description**: Related or associated product IDs
- **Format**: Comma-separated product IDs
- **Example**: "SKU-12346,SKU-12347,SKU-12350"

#### relationship_type (Recommended, Enum)

- **Type**: Enum
- **Values**: `part_of_set`, `required_part`, `often_bought_with`, `substitute`, `different_brand`, `accessory`
- **Description**: Type of relationship with related products
- **Example**: "often_bought_with"

---

### Geo-Targeting

#### geo_price (Recommended, String)

- **Type**: String
- **Description**: Region-specific pricing overrides
- **Format**: Region code + price with currency
- **Validation**: Must include ISO 4217 currency code; use ISO 3166 region codes
- **Example**: "US:99.99 USD,CA:129.99 CAD,UK:89.99 GBP"

#### geo_availability (Recommended, String)

- **Type**: String
- **Description**: Region-specific availability status
- **Format**: Region code + availability status
- **Validation**: Must use valid ISO 3166 region codes
- **Example**: "US:in_stock,CA:in_stock,UK:out_of_stock"

---

## Validation Rules Summary

1. **IDs**: Alphanumeric; stable over time
2. **URLs**: Must resolve successfully (HTTP 200); HTTPS strongly preferred
3. **Prices**: All prices include ISO 4217 currency codes
4. **Dates**: ISO 8601 format
5. **Future Dates**: Required for preorder/expiration/delivery dates
6. **Price Constraints**: Sale prices ≤ regular prices
7. **Counts**: Non-negative inventory and review counts
8. **Text Formatting**: Plain text descriptions only (no HTML)
9. **Character Encoding**: UTF-8 for all text fields
10. **Required Fields**: Must provide all required fields based on product type and configuration

---

## Prohibited Products

Only products and services that are legal, safe, and appropriate for a general audience are allowed.

### Prohibited Items Include:

- Adult content
- Age-restricted goods (alcohol, nicotine, gambling)
- Weapons
- Prescription medications
- Unlicensed financial products
- Illegal goods
- Deceptive practices

**Compliance**: Merchants bear responsibility for compliance. Violators may face removal or seller bans.
