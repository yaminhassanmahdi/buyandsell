const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'trustbuysell',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database');

    // Check all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check structure of key tables
    const tablesToCheck = ['categories', 'users', 'products', 'orders'];
    
    for (const tableName of tablesToCheck) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`\n🔍 Structure of ${tableName}:`);
        columns.forEach(col => {
          console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''}`);
        });

        // Get sample data
        const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
        if (sampleData.length > 0) {
          console.log(`\n📊 Sample data from ${tableName}:`);
          sampleData.forEach((row, index) => {
            console.log(`  Row ${index + 1}:`, row);
          });
        }
      } catch (error) {
        console.log(`  ❌ Table ${tableName} not found or error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase().catch(console.error); 