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

// Check if an ID looks random/generated vs user-friendly
function isRandomId(id) {
  // Random ID patterns to detect
  const patterns = [
    /^[A-Z]\d{12,}$/, // Like U856373080001
    /^cat-\d{13}-\w+$/, // Like cat-1751183630022-9727d
    /^P\d{12,}$/, // Like P877741370001
    /^\d{6,}$/, // Numeric only like 100001
    /^user_\d{13}_\w+$/, // Like user_1751145111686_lgqaqa6is
    /^WR\d{13}\d{3}$/, // Withdrawal request IDs
    /^attr_type-\d{13}-\w+$/, // Attribute type IDs
  ];
  
  return patterns.some(pattern => pattern.test(id));
}

async function migrateRandomIds() {
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
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.beginTransaction();

    const mappings = {
      categories: new Map(),
      users: new Map(),
      products: new Map(),
      orders: new Map(),
      attributeTypes: new Map()
    };

    // 1. Fix random category IDs
    console.log('Checking categories...');
    const [categories] = await connection.execute('SELECT * FROM categories');
    let categoryCount = 0;

    for (const category of categories) {
      if (isRandomId(category.id)) {
        const newId = generateCategoryId(category.name);
        let finalId = newId;
        let counter = 1;
        
        // Ensure uniqueness against existing IDs
        const existingIds = categories.map(c => c.id);
        while (existingIds.includes(finalId) || mappings.categories.has(finalId)) {
          finalId = `${newId}${counter}`;
          counter++;
        }
        
        mappings.categories.set(category.id, finalId);
        console.log(`  Category: ${category.name} (${category.id}) -> ${finalId}`);
        categoryCount++;
      }
    }

    // 2. Fix random user IDs
    console.log('Checking users...');
    const [users] = await connection.execute('SELECT * FROM users');
    let userCount = 0;

    for (const user of users) {
      if (isRandomId(user.id)) {
        const baseId = generateUserId(user.name);
        let finalId = baseId;
        let counter = 1;
        
        // Ensure uniqueness
        const existingIds = users.map(u => u.id);
        while (existingIds.includes(finalId) || mappings.users.has(finalId)) {
          finalId = `${baseId}${counter}`;
          counter++;
        }
        
        mappings.users.set(user.id, finalId);
        console.log(`  User: ${user.name} (${user.id}) -> ${finalId}`);
        userCount++;
      }
    }

    // 3. Fix random attribute type IDs
    console.log('Checking attribute types...');
    const [attributeTypes] = await connection.execute('SELECT * FROM category_attribute_types');
    let attributeTypeCount = 0;

    for (const attrType of attributeTypes) {
      if (isRandomId(attrType.id)) {
        const baseId = `attr-${attrType.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        let finalId = baseId;
        let counter = 1;
        
        // Ensure uniqueness
        const existingIds = attributeTypes.map(at => at.id);
        while (existingIds.includes(finalId) || mappings.attributeTypes.has(finalId)) {
          finalId = `${baseId}-${counter}`;
          counter++;
        }
        
        mappings.attributeTypes.set(attrType.id, finalId);
        console.log(`  Attribute Type: ${attrType.name} (${attrType.id}) -> ${finalId}`);
        attributeTypeCount++;
      }
    }

    // 4. Fix random product IDs
    console.log('Checking products...');
    const [products] = await connection.execute('SELECT * FROM products');
    let productCount = 0;

    for (const product of products) {
      if (isRandomId(product.id)) {
        const baseId = generateProductId(product.name);
        let finalId = baseId;
        let counter = 1;
        
        // Ensure uniqueness
        const existingIds = products.map(p => p.id);
        while (existingIds.includes(finalId) || mappings.products.has(finalId)) {
          finalId = `${baseId}${counter}`;
          counter++;
        }
        
        mappings.products.set(product.id, finalId);
        console.log(`  Product: ${product.name} (${product.id}) -> ${finalId}`);
        productCount++;
      }
    }

    // 5. Fix random order IDs
    console.log('Checking orders...');
    const [orders] = await connection.execute('SELECT * FROM orders');
    let orderCount = 0;

    for (const order of orders) {
      if (isRandomId(order.id)) {
        const baseId = generateOrderId(order.created_at);
        let finalId = baseId;
        let counter = 1;
        
        // Ensure uniqueness
        const existingIds = orders.map(o => o.id);
        while (existingIds.includes(finalId) || mappings.orders.has(finalId)) {
          finalId = `${baseId}-${counter}`;
          counter++;
        }
        
        mappings.orders.set(order.id, finalId);
        console.log(`  Order: ${order.id} -> ${finalId}`);
        orderCount++;
      }
    }

    // Now apply the updates
    console.log('\nApplying updates...');

    // Update categories and their references
    for (const [oldId, newId] of mappings.categories) {
      await connection.execute('UPDATE categories SET id = ? WHERE id = ?', [newId, oldId]);
      await connection.execute('UPDATE category_attribute_types SET category_id = ? WHERE category_id = ?', [newId, oldId]);
      await connection.execute('UPDATE sub_categories SET category_id = ? WHERE category_id = ?', [newId, oldId]);
      await connection.execute('UPDATE commissions SET category_id = ? WHERE category_id = ?', [newId, oldId]);
    }

    // Update attribute types and their references
    for (const [oldId, newId] of mappings.attributeTypes) {
      await connection.execute('UPDATE category_attribute_types SET id = ? WHERE id = ?', [newId, oldId]);
      await connection.execute('UPDATE category_attribute_values SET attribute_type_id = ? WHERE attribute_type_id = ?', [newId, oldId]);
      await connection.execute('UPDATE product_selected_attributes SET attribute_type_id = ? WHERE attribute_type_id = ?', [newId, oldId]);
    }

    // Update users and their references
    for (const [oldId, newId] of mappings.users) {
      await connection.execute('UPDATE users SET id = ? WHERE id = ?', [newId, oldId]);
      await connection.execute('UPDATE shipping_addresses SET user_id = ? WHERE user_id = ?', [newId, oldId]);
      await connection.execute('UPDATE withdrawal_methods SET user_id = ? WHERE user_id = ?', [newId, oldId]);
      await connection.execute('UPDATE withdrawal_requests SET user_id = ? WHERE user_id = ?', [newId, oldId]);
    }

    // Update products and their references
    for (const [oldId, newId] of mappings.products) {
      const [productData] = await connection.execute('SELECT category_id, seller_id FROM products WHERE id = ?', [oldId]);
      if (productData.length > 0) {
        const newCategoryId = mappings.categories.get(productData[0].category_id) || productData[0].category_id;
        const newSellerId = mappings.users.get(productData[0].seller_id) || productData[0].seller_id;
        
        await connection.execute(
          'UPDATE products SET id = ?, category_id = ?, seller_id = ? WHERE id = ?',
          [newId, newCategoryId, newSellerId, oldId]
        );
      }
      
      await connection.execute('UPDATE product_images SET product_id = ? WHERE product_id = ?', [newId, oldId]);
      await connection.execute('UPDATE product_selected_attributes SET product_id = ? WHERE product_id = ?', [newId, oldId]);
    }

    // Update orders and their references
    for (const [oldId, newId] of mappings.orders) {
      const [orderData] = await connection.execute('SELECT user_id FROM orders WHERE id = ?', [oldId]);
      if (orderData.length > 0) {
        const newUserId = mappings.users.get(orderData[0].user_id) || orderData[0].user_id;
        
        await connection.execute(
          'UPDATE orders SET id = ?, user_id = ? WHERE id = ?',
          [newId, newUserId, oldId]
        );
      }
      
      // Update order items
      const [orderItems] = await connection.execute('SELECT * FROM order_items WHERE order_id = ?', [oldId]);
      for (const item of orderItems) {
        const newProductId = mappings.products.get(item.product_id) || item.product_id;
        const newSellerId = mappings.users.get(item.seller_id) || item.seller_id;
        
        await connection.execute(
          'UPDATE order_items SET order_id = ?, product_id = ?, seller_id = ? WHERE order_id = ? AND product_id = ?',
          [newId, newProductId, newSellerId, oldId, item.product_id]
        );
      }
    }

    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();

    console.log('\n✅ Migration completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`- ${categoryCount} categories migrated`);
    console.log(`- ${userCount} users migrated`);
    console.log(`- ${attributeTypeCount} attribute types migrated`);
    console.log(`- ${productCount} products migrated`);
    console.log(`- ${orderCount} orders migrated`);

    if (categoryCount === 0 && userCount === 0 && attributeTypeCount === 0 && productCount === 0 && orderCount === 0) {
      console.log('\n🎉 No random IDs found - your database already has user-friendly IDs!');
    }

    // Show some examples of new IDs
    if (mappings.users.size > 0) {
      console.log('\n🔍 Example user ID conversions:');
      Array.from(mappings.users.entries()).slice(0, 3).forEach(([old, new_]) => {
        console.log(`  ${old} -> ${new_}`);
      });
    }

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

migrateRandomIds().catch(console.error); 