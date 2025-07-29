const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell'
};

async function updateBusinessSettingsSchema() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔄 Updating business_settings table structure...');
    
    // Drop the old table if it exists
    await connection.execute('DROP TABLE IF EXISTS business_settings');
    
    // Create new table with individual columns
    const createTableQuery = `
      CREATE TABLE business_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        app_name VARCHAR(255) DEFAULT '2ndhandbajar.com',
        logo_url TEXT,
        favicon_url TEXT,
        primary_color VARCHAR(50) DEFAULT '217 91% 60%',
        secondary_color VARCHAR(50) DEFAULT '216 34% 90%',
        available_currencies JSON DEFAULT '[{"code":"BDT","symbol":"৳","name":"Bangladeshi Taka"},{"code":"USD","symbol":"$","name":"US Dollar"}]',
        default_currency_code VARCHAR(10) DEFAULT 'BDT',
        google_client_id VARCHAR(255),
        google_client_secret VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.execute(createTableQuery);
    
    // Insert default business settings
    const insertQuery = `
      INSERT INTO business_settings (
        setting_key, app_name, logo_url, favicon_url, 
        primary_color, secondary_color, available_currencies, default_currency_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const defaultCurrencies = JSON.stringify([
      { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
      { code: 'USD', symbol: '$', name: 'US Dollar' }
    ]);
    
    await connection.execute(insertQuery, [
      'business',
      '2ndhandbajar.com',
      '',
      '',
      '217 91% 60%',
      '216 34% 90%',
      defaultCurrencies,
      'BDT'
    ]);
    
    // Create index for faster lookups
    await connection.execute('CREATE INDEX idx_business_settings_key ON business_settings(setting_key)');
    
    console.log('✅ Business settings table updated successfully!');
    console.log('📋 New structure:');
    console.log('   - setting_key: VARCHAR(255)');
    console.log('   - app_name: VARCHAR(255)');
    console.log('   - logo_url: TEXT');
    console.log('   - favicon_url: TEXT');
    console.log('   - primary_color: VARCHAR(50)');
    console.log('   - secondary_color: VARCHAR(50)');
    console.log('   - available_currencies: JSON');
    console.log('   - default_currency_code: VARCHAR(10)');
    
  } catch (error) {
    console.error('❌ Error updating business settings schema:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateBusinessSettingsSchema();
