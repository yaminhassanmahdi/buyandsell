const mysql = require('mysql2/promise');

async function addFeaturedSectionAttribute() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'trustbuysell'
  });

  try {
    console.log('Adding is_featured_section column to category_attribute_types table...');

    // Check if column already exists
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM category_attribute_types LIKE 'is_featured_section'
    `);

    if (columns.length === 0) {
      // Add the column
      await connection.execute(`
        ALTER TABLE category_attribute_types 
        ADD COLUMN is_featured_section BOOLEAN DEFAULT FALSE 
        AFTER is_button_featured
      `);
      console.log('✅ is_featured_section column added successfully!');
    } else {
      console.log('✅ is_featured_section column already exists.');
    }

    // Show the updated table structure
    console.log('\nUpdated table structure:');
    const [tableStructure] = await connection.execute('DESCRIBE category_attribute_types');
    console.table(tableStructure);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addFeaturedSectionAttribute(); 