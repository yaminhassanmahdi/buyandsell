const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell',
  multipleStatements: true
};

async function testCheckoutDeliveryCharge() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Check current delivery charge settings
    const [deliverySettings] = await connection.execute('SELECT * FROM delivery_charge_settings LIMIT 1');
    console.log('Current delivery charge settings:', deliverySettings[0]);

    // Get test user (testuser1) and their address
    const [testUser] = await connection.execute('SELECT * FROM users WHERE id = ?', ['testuser1']);
    console.log('Test User:', testUser[0]);

    // Get test user's shipping address
    const [userAddress] = await connection.execute('SELECT * FROM shipping_addresses WHERE user_id = ? AND is_default = 1', ['testuser1']);
    console.log('User Address:', userAddress[0]);

    // Get seller (user2) and their address
    const [seller] = await connection.execute('SELECT * FROM users WHERE id = ?', ['user2']);
    console.log('Seller:', seller[0]);

    // Get seller's shipping address
    const [sellerAddress] = await connection.execute('SELECT * FROM shipping_addresses WHERE user_id = ? AND is_default = 1', ['user2']);
    console.log('Seller Address:', sellerAddress[0]);

    // Get products from seller
    const [products] = await connection.execute('SELECT * FROM products WHERE seller_id = ? LIMIT 3', ['user2']);
    console.log('Seller Products:', products);

    // Test delivery charge calculation
    if (userAddress[0] && sellerAddress[0]) {
      console.log('\n=== Testing Delivery Charge Calculation ===');
      
      const buyerAddress = {
        division: userAddress[0].division,
        district: userAddress[0].district,
        upazilla: userAddress[0].upazilla
      };
      
      const sellerAddressData = {
        division: sellerAddress[0].division,
        district: sellerAddress[0].district,
        upazilla: sellerAddress[0].upazilla
      };
      
      console.log('Buyer Address:', buyerAddress);
      console.log('Seller Address:', sellerAddressData);
      
      // Test the calculation logic
      const normalizeField = (field) => {
        return (field || '').toString().trim().toLowerCase();
      };

      const buyerUpazilla = normalizeField(buyerAddress.upazilla);
      const sellerUpazilla = normalizeField(sellerAddressData.upazilla);
      const buyerDistrict = normalizeField(buyerAddress.district);
      const sellerDistrict = normalizeField(sellerAddressData.district);
      const buyerDivision = normalizeField(buyerAddress.division);
      const sellerDivision = normalizeField(sellerAddressData.division);

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

      // Test with different scenarios
      console.log('\n=== Testing Different Scenarios ===');
      
      // Scenario 1: Same upazilla, same district
      console.log('Scenario 1: Same upazilla, same district');
      if (buyerUpazilla && sellerUpazilla && buyerUpazilla === sellerUpazilla && buyerDistrict === sellerDistrict) {
        console.log('✓ Should charge:', deliverySettings[0].intra_thana_charge, 'Taka');
      } else {
        console.log('✗ Not same upazilla and district');
      }
      
      // Scenario 2: Same district, different upazilla
      console.log('Scenario 2: Same district, different upazilla');
      if (buyerDistrict && sellerDistrict && buyerDistrict === sellerDistrict && buyerUpazilla !== sellerUpazilla) {
        console.log('✓ Should charge:', deliverySettings[0].intra_district_charge, 'Taka');
      } else {
        console.log('✗ Not same district, different upazilla');
      }
      
      // Scenario 3: Different districts
      console.log('Scenario 3: Different districts');
      if (buyerDistrict && sellerDistrict && buyerDistrict !== sellerDistrict) {
        console.log('✓ Should charge:', deliverySettings[0].inter_district_charge, 'Taka');
      } else {
        console.log('✗ Not different districts');
      }
    }

  } catch (error) {
    console.error('Error testing checkout delivery charge:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testCheckoutDeliveryCharge(); 