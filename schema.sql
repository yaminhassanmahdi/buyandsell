-- 2ndhandbajar.com - PostgreSQL Database Schema
-- This schema is designed to support all features of the prototype application.

-- Extension for UUID generation, if preferred over SERIAL
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- Users & Authentication
-- =================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Can be UUID or custom ID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- For storing hashed passwords
    is_admin BOOLEAN DEFAULT FALSE,
    google_email VARCHAR(255), -- To link Google sign-in
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipping_addresses (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    division VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    upazilla VARCHAR(100),
    house_address TEXT NOT NULL,
    road_number VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS withdrawal_methods (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL, -- 'bkash' or 'bank'
    details JSONB NOT NULL, -- For bkash: {'accountNumber': '...'}, for bank: {'bankName': '...', 'accountHolderName': '...', etc.}
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- Products, Categories & Attributes
-- =================================================================

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    image_hint VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    featured_images JSONB, -- Array of featured image objects
    category_slides JSONB -- Array of category-specific slide objects
);

CREATE TABLE IF NOT EXISTS sub_categories (
    id VARCHAR(255) PRIMARY KEY,
    parent_category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    image_hint VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS category_attribute_types (
    id VARCHAR(255) PRIMARY KEY,
    category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS category_attribute_values (
    id VARCHAR(255) PRIMARY KEY,
    attribute_type_id VARCHAR(255) NOT NULL REFERENCES category_attribute_types(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    image_url TEXT,
    image_hint VARCHAR(255)
);

CREATE TYPE product_status AS ENUM ('pending', 'approved', 'rejected', 'sold');

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    status product_status DEFAULT 'pending',
    seller_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id VARCHAR(255) REFERENCES categories(id) ON DELETE SET NULL,
    sub_category_id VARCHAR(255) REFERENCES sub_categories(id) ON DELETE SET NULL,
    -- New fields for enhanced product information
    purchase_date DATE,
    weight_kg DECIMAL(8, 3),
    purchase_price DECIMAL(10, 2),
    expected_selling_price DECIMAL(10, 2),
    quantity_parameter VARCHAR(20) DEFAULT 'PC', -- PC, KG, Pound, Ounce
    commission_percentage DECIMAL(5, 2) DEFAULT 5.00, -- Commission percentage for this product    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_hint VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS product_selected_attributes (
    product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_type_id VARCHAR(255) NOT NULL REFERENCES category_attribute_types(id) ON DELETE CASCADE,
    attribute_value_id VARCHAR(255) NOT NULL REFERENCES category_attribute_values(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, attribute_type_id)
);


-- =================================================================
-- Orders
-- =================================================================

CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'accepted', 'handed_over', 'in_shipping');
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid');

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_charge_amount DECIMAL(10, 2),
    shipping_address JSONB NOT NULL,
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'unpaid',
    platform_commission DECIMAL(10, 2),
    shipping_method_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    image_url TEXT
);

-- =================================================================
-- Settings & Financials (These can also be a single JSONB table)
-- =================================================================

CREATE TABLE IF NOT EXISTS business_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB
);

-- Example: INSERT INTO business_settings (key, value) VALUES ('main', '{"appName": "2ndhandbajar.com", "defaultCurrencyCode": "BDT", ...}');

CREATE TABLE IF NOT EXISTS hero_banner_slides (
    id VARCHAR(255) PRIMARY KEY,
    image_url TEXT NOT NULL,
    image_hint VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    button_text VARCHAR(100),
    button_link TEXT,
    bg_color VARCHAR(50),
    text_color VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS custom_pages (
    id VARCHAR(255) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commissions (
    category_id VARCHAR(255) PRIMARY KEY REFERENCES categories(id) ON DELETE CASCADE,
    percentage DECIMAL(5, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery_charge_settings (
    id SERIAL PRIMARY KEY,
    intra_thana_charge DECIMAL(10, 2) NOT NULL,
    intra_district_charge DECIMAL(10, 2) NOT NULL,
    inter_district_charge DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS shipping_methods (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    withdrawal_method_id VARCHAR(255) NOT NULL REFERENCES withdrawal_methods(id),
    status withdrawal_status DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    admin_note TEXT
);


-- =================================================================
-- Indexes for performance
-- =================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- End of schema.
