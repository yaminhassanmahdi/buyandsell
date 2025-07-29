-- Business Settings Table with Individual Columns
-- This replaces the JSONB approach with proper database columns

DROP TABLE IF EXISTS business_settings;

CREATE TABLE IF NOT EXISTS business_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    app_name VARCHAR(255) DEFAULT '2ndhandbajar.com',
    logo_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(50) DEFAULT '217 91% 60%',
    secondary_color VARCHAR(50) DEFAULT '216 34% 90%',
    available_currencies JSONB DEFAULT '[{"code":"BDT","symbol":"৳","name":"Bangladeshi Taka"},{"code":"USD","symbol":"$","name":"US Dollar"}]',
    default_currency_code VARCHAR(10) DEFAULT 'BDT',
    google_client_id VARCHAR(255),
    google_client_secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default business settings
INSERT INTO business_settings (setting_key, app_name, logo_url, favicon_url, primary_color, secondary_color, available_currencies, default_currency_code) 
VALUES (
    'business',
    '2ndhandbajar.com',
    '',
    '',
    '217 91% 60%',
    '216 34% 90%',
    '[{"code":"BDT","symbol":"৳","name":"Bangladeshi Taka"},{"code":"USD","symbol":"$","name":"US Dollar"}]',
    'BDT'
) ON CONFLICT (setting_key) DO UPDATE SET
    app_name = EXCLUDED.app_name,
    logo_url = EXCLUDED.logo_url,
    favicon_url = EXCLUDED.favicon_url,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    available_currencies = EXCLUDED.available_currencies,
    default_currency_code = EXCLUDED.default_currency_code,
    updated_at = CURRENT_TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_settings_key ON business_settings(setting_key);
