const mysql = require('mysql2/promise');

async function addMobileAttributeValues() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'trustbuysell'
  });

  try {
    console.log('Adding sample attribute values for Mobiles category...');

    // Get the attribute type IDs for Mobiles category
    const [attributeTypes] = await connection.execute(`
      SELECT id, name FROM category_attribute_types 
      WHERE category_id = 'cat-1751183630022-9727d'
      ORDER BY name
    `);

    console.log('Found attribute types:', attributeTypes);

    // Sample values for each attribute type
    const sampleValues = {
      'Brand': ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Huawei', 'Oppo', 'Vivo', 'Realme'],
      'RAM': ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'],
      'STORAGE': ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB']
    };

    for (const attrType of attributeTypes) {
      const values = sampleValues[attrType.name] || [];
      console.log(`Adding ${values.length} values for ${attrType.name}...`);

      for (const value of values) {
        const valueId = `val_${attrType.name.toLowerCase()}_${value.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        
        try {
          await connection.execute(`
            INSERT INTO category_attribute_values (id, attribute_type_id, value, image_url, image_hint)
            VALUES (?, ?, ?, ?, ?)
          `, [valueId, attrType.id, value, null, null]);
          
          console.log(`  - Added: ${value} (ID: ${valueId})`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`  - Skipped: ${value} (already exists)`);
          } else {
            console.error(`  - Error adding ${value}:`, error.message);
          }
        }
      }
    }

    console.log('\nMobile attribute values added successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addMobileAttributeValues(); 