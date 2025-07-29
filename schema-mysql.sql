-- 2ndhandbajar.com - MySQL Database Schema
-- This schema is designed to support all features of the prototype application.

-- =================================================================
-- Users & Authentication
-- =================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    google_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipping_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    division VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    upazilla VARCHAR(100),
    house_address TEXT NOT NULL,
    road_number VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS withdrawal_methods (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    method_type VARCHAR(50) NOT NULL,
    details JSON NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =================================================================
-- Products, Categories & Attributes
-- =================================================================

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    image_hint VARCHAR(255),
    sort_order INT DEFAULT 0,
    featured_images JSON,
    category_slides JSON
);

CREATE TABLE IF NOT EXISTS sub_categories (
    id VARCHAR(255) PRIMARY KEY,
    parent_category_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    image_hint VARCHAR(255),
    FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS category_attribute_types (
    id VARCHAR(255) PRIMARY KEY,
    category_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_button_featured BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS category_attribute_values (
    id VARCHAR(255) PRIMARY KEY,
    attribute_type_id VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    image_url TEXT,
    image_hint VARCHAR(255),
    FOREIGN KEY (attribute_type_id) REFERENCES category_attribute_types(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected', 'sold') DEFAULT 'pending',
    seller_id VARCHAR(255) NOT NULL,
    category_id VARCHAR(255),
    sub_category_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    image_hint VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_selected_attributes (
    product_id VARCHAR(255) NOT NULL,
    attribute_type_id VARCHAR(255) NOT NULL,
    attribute_value_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (product_id, attribute_type_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_type_id) REFERENCES category_attribute_types(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_value_id) REFERENCES category_attribute_values(id) ON DELETE CASCADE
);

-- =================================================================
-- Orders
-- =================================================================

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_charge_amount DECIMAL(10, 2),
    shipping_address JSON NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'accepted', 'handed_over', 'in_shipping') DEFAULT 'pending',
    payment_status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
    platform_commission DECIMAL(10, 2),
    shipping_method_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    seller_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    image_url TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =================================================================
-- Settings & Financials
-- =================================================================

CREATE TABLE IF NOT EXISTS business_settings (
    setting_key VARCHAR(255) PRIMARY KEY,
    setting_value JSON
);

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
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS custom_pages (
    id VARCHAR(255) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commissions (
    category_id VARCHAR(255) PRIMARY KEY,
    percentage DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS delivery_charge_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intra_upazilla_charge DECIMAL(10, 2) NOT NULL DEFAULT 60,
    intra_district_charge DECIMAL(10, 2) NOT NULL DEFAULT 110,
    inter_district_charge DECIMAL(10, 2) NOT NULL DEFAULT 130,
    intra_upazilla_extra_kg_charge DECIMAL(10, 2) DEFAULT 20,
    intra_district_extra_kg_charge DECIMAL(10, 2) DEFAULT 30,
    inter_district_extra_kg_charge DECIMAL(10, 2) DEFAULT 40
);

CREATE TABLE IF NOT EXISTS shipping_methods (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    withdrawal_method_id VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    admin_note TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (withdrawal_method_id) REFERENCES withdrawal_methods(id)
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