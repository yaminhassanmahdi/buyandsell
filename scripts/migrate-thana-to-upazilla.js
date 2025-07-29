const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell',
  multipleStatements: true
};

async function migrateThanaToUpazilla() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Check if thana column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'trustbuysell' 
      AND TABLE_NAME = 'shipping_addresses' 
      AND COLUMN_NAME = 'thana'
    `);

    if (columns.length > 0) {
      console.log('Found thana column, renaming to upazilla...');
      
      // Rename thana column to upazilla
      await connection.execute('ALTER TABLE shipping_addresses CHANGE thana upazilla VARCHAR(100)');
      console.log('Successfully renamed thana to upazilla');
      
      // Make upazilla nullable (optional)
      await connection.execute('ALTER TABLE shipping_addresses MODIFY upazilla VARCHAR(100) NULL');
      console.log('Made upazilla field optional');
    } else {
      console.log('thana column not found, checking if upazilla already exists...');
      
      const [upazillaColumns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'trustbuysell' 
        AND TABLE_NAME = 'shipping_addresses' 
        AND COLUMN_NAME = 'upazilla'
      `);
      
      if (upazillaColumns.length === 0) {
        console.log('Adding upazilla column...');
        await connection.execute('ALTER TABLE shipping_addresses ADD COLUMN upazilla VARCHAR(100) NULL');
        console.log('Added upazilla column');
      } else {
        console.log('upazilla column already exists');
      }
    }

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateThanaToUpazilla(); 