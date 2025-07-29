const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trustbuysell'
};

async function initSampleData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🚀 Initializing sample data...');

    // Add sample banners if hero_banner_slides table is empty
    const [banners] = await connection.execute('SELECT COUNT(*) as count FROM hero_banner_slides');
    if (banners[0].count === 0) {
      console.log('📸 Adding sample hero banners...');
      
      const sampleBanners = [
        {
          id: `banner-${Date.now()}-1`,
          image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
          image_hint: 'electronics shopping banner',
          title: 'Find Amazing Electronics',
          description: 'Discover top-quality electronics from trusted sellers',
          button_text: 'Shop Electronics',
          button_link: '/category/electronics',
          bg_color: '#1e40af',
          text_color: '#ffffff',
          is_active: 1,
          sort_order: 1
        },
        {
          id: `banner-${Date.now()}-2`,
          image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
          image_hint: 'books and education banner',
          title: 'Explore Books & Learning',
          description: 'Find your next great read from our collection',
          button_text: 'Browse Books',
          button_link: '/category/books',
          bg_color: '#059669',
          text_color: '#ffffff',
          is_active: 1,
          sort_order: 2
        }
      ];

      for (const banner of sampleBanners) {
        await connection.execute(
          `INSERT INTO hero_banner_slides (id, image_url, image_hint, title, description, button_text, button_link, bg_color, text_color, is_active, sort_order) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [banner.id, banner.image_url, banner.image_hint, banner.title, banner.description, banner.button_text, banner.button_link, banner.bg_color, banner.text_color, banner.is_active, banner.sort_order]
        );
      }
      console.log('✅ Sample banners added!');
    } else {
      console.log('📸 Hero banners already exist, skipping...');
    }

    // Ensure the is_featured_section column exists
    console.log('🔧 Checking database schema...');
    try {
      const [columns] = await connection.execute(
        'SHOW COLUMNS FROM category_attribute_types LIKE ?',
        ['is_featured_section']
      );
      
      if (columns.length === 0) {
        console.log('Adding is_featured_section column...');
        await connection.execute(
          'ALTER TABLE category_attribute_types ADD COLUMN is_featured_section BOOLEAN DEFAULT FALSE'
        );
        console.log('✅ is_featured_section column added!');
      } else {
        console.log('✅ is_featured_section column already exists.');
      }
    } catch (error) {
      console.error('Error checking/adding is_featured_section column:', error);
    }

    // Update some attribute types to be featured sections
    console.log('🎯 Setting up featured sections...');
    const [attributeTypes] = await connection.execute(
      'SELECT id, name FROM category_attribute_types WHERE name IN (?, ?, ?)',
      ['Author', 'Brand', 'Writer']
    );

    for (const attr of attributeTypes) {
      await connection.execute(
        'UPDATE category_attribute_types SET is_featured_section = TRUE WHERE id = ?',
        [attr.id]
      );
      console.log(`✅ Set ${attr.name} as featured section`);
    }

    console.log('🎉 Sample data initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  initSampleData().catch(console.error);
}

module.exports = { initSampleData }; 