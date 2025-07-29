const mysql = require('mysql2/promise');

async function checkCategoriesAndAttributes() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'trustbuysell'
  });

  try {
    console.log('=== Checking Categories ===');
    const [categories] = await connection.execute('SELECT * FROM categories ORDER BY name');
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat.id})`);
    });

    console.log('\n=== Checking Sub-Categories ===');
    const [subCategories] = await connection.execute('SELECT * FROM sub_categories ORDER BY name');
    console.log(`Found ${subCategories.length} sub-categories:`);
    subCategories.forEach(subCat => {
      console.log(`- ${subCat.name} (ID: ${subCat.id}, Parent: ${subCat.parent_category_id})`);
    });

    console.log('\n=== Checking Attribute Types ===');
    const [attributeTypes] = await connection.execute('SELECT * FROM category_attribute_types ORDER BY category_id, name');
    console.log(`Found ${attributeTypes.length} attribute types:`);
    attributeTypes.forEach(attr => {
      console.log(`- ${attr.name} (ID: ${attr.id}, Category: ${attr.category_id})`);
    });

    console.log('\n=== Checking Attribute Values ===');
    const [attributeValues] = await connection.execute('SELECT * FROM category_attribute_values ORDER BY attribute_type_id, value');
    console.log(`Found ${attributeValues.length} attribute values:`);
    attributeValues.forEach(val => {
      console.log(`- ${val.value} (ID: ${val.id}, Type: ${val.attribute_type_id})`);
    });

    console.log('\n=== Checking Commissions ===');
    const [commissions] = await connection.execute('SELECT * FROM commissions ORDER BY category_id');
    console.log(`Found ${commissions.length} commission records:`);
    commissions.forEach(comm => {
      console.log(`- Category ${comm.category_id}: ${comm.percentage}%`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkCategoriesAndAttributes(); 