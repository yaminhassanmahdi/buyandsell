const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell',
  multipleStatements: true
};

async function populateBangladeshLocations() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Create tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS divisions (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS districts (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        division_id VARCHAR(32) NOT NULL,
        FOREIGN KEY (division_id) REFERENCES divisions(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS upazillas (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        district_id VARCHAR(32) NOT NULL,
        FOREIGN KEY (district_id) REFERENCES districts(id)
      )
    `);

    console.log('Tables created successfully');

    // Clear existing data
    await connection.execute('DELETE FROM upazillas');
    await connection.execute('DELETE FROM districts');
    await connection.execute('DELETE FROM divisions');
    console.log('Cleared existing data');

    // Insert Divisions
    const divisions = [
      { id: 'dhaka', name: 'Dhaka' },
      { id: 'chittagong', name: 'Chittagong' },
      { id: 'rajshahi', name: 'Rajshahi' },
      { id: 'khulna', name: 'Khulna' },
      { id: 'barisal', name: 'Barisal' },
      { id: 'sylhet', name: 'Sylhet' },
      { id: 'rangpur', name: 'Rangpur' },
      { id: 'mymensingh', name: 'Mymensingh' }
    ];

    for (const division of divisions) {
      await connection.execute(
        'INSERT INTO divisions (id, name) VALUES (?, ?)',
        [division.id, division.name]
      );
    }
    console.log('Divisions inserted:', divisions.length);

    // Insert Districts
    const districts = [
      // Dhaka Division
      { id: 'dhaka', name: 'Dhaka', division_id: 'dhaka' },
      { id: 'gazipur', name: 'Gazipur', division_id: 'dhaka' },
      { id: 'narayanganj', name: 'Narayanganj', division_id: 'dhaka' },
      { id: 'tangail', name: 'Tangail', division_id: 'dhaka' },
      { id: 'kishoreganj', name: 'Kishoreganj', division_id: 'dhaka' },
      { id: 'manikganj', name: 'Manikganj', division_id: 'dhaka' },
      { id: 'munshiganj', name: 'Munshiganj', division_id: 'dhaka' },
      { id: 'rajbari', name: 'Rajbari', division_id: 'dhaka' },
      { id: 'madaripur', name: 'Madaripur', division_id: 'dhaka' },
      { id: 'gopalganj', name: 'Gopalganj', division_id: 'dhaka' },
      { id: 'faridpur', name: 'Faridpur', division_id: 'dhaka' },
      { id: 'shariatpur', name: 'Shariatpur', division_id: 'dhaka' },
      { id: 'narsingdi', name: 'Narsingdi', division_id: 'dhaka' },

      // Chittagong Division
      { id: 'chittagong', name: 'Chittagong', division_id: 'chittagong' },
      { id: 'coxs_bazar', name: "Cox's Bazar", division_id: 'chittagong' },
      { id: 'comilla', name: 'Comilla', division_id: 'chittagong' },
      { id: 'feni', name: 'Feni', division_id: 'chittagong' },
      { id: 'lakshmipur', name: 'Lakshmipur', division_id: 'chittagong' },
      { id: 'noakhali', name: 'Noakhali', division_id: 'chittagong' },
      { id: 'chandpur', name: 'Chandpur', division_id: 'chittagong' },
      { id: 'bandarban', name: 'Bandarban', division_id: 'chittagong' },
      { id: 'rangamati', name: 'Rangamati', division_id: 'chittagong' },
      { id: 'khagrachari', name: 'Khagrachari', division_id: 'chittagong' },
      { id: 'brahmanbaria', name: 'Brahmanbaria', division_id: 'chittagong' },

      // Rajshahi Division
      { id: 'rajshahi', name: 'Rajshahi', division_id: 'rajshahi' },
      { id: 'natore', name: 'Natore', division_id: 'rajshahi' },
      { id: 'naogaon', name: 'Naogaon', division_id: 'rajshahi' },
      { id: 'chapainawabganj', name: 'Chapainawabganj', division_id: 'rajshahi' },
      { id: 'pabna', name: 'Pabna', division_id: 'rajshahi' },
      { id: 'bogura', name: 'Bogura', division_id: 'rajshahi' },
      { id: 'sirajganj', name: 'Sirajganj', division_id: 'rajshahi' },
      { id: 'joypurhat', name: 'Joypurhat', division_id: 'rajshahi' },

      // Khulna Division
      { id: 'khulna', name: 'Khulna', division_id: 'khulna' },
      { id: 'bagerhat', name: 'Bagerhat', division_id: 'khulna' },
      { id: 'satkhira', name: 'Satkhira', division_id: 'khulna' },
      { id: 'jessore', name: 'Jessore', division_id: 'khulna' },
      { id: 'magura', name: 'Magura', division_id: 'khulna' },
      { id: 'jhenaidah', name: 'Jhenaidah', division_id: 'khulna' },
      { id: 'kushtia', name: 'Kushtia', division_id: 'khulna' },
      { id: 'meherpur', name: 'Meherpur', division_id: 'khulna' },
      { id: 'chuadanga', name: 'Chuadanga', division_id: 'khulna' },
      { id: 'narail', name: 'Narail', division_id: 'khulna' },

      // Barisal Division
      { id: 'barisal', name: 'Barisal', division_id: 'barisal' },
      { id: 'bhola', name: 'Bhola', division_id: 'barisal' },
      { id: 'patuakhali', name: 'Patuakhali', division_id: 'barisal' },
      { id: 'pirojpur', name: 'Pirojpur', division_id: 'barisal' },
      { id: 'barguna', name: 'Barguna', division_id: 'barisal' },
      { id: 'jhalokati', name: 'Jhalokati', division_id: 'barisal' },

      // Sylhet Division
      { id: 'sylhet', name: 'Sylhet', division_id: 'sylhet' },
      { id: 'moulvibazar', name: 'Moulvibazar', division_id: 'sylhet' },
      { id: 'habiganj', name: 'Habiganj', division_id: 'sylhet' },
      { id: 'sunamganj', name: 'Sunamganj', division_id: 'sylhet' },

      // Rangpur Division
      { id: 'rangpur', name: 'Rangpur', division_id: 'rangpur' },
      { id: 'dinajpur', name: 'Dinajpur', division_id: 'rangpur' },
      { id: 'kurigram', name: 'Kurigram', division_id: 'rangpur' },
      { id: 'gaibandha', name: 'Gaibandha', division_id: 'rangpur' },
      { id: 'nilphamari', name: 'Nilphamari', division_id: 'rangpur' },
      { id: 'panchagarh', name: 'Panchagarh', division_id: 'rangpur' },
      { id: 'thakurgaon', name: 'Thakurgaon', division_id: 'rangpur' },
      { id: 'lalmonirhat', name: 'Lalmonirhat', division_id: 'rangpur' },

      // Mymensingh Division
      { id: 'mymensingh', name: 'Mymensingh', division_id: 'mymensingh' },
      { id: 'jamalpur', name: 'Jamalpur', division_id: 'mymensingh' },
      { id: 'netrokona', name: 'Netrokona', division_id: 'mymensingh' },
      { id: 'sherpur', name: 'Sherpur', division_id: 'mymensingh' }
    ];

    for (const district of districts) {
      await connection.execute(
        'INSERT INTO districts (id, name, division_id) VALUES (?, ?, ?)',
        [district.id, district.name, district.division_id]
      );
    }
    console.log('Districts inserted:', districts.length);

    // Insert Upazillas (major ones for each district)
    const upazillas = [
      // Dhaka District
      { id: 'dhaka_sadar', name: 'Dhaka Sadar', district_id: 'dhaka' },
      { id: 'dhanmondi', name: 'Dhanmondi', district_id: 'dhaka' },
      { id: 'gulshan', name: 'Gulshan', district_id: 'dhaka' },
      { id: 'mirpur', name: 'Mirpur', district_id: 'dhaka' },
      { id: 'mohammadpur', name: 'Mohammadpur', district_id: 'dhaka' },
      { id: 'uttara', name: 'Uttara', district_id: 'dhaka' },
      { id: 'tejgaon', name: 'Tejgaon', district_id: 'dhaka' },
      { id: 'rampura', name: 'Rampura', district_id: 'dhaka' },
      { id: 'banani', name: 'Banani', district_id: 'dhaka' },
      { id: 'baridhara', name: 'Baridhara', district_id: 'dhaka' },
      { id: 'savar', name: 'Savar', district_id: 'dhaka' },
      { id: 'keraniganj', name: 'Keraniganj', district_id: 'dhaka' },
      { id: 'dhamrai', name: 'Dhamrai', district_id: 'dhaka' },
      { id: 'dohar', name: 'Dohar', district_id: 'dhaka' },
      { id: 'nawabganj_dhaka', name: 'Nawabganj', district_id: 'dhaka' },

      // Gazipur District
      { id: 'gazipur_sadar', name: 'Gazipur Sadar', district_id: 'gazipur' },
      { id: 'kaliakair', name: 'Kaliakair', district_id: 'gazipur' },
      { id: 'kapasia', name: 'Kapasia', district_id: 'gazipur' },
      { id: 'sreepur_gazipur', name: 'Sreepur', district_id: 'gazipur' },
      { id: 'kaliganj_gazipur', name: 'Kaliganj', district_id: 'gazipur' },

      // Narayanganj District
      { id: 'narayanganj_sadar', name: 'Narayanganj Sadar', district_id: 'narayanganj' },
      { id: 'bandar', name: 'Bandar', district_id: 'narayanganj' },
      { id: 'rupganj', name: 'Rupganj', district_id: 'narayanganj' },
      { id: 'sonargaon', name: 'Sonargaon', district_id: 'narayanganj' },
      { id: 'araihazar', name: 'Araihazar', district_id: 'narayanganj' },

      // Tangail District
      { id: 'tangail_sadar', name: 'Tangail Sadar', district_id: 'tangail' },
      { id: 'basail', name: 'Basail', district_id: 'tangail' },
      { id: 'bhuapur', name: 'Bhuapur', district_id: 'tangail' },
      { id: 'delduar', name: 'Delduar', district_id: 'tangail' },
      { id: 'ghatail', name: 'Ghatail', district_id: 'tangail' },
      { id: 'gopalpur', name: 'Gopalpur', district_id: 'tangail' },
      { id: 'kalihati', name: 'Kalihati', district_id: 'tangail' },
      { id: 'madhupur', name: 'Madhupur', district_id: 'tangail' },
      { id: 'mirzapur', name: 'Mirzapur', district_id: 'tangail' },
      { id: 'nagarpur', name: 'Nagarpur', district_id: 'tangail' },
      { id: 'sakhipur', name: 'Sakhipur', district_id: 'tangail' },
      { id: 'dhanbari', name: 'Dhanbari', district_id: 'tangail' },

      // Chittagong District
      { id: 'chittagong_sadar', name: 'Chittagong Sadar', district_id: 'chittagong' },
      { id: 'anwara', name: 'Anwara', district_id: 'chittagong' },
      { id: 'banshkhali', name: 'Banshkhali', district_id: 'chittagong' },
      { id: 'boalkhali', name: 'Boalkhali', district_id: 'chittagong' },
      { id: 'chandanaish', name: 'Chandanaish', district_id: 'chittagong' },
      { id: 'fatikchhari', name: 'Fatikchhari', district_id: 'chittagong' },
      { id: 'hathazari', name: 'Hathazari', district_id: 'chittagong' },
      { id: 'lohagara', name: 'Lohagara', district_id: 'chittagong' },
      { id: 'mirsharai', name: 'Mirsharai', district_id: 'chittagong' },
      { id: 'patiya', name: 'Patiya', district_id: 'chittagong' },
      { id: 'rangunia', name: 'Rangunia', district_id: 'chittagong' },
      { id: 'sandwip', name: 'Sandwip', district_id: 'chittagong' },
      { id: 'satkania', name: 'Satkania', district_id: 'chittagong' },
      { id: 'sitakunda', name: 'Sitakunda', district_id: 'chittagong' },

      // Cox's Bazar District
      { id: 'coxs_bazar_sadar', name: "Cox's Bazar Sadar", district_id: 'coxs_bazar' },
      { id: 'chakaria', name: 'Chakaria', district_id: 'coxs_bazar' },
      { id: 'kutubdia', name: 'Kutubdia', district_id: 'coxs_bazar' },
      { id: 'maheshkhali', name: 'Maheshkhali', district_id: 'coxs_bazar' },
      { id: 'pekua', name: 'Pekua', district_id: 'coxs_bazar' },
      { id: 'ramu', name: 'Ramu', district_id: 'coxs_bazar' },
      { id: 'teknaf', name: 'Teknaf', district_id: 'coxs_bazar' },
      { id: 'ukhiya', name: 'Ukhia', district_id: 'coxs_bazar' },

      // Comilla District
      { id: 'comilla_sadar', name: 'Comilla Sadar', district_id: 'comilla' },
      { id: 'barura', name: 'Barura', district_id: 'comilla' },
      { id: 'brahmanpara', name: 'Brahmanpara', district_id: 'comilla' },
      { id: 'burichang', name: 'Burichang', district_id: 'comilla' },
      { id: 'chandina', name: 'Chandina', district_id: 'comilla' },
      { id: 'chauddagram', name: 'Chauddagram', district_id: 'comilla' },
      { id: 'daudkandi', name: 'Daudkandi', district_id: 'comilla' },
      { id: 'debidwar', name: 'Debidwar', district_id: 'comilla' },
      { id: 'homna', name: 'Homna', district_id: 'comilla' },
      { id: 'laksam', name: 'Laksam', district_id: 'comilla' },
      { id: 'lalmai', name: 'Lalmai', district_id: 'comilla' },
      { id: 'monoharganj', name: 'Monoharganj', district_id: 'comilla' },
      { id: 'meghna', name: 'Meghna', district_id: 'comilla' },
      { id: 'muradnagar', name: 'Muradnagar', district_id: 'comilla' },
      { id: 'nangalkot', name: 'Nangalkot', district_id: 'comilla' },
      { id: 'titas', name: 'Titas', district_id: 'comilla' },

      // Sylhet District
      { id: 'sylhet_sadar', name: 'Sylhet Sadar', district_id: 'sylhet' },
      { id: 'balaganj', name: 'Balaganj', district_id: 'sylhet' },
      { id: 'beanibazar', name: 'Beanibazar', district_id: 'sylhet' },
      { id: 'bishwanath', name: 'Bishwanath', district_id: 'sylhet' },
      { id: 'companiganj_sylhet', name: 'Companiganj', district_id: 'sylhet' },
      { id: 'fenchuganj', name: 'Fenchuganj', district_id: 'sylhet' },
      { id: 'golapganj', name: 'Golapganj', district_id: 'sylhet' },
      { id: 'gowainghat', name: 'Gowainghat', district_id: 'sylhet' },
      { id: 'jaintiapur', name: 'Jaintiapur', district_id: 'sylhet' },
      { id: 'kanaighat', name: 'Kanaighat', district_id: 'sylhet' },
      { id: 'osmani_nagar', name: 'Osmani Nagar', district_id: 'sylhet' },
      { id: 'south_surma', name: 'South Surma', district_id: 'sylhet' },
      { id: 'zakiganj', name: 'Zakiganj', district_id: 'sylhet' },

      // Rajshahi District
      { id: 'rajshahi_sadar', name: 'Rajshahi Sadar', district_id: 'rajshahi' },
      { id: 'bagha', name: 'Bagha', district_id: 'rajshahi' },
      { id: 'bagmara', name: 'Bagmara', district_id: 'rajshahi' },
      { id: 'charghat', name: 'Charghat', district_id: 'rajshahi' },
      { id: 'durgapur_rajshahi', name: 'Durgapur', district_id: 'rajshahi' },
      { id: 'godagari', name: 'Godagari', district_id: 'rajshahi' },
      { id: 'mohanpur', name: 'Mohanpur', district_id: 'rajshahi' },
      { id: 'paba', name: 'Paba', district_id: 'rajshahi' },
      { id: 'puthia', name: 'Puthia', district_id: 'rajshahi' },
      { id: 'tanore', name: 'Tanore', district_id: 'rajshahi' },

      // Khulna District
      { id: 'khulna_sadar', name: 'Khulna Sadar', district_id: 'khulna' },
      { id: 'batiaghata', name: 'Batiaghata', district_id: 'khulna' },
      { id: 'dacope', name: 'Dacope', district_id: 'khulna' },
      { id: 'dumuria', name: 'Dumuria', district_id: 'khulna' },
      { id: 'fultala', name: 'Fultala', district_id: 'khulna' },
      { id: 'koyra', name: 'Koyra', district_id: 'khulna' },
      { id: 'paikgacha', name: 'Paikgacha', district_id: 'khulna' },
      { id: 'phultala', name: 'Phultala', district_id: 'khulna' },
      { id: 'rupsa', name: 'Rupsa', district_id: 'khulna' },
      { id: 'terokhada', name: 'Terokhada', district_id: 'khulna' },

      // Barisal District
      { id: 'barisal_sadar', name: 'Barisal Sadar', district_id: 'barisal' },
      { id: 'agailjhara', name: 'Agailjhara', district_id: 'barisal' },
      { id: 'babuganj', name: 'Babuganj', district_id: 'barisal' },
      { id: 'bakerganj', name: 'Bakerganj', district_id: 'barisal' },
      { id: 'banaripara', name: 'Banaripara', district_id: 'barisal' },
      { id: 'gaurnadi', name: 'Gaurnadi', district_id: 'barisal' },
      { id: 'hizla', name: 'Hizla', district_id: 'barisal' },
      { id: 'mehendiganj', name: 'Mehendiganj', district_id: 'barisal' },
      { id: 'muladi', name: 'Muladi', district_id: 'barisal' },
      { id: 'wazirpur', name: 'Wazirpur', district_id: 'barisal' },

      // Rangpur District
      { id: 'rangpur_sadar', name: 'Rangpur Sadar', district_id: 'rangpur' },
      { id: 'badarganj', name: 'Badarganj', district_id: 'rangpur' },
      { id: 'gangachara', name: 'Gangachara', district_id: 'rangpur' },
      { id: 'kaunia', name: 'Kaunia', district_id: 'rangpur' },
      { id: 'mithapukur', name: 'Mithapukur', district_id: 'rangpur' },
      { id: 'pirgachha', name: 'Pirgachha', district_id: 'rangpur' },
      { id: 'pirganj', name: 'Pirganj', district_id: 'rangpur' },
      { id: 'taraganj', name: 'Taraganj', district_id: 'rangpur' },

      // Mymensingh District
      { id: 'mymensingh_sadar', name: 'Mymensingh Sadar', district_id: 'mymensingh' },
      { id: 'bhaluka', name: 'Bhaluka', district_id: 'mymensingh' },
      { id: 'dhobaura', name: 'Dhobaura', district_id: 'mymensingh' },
      { id: 'fulbaria', name: 'Fulbaria', district_id: 'mymensingh' },
      { id: 'gaffargaon', name: 'Gaffargaon', district_id: 'mymensingh' },
      { id: 'gauripur', name: 'Gauripur', district_id: 'mymensingh' },
      { id: 'haluaghat', name: 'Haluaghat', district_id: 'mymensingh' },
      { id: 'ishwarganj', name: 'Ishwarganj', district_id: 'mymensingh' },
      { id: 'muktagacha', name: 'Muktagacha', district_id: 'mymensingh' },
      { id: 'nandail', name: 'Nandail', district_id: 'mymensingh' },
      { id: 'phulpur', name: 'Phulpur', district_id: 'mymensingh' },
      { id: 'trishal', name: 'Trishal', district_id: 'mymensingh' }
    ];

    for (const upazilla of upazillas) {
      await connection.execute(
        'INSERT INTO upazillas (id, name, district_id) VALUES (?, ?, ?)',
        [upazilla.id, upazilla.name, upazilla.district_id]
      );
    }
    console.log('Upazillas inserted:', upazillas.length);

    console.log('Bangladesh location data populated successfully!');

  } catch (error) {
    console.error('Error populating Bangladesh locations:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

populateBangladeshLocations(); 