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

    // Start transaction
    await connection.beginTransaction();

    // 1. Migrate Categories
    console.log('Migrating categories...');
    const [categories] = await connection.execute('SELECT * FROM categories');
    const categoryMapping = new Map();

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
      
      // Update category
      await connection.execute(
        'UPDATE categories SET id = ? WHERE id = ?',
        [finalId, category.id]
      );
      
      console.log(`Category: ${category.name} -> ${finalId}`);
    }

    // 2. Migrate Users
    console.log('Migrating users...');
    const [users] = await connection.execute('SELECT * FROM users');
    const userMapping = new Map();

    for (const user of users) {
      const baseId = generateUserId(user.name);
      let finalId = baseId;
      let counter = 1;
      
      // Ensure uniqueness
      const [existing] = await connection.execute('SELECT id FROM users WHERE id = ? AND id != ?', [finalId, user.id]);
      while (existing.length > 0 || userMapping.has(finalId)) {
        finalId = `${baseId}${counter}`;
        counter++;
        const [checkAgain] = await connection.execute('SELECT id FROM users WHERE id = ? AND id != ?', [finalId, user.id]);
        if (checkAgain.length === 0) break;
      }
      
      userMapping.set(user.id, finalId);
      
      // Update user
      await connection.execute(
        'UPDATE users SET id = ? WHERE id = ?',
        [finalId, user.id]
      );
      
      console.log(`User: ${user.name} -> ${finalId}`);
    }

    // 3. Update Products with new category and user IDs
    console.log('Migrating products...');
    const [products] = await connection.execute('SELECT * FROM products');
    const productMapping = new Map();

    for (const product of products) {
      const newProductId = generateProductId(product.name);
      const newCategoryId = categoryMapping.get(product.category_id) || product.category_id;
      const newSellerId = userMapping.get(product.seller_id) || product.seller_id;
      
      productMapping.set(product.id, newProductId);
      
      // Update product
      await connection.execute(
        'UPDATE products SET id = ?, category_id = ?, seller_id = ? WHERE id = ?',
        [newProductId, newCategoryId, newSellerId, product.id]
      );
      
      console.log(`Product: ${product.name} -> ${newProductId}`);
    }

    // 4. Update Orders
    console.log('Migrating orders...');
    const [orders] = await connection.execute('SELECT * FROM orders');

    for (const order of orders) {
      const newOrderId = generateOrderId(order.created_at);
      const newUserId = userMapping.get(order.user_id) || order.user_id;
      
      // Update order
      await connection.execute(
        'UPDATE orders SET id = ?, user_id = ? WHERE id = ?',
        [newOrderId, newUserId, order.id]
      );
      
      // Update order items
      await connection.execute(
        'UPDATE order_items SET order_id = ? WHERE order_id = ?',
        [newOrderId, order.id]
      );
      
      console.log(`Order: ${order.id} -> ${newOrderId}`);
    }

    // 5. Update Order Items with new product and seller IDs
    console.log('Updating order items...');
    const [orderItems] = await connection.execute('SELECT * FROM order_items');

    for (const item of orderItems) {
      const newProductId = productMapping.get(item.product_id) || item.product_id;
      const newSellerId = userMapping.get(item.seller_id) || item.seller_id;
      
      await connection.execute(
        'UPDATE order_items SET product_id = ?, seller_id = ? WHERE order_id = ? AND product_id = ?',
        [newProductId, newSellerId, item.order_id, item.product_id]
      );
    }

    // 6. Update other related tables
    console.log('Updating related tables...');
    
    // Update shipping addresses
    for (const [oldUserId, newUserId] of userMapping) {
      await connection.execute(
        'UPDATE shipping_addresses SET user_id = ? WHERE user_id = ?',
        [newUserId, oldUserId]
      );
    }
    
    // Update withdrawal methods
    for (const [oldUserId, newUserId] of userMapping) {
      await connection.execute(
        'UPDATE withdrawal_methods SET user_id = ? WHERE user_id = ?',
        [newUserId, oldUserId]
      );
    }
    
    // Update withdrawal requests
    for (const [oldUserId, newUserId] of userMapping) {
      await connection.execute(
        'UPDATE withdrawal_requests SET user_id = ? WHERE user_id = ?',
        [newUserId, oldUserId]
      );
    }

    // Update product images
    for (const [oldProductId, newProductId] of productMapping) {
      await connection.execute(
        'UPDATE product_images SET product_id = ? WHERE product_id = ?',
        [newProductId, oldProductId]
      );
    }

    // Update commissions
    for (const [oldCategoryId, newCategoryId] of categoryMapping) {
      await connection.execute(
        'UPDATE commissions SET category_id = ? WHERE category_id = ?',
        [newCategoryId, oldCategoryId]
      );
    }

    // Commit transaction
    await connection.commit();
    console.log('✅ Migration completed successfully!');
    
    // Print summary
    console.log('\n📊 Migration Summary:');
    console.log(`- ${categories.length} categories migrated`);
    console.log(`- ${users.length} users migrated`);
    console.log(`- ${products.length} products migrated`);
    console.log(`- ${orders.length} orders migrated`);
    console.log(`- ${orderItems.length} order items updated`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (connection) {
      await connection.rollback();
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration
migrateDatabase().catch(console.error); 