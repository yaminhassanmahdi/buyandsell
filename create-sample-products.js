const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trustbuysell'
};

async function createSampleProducts() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔄 Creating sample products...');
    
    // First, let's create a category if it doesn't exist
    const categoryQuery = `
      INSERT INTO categories (id, name, sort_order) 
      VALUES ('cat1', 'Electronics', 1)
      ON DUPLICATE KEY UPDATE name = name
    `;
    await connection.execute(categoryQuery);
    console.log('✅ Category created/updated');
    
    // Create sample products
    const products = [
      {
        id: 'prod1',
        name: 'iPhone 13 Pro',
        description: 'Excellent condition iPhone 13 Pro, 128GB, Pacific Blue',
        price: 85000,
        stock: 1,
        status: 'approved',
        seller_id: 'user2', // Jane Smith
        category_id: 'cat1'
      },
      {
        id: 'prod2',
        name: 'MacBook Air M1',
        description: 'Like new MacBook Air with M1 chip, 8GB RAM, 256GB SSD',
        price: 120000,
        stock: 1,
        status: 'approved',
        seller_id: 'user2', // Jane Smith
        category_id: 'cat1'
      },
      {
        id: 'prod3',
        name: 'Samsung Galaxy S21',
        description: 'Good condition Samsung Galaxy S21, 128GB, Phantom Black',
        price: 45000,
        stock: 1,
        status: 'approved',
        seller_id: 'user_1751137854215_ovr8uq01a', // Yamin Hassan Mahdi
        category_id: 'cat1'
      }
    ];
    
    for (const product of products) {
      const productQuery = `
        INSERT INTO products (id, name, description, price, stock, status, seller_id, category_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          description = VALUES(description),
          price = VALUES(price),
          stock = VALUES(stock),
          status = VALUES(status)
      `;
      
      await connection.execute(productQuery, [
        product.id,
        product.name,
        product.description,
        product.price,
        product.stock,
        product.status,
        product.seller_id,
        product.category_id
      ]);
      
      console.log(`✅ Product created: ${product.name}`);
    }
    
    // Add product images
    const imageQuery = `
      INSERT INTO product_images (product_id, image_url, image_hint, is_primary)
      VALUES 
        ('prod1', '/uploads/images/1751084265590-8h9wjwy0xg2.png', 'iPhone 13 Pro', true),
        ('prod2', '/uploads/images/1751087418166-478bzlx0nf5.png', 'MacBook Air M1', true),
        ('prod3', '/uploads/images/1751088118831-1shqndd4r45.png', 'Samsung Galaxy S21', true)
      ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)
    `;
    await connection.execute(imageQuery);
    console.log('✅ Product images added');
    
    console.log('🎉 Sample products created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createSampleProducts();
