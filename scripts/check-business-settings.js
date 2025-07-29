const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trustbuysell'
};

async function checkBusinessSettings() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('📋 Current business_settings table structure:');
    
    // Check table structure
    const [columns] = await connection.execute(`
      DESCRIBE business_settings
    `);
    
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Default ? `DEFAULT: ${col.Default}` : ''}`);
    });
    
    console.log('\n📊 Current business settings data:');
    
    // Check current data
    const [rows] = await connection.execute(`
      SELECT * FROM business_settings WHERE setting_key = 'business'
    `);
    
    if (rows.length > 0) {
      const settings = rows[0];
      console.log('   Setting Key:', settings.setting_key);
      console.log('   App Name:', settings.app_name);
      console.log('   Logo URL:', settings.logo_url || '(empty)');
      console.log('   Favicon URL:', settings.favicon_url || '(empty)');
      console.log('   Primary Color:', settings.primary_color);
      console.log('   Secondary Color:', settings.secondary_color);
      console.log('   Default Currency:', settings.default_currency_code);
      console.log('   Available Currencies:', settings.available_currencies);
      console.log('   Created At:', settings.created_at);
      console.log('   Updated At:', settings.updated_at);
    } else {
      console.log('   No business settings found');
    }
    
  } catch (error) {
    console.error('❌ Error checking business settings:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkBusinessSettings();
