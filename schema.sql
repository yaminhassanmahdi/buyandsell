
-- Extensions (if needed, e.g., for UUIDs, but we'll use SERIAL for simplicity here)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- General Application Settings (replaces BusinessSettings)
-- This could be a single-row table or a key-value store. For simplicity, a single-row table.
CREATE TABLE app_settings (
    id SERIAL PRIMARY KEY, -- Only one row expected in this table
    app_name VARCHAR(255) NOT NULL DEFAULT '2ndhandbajar.com',
    logo_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(50), -- Can store HSL string or HEX
    secondary_color VARCHAR(50), -- Can store HSL string or HEX
    default_currency_code VARCHAR(3) NOT NULL DEFAULT 'BDT',
    google_client_id TEXT,
    google_client_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default settings row if it doesn't exist
INSERT INTO app_settings (id, app_name, default_currency_code)
SELECT 1, '2ndhandbajar.com', 'BDT'
WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE id = 1);

-- Currencies
CREATE TABLE currencies (
    code VARCHAR(3) PRIMARY KEY, -- e.g., BDT, USD
    symbol VARCHAR(5) NOT NULL,  -- e.g., ৳, $
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Default currencies
INSERT INTO currencies (code, symbol, name) VALUES
('BDT', '৳', 'Bangladeshi Taka'),
('USD', '$', 'US Dollar')
ON CONFLICT (code) DO NOTHING;


-- Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE, -- Optional
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Store hashed passwords, not plaintext
    is_admin BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    is_awaiting_phone_number BOOLEAN DEFAULT FALSE, -- For Google Sign-In flow
    google_email VARCHAR(255) UNIQUE, -- For linking Google account
    default_shipping_address_id INTEGER, -- Nullable, references user_addresses
    -- default_billing_address_id INTEGER, -- Nullable, references user_addresses (if you add billing)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    -- Foreign key for default_shipping_address_id will be added after user_addresses table
);

-- Location Tables
CREATE TABLE countries (
    country_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(2) UNIQUE -- ISO 3166-1 alpha-2 code
);

INSERT INTO countries (name, code) VALUES ('Bangladesh', 'BD') ON CONFLICT (name) DO NOTHING;

CREATE TABLE divisions (
    division_id SERIAL PRIMARY KEY,
    country_id INTEGER NOT NULL REFERENCES countries(country_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE (country_id, name)
);

CREATE TABLE districts (
    district_id SERIAL PRIMARY KEY,
    division_id INTEGER NOT NULL REFERENCES divisions(division_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE (division_id, name)
);

CREATE TABLE upazillas ( -- Renamed from Thana for clarity
    upazilla_id SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE (district_id, name)
);

-- User Addresses
CREATE TABLE user_addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    country_id INTEGER REFERENCES countries(country_id), -- Default to Bangladesh
    division_name VARCHAR(100) NOT NULL, -- Storing names directly as selected by user
    district_name VARCHAR(100) NOT NULL,
    upazilla_name VARCHAR(100) NOT NULL,
    house_address TEXT NOT NULL,
    road_number VARCHAR(255),
    is_default_shipping BOOLEAN DEFAULT FALSE,
    -- is_default_billing BOOLEAN DEFAULT FALSE, -- If you implement separate billing
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints now that user_addresses is defined
ALTER TABLE users
ADD CONSTRAINT fk_default_shipping_address
FOREIGN KEY (default_shipping_address_id) REFERENCES user_addresses(address_id) ON DELETE SET NULL;

-- (Optional) Add constraint if you add default_billing_address_id to users
-- ALTER TABLE users
-- ADD CONSTRAINT fk_default_billing_address
-- FOREIGN KEY (default_billing_address_id) REFERENCES user_addresses(address_id) ON DELETE SET NULL;


-- Withdrawal Methods
CREATE TYPE withdrawal_method_type AS ENUM ('bkash', 'bank');

CREATE TABLE withdrawal_methods (
    method_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type withdrawal_method_type NOT NULL,
    details JSONB NOT NULL, -- For bKash: {"accountNumber": "01..."}
                           -- For Bank: {"bankName": "...", "accountHolderName": "...", "accountNumber": "...", "routingNumber": "...", "branchName": "..."}
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawal Requests
CREATE TYPE withdrawal_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE withdrawal_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    method_id INTEGER NOT NULL REFERENCES withdrawal_methods(method_id),
    amount DECIMAL(10, 2) NOT NULL,
    status withdrawal_request_status NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ,
    admin_note TEXT,
    transaction_id VARCHAR(255), -- Optional: For payment processor transaction ID
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Charge Settings (single row table managed via app_settings or its own)
CREATE TABLE delivery_charge_settings (
    id SERIAL PRIMARY KEY, -- Only one row expected
    intra_upazilla_charge DECIMAL(10, 2) NOT NULL DEFAULT 70.00,
    intra_district_charge DECIMAL(10, 2) NOT NULL DEFAULT 110.00,
    inter_district_charge DECIMAL(10, 2) NOT NULL DEFAULT 130.00,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default delivery charge settings row
INSERT INTO delivery_charge_settings (id, intra_upazilla_charge, intra_district_charge, inter_district_charge)
SELECT 1, 70.00, 110.00, 130.00
WHERE NOT EXISTS (SELECT 1 FROM delivery_charge_settings WHERE id = 1);

-- Shipping Methods (admin manageable)
CREATE TABLE shipping_methods (
    method_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    base_cost DECIMAL(10, 2) DEFAULT 0.00, -- If methods have base costs
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Categories (Parent Categories)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    image_hint VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    featured_images JSONB, -- Array of {id, imageUrl, imageHint, linkUrl, title}
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Sub-Categories
CREATE TABLE sub_categories (
    sub_category_id SERIAL PRIMARY KEY,
    parent_category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    image_hint VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (parent_category_id, name)
);

-- Category-Specific Attribute Types
CREATE TABLE attribute_types (
    attribute_type_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., "Author", "Color", "Material"
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (category_id, name)
);

-- Category-Specific Attribute Values (Predefined options for attributes)
CREATE TABLE attribute_values (
    attribute_value_id SERIAL PRIMARY KEY,
    attribute_type_id INTEGER NOT NULL REFERENCES attribute_types(attribute_type_id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL, -- e.g., "Mr. Rahim", "Red", "Cotton"
    image_url TEXT,
    image_hint VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (attribute_type_id, value)
);

-- Products
CREATE TYPE product_status AS ENUM ('pending', 'approved', 'rejected', 'sold', 'draft');

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT, -- Don't delete user if they have products
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    sub_category_id INTEGER REFERENCES sub_categories(sub_category_id) ON DELETE SET NULL, -- Product can exist without sub-category
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    condition VARCHAR(50), -- e.g., "New", "Used - Like New", "Used - Good"
    status product_status NOT NULL DEFAULT 'pending',
    -- main_image_url TEXT, -- If you have one main image and others in a separate table
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Product Images (if a product can have multiple images)
CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_hint VARCHAR(255),
    is_main_image BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0
);

-- Product Selected Attributes (Junction table)
CREATE TABLE product_selected_attributes (
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    attribute_type_id INTEGER NOT NULL REFERENCES attribute_types(attribute_type_id) ON DELETE CASCADE,
    attribute_value_id INTEGER NOT NULL REFERENCES attribute_values(attribute_value_id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, attribute_type_id) -- Assuming one value per attribute type for a product
);

-- Orders
CREATE TYPE order_status_type AS ENUM ('pending', 'accepted', 'processing', 'handed_over', 'in_shipping', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status_type AS ENUM ('unpaid', 'paid', 'failed', 'refunded');

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT, -- Don't delete user if they have orders
    shipping_address_id INTEGER NOT NULL REFERENCES user_addresses(address_id) ON DELETE RESTRICT,
    -- billing_address_id INTEGER REFERENCES user_addresses(address_id) ON DELETE RESTRICT, -- Optional
    shipping_method_id INTEGER REFERENCES shipping_methods(method_id) ON DELETE SET NULL,
    order_status order_status_type NOT NULL DEFAULT 'pending',
    payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
    items_subtotal DECIMAL(10, 2) NOT NULL,
    delivery_charge_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL, -- items_subtotal + delivery_charge_amount - discounts
    platform_commission DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(100), -- e.g., "COD", "Online Payment Gateway"
    payment_transaction_id VARCHAR(255),
    notes_to_seller TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Order Items (Junction table for Products in an Order)
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id), -- Should ideally not cascade delete if you want historical order item data even if product deleted
    seller_id INTEGER NOT NULL REFERENCES users(user_id), -- To track seller per item
    quantity INTEGER NOT NULL,
    price_per_item DECIMAL(10, 2) NOT NULL, -- Price at the time of sale
    product_title VARCHAR(255) NOT NULL, -- Snapshot of product title
    product_image_url TEXT, -- Snapshot of main product image
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Commission Settings (per category)
CREATE TABLE commission_settings (
    commission_setting_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE UNIQUE,
    percentage DECIMAL(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100), -- e.g., 10.50 for 10.5%
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Hero Banner Slides (Global and Category-Specific)
CREATE TABLE hero_banner_slides (
    slide_id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE, -- Null if global
    image_url TEXT NOT NULL,
    image_hint VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    button_text VARCHAR(100),
    button_link TEXT,
    bg_color VARCHAR(50), -- Tailwind class or HEX
    text_color VARCHAR(50), -- Tailwind class or HEX
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Custom Pages (e.g., Privacy Policy, Terms)
CREATE TABLE custom_pages (
    page_id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_sub_categories_parent_category_id ON sub_categories(parent_category_id);
CREATE INDEX idx_attribute_types_category_id ON attribute_types(category_id);
CREATE INDEX idx_attribute_values_attribute_type_id ON attribute_values(attribute_type_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_custom_pages_slug ON custom_pages(slug);

-- Optional: Function to update 'updated_at' columns automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Example of applying the trigger (you'd do this for tables with updated_at)
-- CREATE TRIGGER set_timestamp_users
-- BEFORE UPDATE ON users
-- FOR EACH ROW
-- EXECUTE FUNCTION trigger_set_timestamp();

-- CREATE TRIGGER set_timestamp_products
-- BEFORE UPDATE ON products
-- FOR EACH ROW
-- EXECUTE FUNCTION trigger_set_timestamp();

-- ... and so on for other tables like app_settings, currencies, categories, etc.
-- that have an updated_at column.
-- For example:
CREATE TRIGGER set_timestamp_app_settings BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_currencies BEFORE UPDATE ON currencies FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_addresses BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_withdrawal_methods BEFORE UPDATE ON withdrawal_methods FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_withdrawal_requests BEFORE UPDATE ON withdrawal_requests FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_delivery_charge_settings BEFORE UPDATE ON delivery_charge_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_shipping_methods BEFORE UPDATE ON shipping_methods FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_categories BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_sub_categories BEFORE UPDATE ON sub_categories FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_attribute_types BEFORE UPDATE ON attribute_types FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_attribute_values BEFORE UPDATE ON attribute_values FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_commission_settings BEFORE UPDATE ON commission_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_hero_banner_slides BEFORE UPDATE ON hero_banner_slides FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_custom_pages BEFORE UPDATE ON custom_pages FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

  