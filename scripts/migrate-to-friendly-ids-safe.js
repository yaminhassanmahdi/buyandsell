const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper functions for ID generation
function generateUserId(name) {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .trim();

  return cleanName.substring(0, 20) || 'user';
}

function generateCategoryId(categoryName) {
  return categoryName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function generateProductId(productName) {
  const timestamp = Date.now().toString().slice(-6);
  const cleanName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 8);
  return `${cleanName}-${timestamp}`;
}

function generateOrderId(createdAt) {
  const date = new Date(createdAt);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const time = date.getTime().toString().slice(-6);
  
  return `ORD-${year}${month}${day}-${time}`;
}

async function migrateDatabase() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'trustbuysell',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to database');

    // Disable foreign key checks temporarily
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Disabled foreign key checks');

    // Start transaction
    await connection.beginTransaction();

    // Create mapping tables to track ID changes
    const categoryMapping = new Map();
    const userMapping = new Map();
    const productMapping = new Map();
    const orderMapping = new Map();

    // 1. Migrate Categories first
    console.log('Migrating categories...');
    const [categories] = await connection.execute('SELECT * FROM categories ORDER BY created_at');

    for (const category of categories) {
      const newId = generateCategoryId(category.name);
      let finalId = newId;
      let counter = 1;
      
      // Ensure uniqueness
      while (categoryMapping.has(finalId) || finalId === category.id) {
        finalId = `${newId}${counter}`;
        counter++;
      }
      
      categoryMapping.set(category.id, finalId);
      console.log(`Category: ${category.name} -> ${finalId}`);
    }

    // 2. Migrate Users
    console.log('Migrating users...');
    const [users] = await connection.execute('SELECT * FROM users ORDER BY created_at');

    for (const user of users) {
      const baseId = generateUserId(user.name);
      let finalId = baseId;
      let counter = 1;
      
      // Ensure uniqueness
      const usedIds = new Set(Array.from(userMapping.values()));
      while (usedIds.has(finalId) || finalId === user.id) {
        finalId = `${baseId}${counter}`;
        counter++;
      }
      
      userMapping.set(user.id, finalId);
      console.log(`User: ${user.name} -> ${finalId}`);
    }

    // 3. Migrate Products
    console.log('Migrating products...');
    const [products] = await connection.execute('SELECT * FROM products ORDER BY created_at');

    for (const product of products) {
      const newProductId = generateProductId(product.name);
      let finalId = newProductId;
      let counter = 1;
      
      // Ensure uniqueness
      const usedIds = new Set(Array.from(productMapping.values()));
      while (usedIds.has(finalId) || finalId === product.id) {
        finalId = `${newProductId}${counter}`;
        counter++;
      }
      
      productMapping.set(product.id, finalId);
      console.log(`Product: ${product.name} -> ${finalId}`);
    }

    // 4. Migrate Orders
    console.log('Migrating orders...');
    const [orders] = await connection.execute('SELECT * FROM orders ORDER BY created_at');

    for (const order of orders) {
      const newOrderId = generateOrderId(order.created_at);
      let finalId = newOrderId;
      let counter = 1;
      
      // Ensure uniqueness
      const usedIds = new Set(Array.from(orderMapping.values()));
      while (usedIds.has(finalId) || finalId === order.id) {
        finalId = `${newOrderId}-${counter}`;
        counter++;
      }
      
      orderMapping.set(order.id, finalId);
      console.log(`Order: ${order.id} -> ${finalId}`);
    }

    // Now perform the actual updates
    console.log('\nUpdating database with new IDs...');

    // Update all category-related tables
    for (const [oldId, newId] of categoryMapping) {
      // Update main categories table
      await connection.execute('UPDATE categories SET id = ? WHERE id = ?', [newId, oldId]);
      
      // Update related tables
      await connection.execute('UPDATE category_attribute_types SET category_id = ? WHERE category_id = ?', [newId, oldId]);
      await connection.execute('UPDATE category_attribute_values SET category_id = ? WHERE category_id = ?', [newId, oldId]);
      await connection.execute('UPDATE sub_categories SET category_id = ? WHERE category_id = ?', [newId, oldId]);
      await connection.execute('UPDATE commissions SET category_id = ? WHERE category_id = ?', [newId, oldId]);
    }

    // Update all user-related tables
    for (const [oldId, newId] of userMapping) {
      // Update main users table
      await connection.execute('UPDATE users SET id = ? WHERE id = ?', [newId, oldId]);
      
      // Update related tables
      await connection.execute('UPDATE shipping_addresses SET user_id = ? WHERE user_id = ?', [newId, oldId]);
      await connection.execute('UPDATE withdrawal_methods SET user_id = ? WHERE user_id = ?', [newId, oldId]);
      await connection.execute('UPDATE withdrawal_requests SET user_id = ? WHERE user_id = ?', [newId, oldId]);
    }

    // Update all product-related tables
    for (const [oldId, newId] of productMapping) {
      // Update main products table with new category and seller IDs
      const [productData] = await connection.execute('SELECT category_id, seller_id FROM products WHERE id = ?', [oldId]);
      if (productData.length > 0) {
        const newCategoryId = categoryMapping.get(productData[0].category_id) || productData[0].category_id;
        const newSellerId = userMapping.get(productData[0].seller_id) || productData[0].seller_id;
        
        await connection.execute(
          'UPDATE products SET id = ?, category_id = ?, seller_id = ? WHERE id = ?',
          [newId, newCategoryId, newSellerId, oldId]
        );
      }
      
      // Update related tables
      await connection.execute('UPDATE product_images SET product_id = ? WHERE product_id = ?', [newId, oldId]);
    }

    // Update all order-related tables
    for (const [oldId, newId] of orderMapping) {
      // Update main orders table with new user ID
      const [orderData] = await connection.execute('SELECT user_id FROM orders WHERE id = ?', [oldId]);
      if (orderData.length > 0) {
        const newUserId = userMapping.get(orderData[0].user_id) || orderData[0].user_id;
        
        await connection.execute(
          'UPDATE orders SET id = ?, user_id = ? WHERE id = ?',
          [newId, newUserId, oldId]
        );
      }
      
      // Update order items with new order, product, and seller IDs
      const [orderItems] = await connection.execute('SELECT * FROM order_items WHERE order_id = ?', [oldId]);
      for (const item of orderItems) {
        const newProductId = productMapping.get(item.product_id) || item.product_id;
        const newSellerId = userMapping.get(item.seller_id) || item.seller_id;
        
        await connection.execute(
          'UPDATE order_items SET order_id = ?, product_id = ?, seller_id = ? WHERE order_id = ? AND product_id = ?',
          [newId, newProductId, newSellerId, oldId, item.product_id]
        );
      }
    }

    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Re-enabled foreign key checks');

    // Commit transaction
    await connection.commit();
    console.log('✅ Migration completed successfully!');
    
    // Print summary
    console.log('\n📊 Migration Summary:');
    console.log(`- ${categories.length} categories migrated`);
    console.log(`- ${users.length} users migrated`);
    console.log(`- ${products.length} products migrated`);
    console.log(`- ${orders.length} orders migrated`);

    console.log('\n🔍 Sample new IDs:');
    const categoryEntries = Array.from(categoryMapping.entries()).slice(0, 3);
    const userEntries = Array.from(userMapping.entries()).slice(0, 3);
    const productEntries = Array.from(productMapping.entries()).slice(0, 3);
    const orderEntries = Array.from(orderMapping.entries()).slice(0, 3);

    categoryEntries.forEach(([old, new_]) => console.log(`  Category: ${old} -> ${new_}`));
    userEntries.forEach(([old, new_]) => console.log(`  User: ${old} -> ${new_}`));
    productEntries.forEach(([old, new_]) => console.log(`  Product: ${old} -> ${new_}`));
    orderEntries.forEach(([old, new_]) => console.log(`  Order: ${old} -> ${new_}`));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (connection) {
      try {
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration
migrateDatabase().catch(console.error); 