const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell'
};

async function addDualLogoSupport() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔄 Adding dual logo support to business_settings table...');
    
    // Add new columns for dual logo support
    await connection.execute(`
      ALTER TABLE business_settings 
      ADD COLUMN logo_url_horizontal TEXT AFTER logo_url,
      ADD COLUMN logo_url_vertical TEXT AFTER logo_url_horizontal
    `);
    
    // Update existing logo_url to logo_url_horizontal for backward compatibility
    await connection.execute(`
      UPDATE business_settings 
      SET logo_url_horizontal = logo_url 
      WHERE setting_key = 'business' AND logo_url IS NOT NULL AND logo_url != ''
    `);
    
    console.log('✅ Dual logo support added successfully!');
    console.log('📋 New columns:');
    console.log('   - logo_url_horizontal: For horizontal layouts (headers, etc.)');
    console.log('   - logo_url_vertical: For vertical layouts (mobile, sidebar, etc.)');
    
  } catch (error) {
    console.error('❌ Error adding dual logo support:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addDualLogoSupport();
