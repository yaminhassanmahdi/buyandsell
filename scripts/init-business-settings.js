const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell'
};

async function initBusinessSettings() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Default business settings
    const defaultSettings = {
      appName: '2ndhandbajar.com',
      logoUrl: '',
      primaryColor: '217 91% 60%',
      secondaryColor: '216 34% 90%',
      faviconUrl: '',
      availableCurrencies: [
        { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
        { code: 'USD', symbol: '$', name: 'US Dollar' }
      ],
      defaultCurrencyCode: 'BDT'
    };

    // Insert or update business settings
    const query = `
      INSERT INTO business_settings (setting_key, setting_value) 
      VALUES ('business', ?) 
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `;
    
    await connection.execute(query, [JSON.stringify(defaultSettings)]);
    
    console.log('✅ Business settings initialized successfully!');
    console.log('Default settings:', JSON.stringify(defaultSettings, null, 2));
    
  } catch (error) {
    console.error('❌ Error initializing business settings:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initBusinessSettings();
