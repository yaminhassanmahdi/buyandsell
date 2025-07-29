const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell'
};

const sampleProducts = [
  {
    id: 'prod1',
    name: 'Vintage Leather Jacket',
    description: 'A stylish vintage leather jacket, barely used. Size M.',
    price: 75.00,
    stock: 5,
    sellerId: 'user2',
    categoryId: 'fashion',
    subCategoryId: 'sc_mens_apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'leather jacket',
    status: 'approved',
    selectedAttributes: [
      { attributeTypeId: 'attr_color', attributeValueId: 'val_color_black' },
      { attributeTypeId: 'attr_material', attributeValueId: 'val_material_leather' }
    ]
  },
  {
    id: 'prod2',
    name: 'Used iPhone X',
    description: 'Good condition iPhone X, 64GB, unlocked. Minor scratches on the back.',
    price: 250.00,
    stock: 3,
    sellerId: 'user2',
    categoryId: 'electronics',
    subCategoryId: 'sc_smartphones',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'smartphone electronics',
    status: 'approved',
    selectedAttributes: [
      { attributeTypeId: 'attr_storage', attributeValueId: 'val_storage_64gb' },
      { attributeTypeId: 'attr_ram', attributeValueId: 'val_ram_4gb' }
    ]
  },
  {
    id: 'prod3',
    name: 'Bookshelf, Wooden',
    description: 'Solid wood bookshelf, 5 shelves. Excellent condition.',
    price: 50.00,
    stock: 1,
    sellerId: 'user1',
    categoryId: 'home-garden',
    subCategoryId: 'sc_living_room',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'bookshelf furniture',
    status: 'pending',
    selectedAttributes: []
  },
  {
    id: 'prod4',
    name: 'Gitanjali by Tagore',
    description: 'Collection of poems by Rabindranath Tagore.',
    price: 15.00,
    stock: 10,
    sellerId: 'user2',
    categoryId: 'books',
    subCategoryId: 'sc_novels',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'book poetry',
    status: 'approved',
    selectedAttributes: [
      { attributeTypeId: 'attr_author', attributeValueId: 'val_author_tagore' },
      { attributeTypeId: 'attr_publication', attributeValueId: 'val_pub_anyaprokash' }
    ]
  },
  {
    id: 'prod5',
    name: 'Red Cotton T-Shirt',
    description: 'Comfortable red cotton t-shirt, size L.',
    price: 12.00,
    stock: 20,
    sellerId: 'user1',
    categoryId: 'fashion',
    subCategoryId: 'sc_mens_apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'red t-shirt',
    status: 'approved',
    selectedAttributes: [
      { attributeTypeId: 'attr_color', attributeValueId: 'val_color_red' },
      { attributeTypeId: 'attr_material', attributeValueId: 'val_material_cotton' }
    ]
  }
];

async function addSampleProducts() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    for (const product of sampleProducts) {
      // Insert product
      const productQuery = `
        INSERT IGNORE INTO products (id, name, description, price, stock, seller_id, category_id, sub_category_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.execute(productQuery, [
        product.id,
        product.name,
        product.description,
        product.price,
        product.stock,
        product.sellerId,
        product.categoryId,
        product.subCategoryId,
        product.status
      ]);

      // Insert product image
      const imageQuery = `
        INSERT IGNORE INTO product_images (product_id, image_url, image_hint, is_primary)
        VALUES (?, ?, ?, true)
      `;
      await connection.execute(imageQuery, [
        product.id,
        product.imageUrl,
        product.imageHint
      ]);

      // Insert selected attributes
      for (const attr of product.selectedAttributes) {
        const attrQuery = `
          INSERT IGNORE INTO product_selected_attributes (product_id, attribute_type_id, attribute_value_id)
          VALUES (?, ?, ?)
        `;
        await connection.execute(attrQuery, [
          product.id,
          attr.attributeTypeId,
          attr.attributeValueId
        ]);
      }

      console.log(`Added product: ${product.name}`);
    }

    console.log('Sample products added successfully!');
  } catch (error) {
    console.error('Error adding sample products:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addSampleProducts(); 