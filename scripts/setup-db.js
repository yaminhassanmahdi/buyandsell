const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trustbuysell',
  multipleStatements: true
};

// Database configuration with database specified
const dbConfigWithDB = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trustbuysell',
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    // Create connection without specifying database
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS trustbuysell');
    console.log('Database created or already exists');
    
    // Close the first connection
    await connection.end();

    // Create new connection with database specified
    connection = await mysql.createConnection(dbConfigWithDB);
    console.log('Connected to trustbuysell database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'schema-mysql.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement + ';');
      }
    }
    console.log('Schema created successfully');

    // Insert seed data
    await insertSeedData(connection);
    console.log('Seed data inserted successfully');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function insertSeedData(connection) {
  // Insert initial categories
  const categories = [
    ['electronics', 'Electronics', 'https://placehold.co/300x200.png', 'electronics gadgets', 1],
    ['fashion', 'Fashion & Beauty', 'https://placehold.co/300x200.png', 'fashion clothing', 2],
    ['home-garden', 'Home & Garden', 'https://placehold.co/300x200.png', 'home furniture', 3],
    ['books', 'Books & Education', 'https://placehold.co/300x200.png', 'books education', 4],
    ['sports', 'Sports & Recreation', 'https://placehold.co/300x200.png', 'sports recreation', 5],
    ['vehicles', 'Vehicles', 'https://placehold.co/300x200.png', 'vehicles cars', 6],
    ['pets', 'Pets & Animals', 'https://placehold.co/300x200.png', 'pets animals', 7],
    ['jobs', 'Jobs & Services', 'https://placehold.co/300x200.png', 'jobs services', 8]
  ];

  for (const category of categories) {
    await connection.execute(
      'INSERT IGNORE INTO categories (id, name, image_url, image_hint, sort_order) VALUES (?, ?, ?, ?, ?)',
      category
    );
  }

  // Insert sub-categories
  const subCategories = [
    ['sc_smartphones', 'electronics', 'Smartphones', 'https://placehold.co/150x150.png', 'smartphone mobile'],
    ['sc_computers', 'electronics', 'Computers & Laptops', 'https://placehold.co/150x150.png', 'computer laptop'],
    ['sc_mens_apparel', 'fashion', 'Men\'s Apparel', 'https://placehold.co/150x150.png', 'mens clothing'],
    ['sc_womens_apparel', 'fashion', 'Women\'s Apparel', 'https://placehold.co/150x150.png', 'womens clothing'],
    ['sc_living_room', 'home-garden', 'Living Room', 'https://placehold.co/150x150.png', 'living room furniture'],
    ['sc_bedroom', 'home-garden', 'Bedroom', 'https://placehold.co/150x150.png', 'bedroom furniture'],
    ['sc_novels', 'books', 'Novels & Literature', 'https://placehold.co/150x150.png', 'novels literature'],
    ['sc_admission_books', 'books', 'Admission Books', 'https://placehold.co/150x150.png', 'admission books']
  ];

  for (const subCat of subCategories) {
    await connection.execute(
      'INSERT IGNORE INTO sub_categories (id, parent_category_id, name, image_url, image_hint) VALUES (?, ?, ?, ?, ?)',
      subCat
    );
  }

  // Insert attribute types
  const attributeTypes = [
    ['attr_color', 'fashion', 'Color'],
    ['attr_material', 'fashion', 'Material'],
    ['attr_storage', 'electronics', 'Storage'],
    ['attr_ram', 'electronics', 'RAM'],
    ['attr_author', 'books', 'Author'],
    ['attr_publication', 'books', 'Publication']
  ];

  for (const attrType of attributeTypes) {
    await connection.execute(
      'INSERT IGNORE INTO category_attribute_types (id, category_id, name) VALUES (?, ?, ?)',
      attrType
    );
  }

  // Insert attribute values
  const attributeValues = [
    ['val_color_black', 'attr_color', 'Black'],
    ['val_color_red', 'attr_color', 'Red'],
    ['val_material_leather', 'attr_material', 'Leather'],
    ['val_material_cotton', 'attr_material', 'Cotton'],
    ['val_storage_64gb', 'attr_storage', '64GB'],
    ['val_ram_4gb', 'attr_ram', '4GB'],
    ['val_author_tagore', 'attr_author', 'Rabindranath Tagore'],
    ['val_pub_anyaprokash', 'attr_publication', 'Anya Prokash'],
    ['val_pub_prothom', 'attr_publication', 'Prothom Alo']
  ];

  for (const attrVal of attributeValues) {
    await connection.execute(
      'INSERT IGNORE INTO category_attribute_values (id, attribute_type_id, value) VALUES (?, ?, ?)',
      attrVal
    );
  }

  // Insert sample users
  const users = [
    ['user1', 'John Doe', 'buyer@example.com', '01711111111', null, false, null],
    ['user2', 'Jane Smith', 'seller@example.com', '01822222222', null, false, null],
    ['admin1', 'Admin User', 'admin@example.com', '01999999999', null, true, null]
  ];

  for (const user of users) {
    await connection.execute(
      'INSERT IGNORE INTO users (id, name, email, phone_number, password_hash, is_admin, google_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      user
    );
  }

  // Insert shipping methods
  const shippingMethods = [
    ['standard-delivery', 'Standard Delivery'],
    ['express-delivery', 'Express Delivery (Next Day)']
  ];

  for (const method of shippingMethods) {
    await connection.execute(
      'INSERT IGNORE INTO shipping_methods (id, name) VALUES (?, ?)',
      method
    );
  }

  // Insert delivery charge settings
  await connection.execute(
    'INSERT IGNORE INTO delivery_charge_settings (intra_thana_charge, intra_district_charge, inter_district_charge) VALUES (60, 110, 130)'
  );

  // Insert initial commission settings for each category
  const commissionSettings = [
    ['electronics', 8.0],
    ['fashion', 7.0],
    ['home-garden', 6.0],
    ['books', 5.0],
    ['sports', 7.0],
    ['vehicles', 10.0],
    ['pets', 6.0],
    ['jobs', 12.0]
  ];

  for (const commission of commissionSettings) {
    await connection.execute(
      'INSERT IGNORE INTO commissions (category_id, percentage) VALUES (?, ?)',
      commission
    );
  }

  // Insert business settings
  const businessSettings = {
    appName: '2ndhandbajar.com',
    logoUrl: 'https://placehold.co/200x50.png',
    primaryColor: 'hsl(222, 84%, 55%)',
    secondaryColor: 'hsl(222, 84%, 45%)',
    faviconUrl: 'https://placehold.co/32x32.png',
    defaultCurrencyCode: 'BDT',
    availableCurrencies: [
      { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
      { code: 'USD', symbol: '$', name: 'US Dollar' }
    ]
  };

  await connection.execute(
    'INSERT INTO business_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
    ['main', JSON.stringify(businessSettings)]
  );

  console.log('Initial seed data inserted');
}

// Run setup
setupDatabase(); 