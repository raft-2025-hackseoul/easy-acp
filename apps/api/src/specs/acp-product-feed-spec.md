# ACP Product Feed Specification

## Overview
The Product Feed Spec enables merchants to share structured product data with OpenAI so ChatGPT can surface products accurately in search and shopping experiences. OpenAI relies on merchant-provided feeds to ensure accurate pricing, availability, and other key details.

## Integration Requirements

- **Delivery Model**: Merchants push feeds to OpenAI via encrypted HTTPS to allow-listed endpoints
- **Supported Formats**: TSV, CSV, XML, or JSON
- **Refresh Frequency**: Updates accepted every 15 minutes
- **Initial Setup**: Submit sample or full feed for validation before live updates begin

---

## Field Requirements

### OpenAI Flags (Control Discoverability)

#### enable_search (Required, Enum)
- **Values**: `true` or `false`
- **Description**: Controls ChatGPT search visibility

#### enable_checkout (Required, Enum)
- **Values**: `true` or `false`
- **Description**: Allows direct purchase; requires `enable_search=true`

---

### Basic Product Data (Required Core Fields)

#### id (Required, String)
- **Max Length**: 100 characters
- **Description**: Unique merchant SKU; must remain stable over time
- **Validation**: Alphanumeric; stable identifier

#### title (Required, String)
- **Max Length**: 150 characters
- **Description**: Product name
- **Validation**: Avoid all-caps; UTF-8 text encoding

#### description (Required, String)
- **Max Length**: 5,000 characters
- **Description**: Full product details in plain text only
- **Validation**: Plain text only (no HTML); UTF-8 encoding

#### link (Required, URL)
- **Description**: Product page URL
- **Validation**: Must resolve HTTP 200; HTTPS preferred

#### gtin OR mpn (Required)
- **gtin** (String): 8–14 digits universal identifier
- **mpn** (String, max 70 chars): Manufacturer Part Number if GTIN absent
- **Validation**: Must provide at least one

---

### Item Information

#### condition (Conditional, Enum)
- **Values**: `new`, `refurbished`, `used`
- **Required**: If not new
- **Default**: Assumed `new` if not specified

#### product_category (Required, String)
- **Description**: Taxonomy path using ">" separator
- **Example**: "Electronics > Computers > Laptops"

#### brand (Conditional, String)
- **Max Length**: 70 characters
- **Required**: Except for movies, books, music

#### material (Optional, String)
- **Max Length**: 100 characters
- **Description**: Primary material(s)

#### weight (Required, Number with Unit)
- **Description**: Product weight
- **Validation**: Positive number with unit (e.g., "1.5 kg", "3 lbs")

#### dimensions (Required)
- **Format**: `LxWxH unit` (e.g., "10x5x3 cm")
- **OR Individual Fields**: length, width, height (all three required if using individual; units required)

#### age_group (Optional, Enum)
- **Values**: `newborn`, `infant`, `toddler`, `kids`, `adult`

---

### Media Assets

#### image_link (Required, URL)
- **Description**: Main product image
- **Format**: JPEG or PNG
- **Validation**: HTTPS preferred; must resolve

#### additional_image_link (Optional, URL Array)
- **Description**: Extra images
- **Format**: Comma-separated or array format

#### video_link (Optional, URL)
- **Description**: Public video link

#### model_3d_link (Optional, URL)
- **Description**: 3D model link
- **Format**: GLB/GLTF preferred

---

### Pricing & Promotions

#### price (Required, Number with Currency)
- **Format**: Number + ISO 4217 currency code (e.g., "29.99 USD")
- **Validation**: All prices must include ISO 4217 currency codes

#### sale_price (Optional, Number with Currency)
- **Format**: Number + ISO 4217 currency code
- **Validation**: Must be ≤ regular price

#### sale_price_effective_date (Conditional, ISO 8601)
- **Required**: If sale_price provided
- **Format**: Date range (start/end)
- **Validation**: Start precedes end

#### unit_pricing_measure / base_measure (Optional, Both Required Together)
- **Format**: Number + unit (e.g., "16 oz / 1 oz")
- **Validation**: Both required together

#### pricing_trend (Optional, String)
- **Max Length**: 80 characters
- **Example**: "Lowest price in 6 months"

---

### Availability & Inventory

#### availability (Required, Enum)
- **Values**: `in_stock`, `out_of_stock`, `preorder`

#### availability_date (Conditional, ISO 8601)
- **Required**: If availability is `preorder`
- **Validation**: Must be future date

#### inventory_quantity (Required, Integer)
- **Description**: Stock count
- **Validation**: Non-negative integer

#### expiration_date (Optional, ISO 8601)
- **Description**: Remove product after this date
- **Validation**: Must be future date

#### pickup_method (Optional, Enum)
- **Values**: `in_store`, `reserve`, `not_supported`

#### pickup_sla (Optional, Number with Duration)
- **Description**: Pickup service level agreement
- **Validation**: Requires pickup_method; positive integer + unit

---

### Variants (For Multi-SKU Products)

#### item_group_id (Conditional, String)
- **Max Length**: 70 characters
- **Required**: If variants exist
- **Description**: Groups related SKUs; same ID for all variants of same product

#### item_group_title (Optional, String)
- **Max Length**: 150 characters
- **Description**: Group product name

#### color (Recommended for Apparel, String)
- **Max Length**: 40 characters

#### size (Recommended for Apparel, String)
- **Max Length**: 20 characters

#### size_system (Recommended, String)
- **Format**: ISO 3166 country code
- **Example**: "US"

#### gender (Recommended, Enum)
- **Values**: `male`, `female`, `unisex`

#### offer_id (Recommended, String)
- **Description**: Unique identifier combining SKU + seller + price

#### Custom_variant[1-3]_category & _option (Optional, String)
- **Description**: Up to 3 custom variant dimensions

---

### Fulfillment

#### shipping (Conditional, String)
- **Format**: `country:region:service_class:price`
- **Description**: Multiple entries allowed
- **Required**: Where applicable

#### delivery_estimate (Optional, ISO 8601)
- **Description**: Future date for arrival
- **Validation**: Must be future date

---

### Merchant Information

#### seller_name (Required, String)
- **Max Length**: 70 characters
- **Description**: Display name

#### seller_url (Required, URL)
- **Description**: Merchant page
- **Validation**: HTTPS preferred

#### seller_privacy_policy (Conditional, URL)
- **Required**: If checkout enabled
- **Validation**: HTTPS preferred

#### seller_tos (Conditional, URL)
- **Required**: If checkout enabled
- **Description**: Terms of service
- **Validation**: HTTPS preferred

---

### Returns Policy

#### return_policy (Required, URL)
- **Description**: Link to full policy
- **Validation**: HTTPS preferred

#### return_window (Required, Integer)
- **Description**: Days allowed for return
- **Validation**: Positive integer

---

### Performance Signals

#### popularity_score (Recommended, Number)
- **Range**: 0–5 scale or merchant-defined

#### return_rate (Recommended, Number)
- **Range**: 0–100%
- **Format**: Percentage

---

### Compliance

#### warning / warning_url (Recommended for Checkout)
- **Description**: Disclaimers or regulatory warnings
- **Examples**: CA Prop 65, lithium battery warnings

#### age_restriction (Recommended, Number)
- **Description**: Minimum purchase age
- **Validation**: Positive integer

---

### Reviews & Q&A

#### product_review_count (Recommended, Integer)
- **Validation**: Non-negative count

#### product_review_rating (Recommended, Number)
- **Range**: 0–5 scale average

#### store_review_count (Optional, Integer)
- **Validation**: Non-negative count

#### store_review_rating (Optional, Number)
- **Range**: 0–5 scale average

#### q_and_a (Recommended, String)
- **Format**: Plain text FAQ content

#### raw_review_data (Recommended, String)
- **Format**: May include JSON blob

---

### Related Products

#### related_product_id (Recommended, String)
- **Description**: Associated SKUs
- **Format**: Comma-separated list allowed

#### relationship_type (Recommended, Enum)
- **Values**: `part_of_set`, `required_part`, `often_bought_with`, `substitute`, `different_brand`, `accessory`

---

### Geo-Targeting

#### geo_price (Recommended, Number with Currency)
- **Description**: Region-specific pricing
- **Validation**: Must include ISO 4217 currency

#### geo_availability (Recommended, String)
- **Description**: Availability per region
- **Validation**: Regions must be valid ISO 3166 codes

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
