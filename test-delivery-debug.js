const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trustbuysell',
  multipleStatements: true
};

async function testDeliveryCharge() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Check current delivery charge settings
    const [deliverySettings] = await connection.execute('SELECT * FROM delivery_charge_settings LIMIT 1');
    console.log('Current delivery charge settings:', deliverySettings[0]);

    // Check sample shipping addresses with upazilla field
    const [addresses] = await connection.execute('SELECT * FROM shipping_addresses LIMIT 5');
    console.log('Sample shipping addresses:', addresses);

    // Check sample products with seller info
    const [products] = await connection.execute(`
      SELECT p.*, u.name as seller_name, sa.division as seller_division, sa.district as seller_district, sa.upazilla as seller_upazilla
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      LEFT JOIN shipping_addresses sa ON u.id = sa.user_id AND sa.is_default = 1
      LIMIT 3
    `);
    console.log('Sample products with seller addresses:', products);

    // Test delivery charge calculation with sample data
    if (addresses.length > 0 && products.length > 0) {
      const buyerAddress = addresses[0];
      const sellerAddress = {
        division: products[0].seller_division,
        district: products[0].seller_district,
        upazilla: products[0].seller_upazilla
      };
      
      console.log('\n=== Testing Delivery Charge Calculation ===');
      console.log('Buyer Address:', {
        division: buyerAddress.division,
        district: buyerAddress.district,
        upazilla: buyerAddress.upazilla
      });
      console.log('Seller Address:', sellerAddress);
      
      // Test the calculation logic
      const normalizeField = (field) => {
        return (field || '').toString().trim().toLowerCase();
      };

      const buyerUpazilla = normalizeField(buyerAddress.upazilla);
      const sellerUpazilla = normalizeField(sellerAddress.upazilla);
      const buyerDistrict = normalizeField(buyerAddress.district);
      const sellerDistrict = normalizeField(sellerAddress.district);
      const buyerDivision = normalizeField(buyerAddress.division);
      const sellerDivision = normalizeField(sellerAddress.division);

      console.log('\nNormalized values:');
      console.log('Buyer - Upazilla:', buyerUpazilla, 'District:', buyerDistrict, 'Division:', buyerDivision);
      console.log('Seller - Upazilla:', sellerUpazilla, 'District:', sellerDistrict, 'Division:', sellerDivision);

      // Check if buyer and seller are in the same upazilla and district
      if (buyerUpazilla && sellerUpazilla && buyerUpazilla === sellerUpazilla && buyerDistrict === sellerDistrict) {
        console.log('Result: Same upazilla and district - Intra-upazilla charge:', deliverySettings[0].intra_thana_charge);
      } else if (buyerDistrict && sellerDistrict && buyerDistrict === sellerDistrict) {
        console.log('Result: Same district, different upazillas - Intra-district charge:', deliverySettings[0].intra_district_charge);
      } else {
        console.log('Result: Different districts - Inter-district charge:', deliverySettings[0].inter_district_charge);
      }

      // Test case 2: Different upazillas in same district
      console.log('\n=== Test Case 2: Different Upazillas in Same District ===');
      const buyerAddress2 = {
        division: 'Dhaka',
        district: 'Dhaka',
        upazilla: 'Dhanmondi'
      };
      const sellerAddress2 = {
        division: 'Dhaka',
        district: 'Dhaka',
        upazilla: 'Gulshan'
      };
      
      console.log('Buyer Address:', buyerAddress2);
      console.log('Seller Address:', sellerAddress2);
      
      const buyerUpazilla2 = normalizeField(buyerAddress2.upazilla);
      const sellerUpazilla2 = normalizeField(sellerAddress2.upazilla);
      const buyerDistrict2 = normalizeField(buyerAddress2.district);
      const sellerDistrict2 = normalizeField(sellerAddress2.district);

      console.log('Normalized values:');
      console.log('Buyer - Upazilla:', buyerUpazilla2, 'District:', buyerDistrict2);
      console.log('Seller - Upazilla:', sellerUpazilla2, 'District:', sellerDistrict2);

      if (buyerUpazilla2 && sellerUpazilla2 && buyerUpazilla2 === sellerUpazilla2 && buyerDistrict2 === sellerDistrict2) {
        console.log('Result: Same upazilla and district - Intra-upazilla charge:', deliverySettings[0].intra_thana_charge);
      } else if (buyerDistrict2 && sellerDistrict2 && buyerDistrict2 === sellerDistrict2) {
        console.log('Result: Same district, different upazillas - Intra-district charge:', deliverySettings[0].intra_district_charge);
      } else {
        console.log('Result: Different districts - Inter-district charge:', deliverySettings[0].inter_district_charge);
      }

      // Test case 3: Different districts
      console.log('\n=== Test Case 3: Different Districts ===');
      const buyerAddress3 = {
        division: 'Dhaka',
        district: 'Dhaka',
        upazilla: 'Dhanmondi'
      };
      const sellerAddress3 = {
        division: 'Dhaka',
        district: 'Gazipur',
        upazilla: 'Gazipur Sadar'
      };
      
      console.log('Buyer Address:', buyerAddress3);
      console.log('Seller Address:', sellerAddress3);
      
      const buyerUpazilla3 = normalizeField(buyerAddress3.upazilla);
      const sellerUpazilla3 = normalizeField(sellerAddress3.upazilla);
      const buyerDistrict3 = normalizeField(buyerAddress3.district);
      const sellerDistrict3 = normalizeField(sellerAddress3.district);

      console.log('Normalized values:');
      console.log('Buyer - Upazilla:', buyerUpazilla3, 'District:', buyerDistrict3);
      console.log('Seller - Upazilla:', sellerUpazilla3, 'District:', sellerDistrict3);

      if (buyerUpazilla3 && sellerUpazilla3 && buyerUpazilla3 === sellerUpazilla3 && buyerDistrict3 === sellerDistrict3) {
        console.log('Result: Same upazilla and district - Intra-upazilla charge:', deliverySettings[0].intra_thana_charge);
      } else if (buyerDistrict3 && sellerDistrict3 && buyerDistrict3 === sellerDistrict3) {
        console.log('Result: Same district, different upazillas - Intra-district charge:', deliverySettings[0].intra_district_charge);
      } else {
        console.log('Result: Different districts - Inter-district charge:', deliverySettings[0].inter_district_charge);
      }
    }

  } catch (error) {
    console.error('Error testing delivery charge:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDeliveryCharge(); 