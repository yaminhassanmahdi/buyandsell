const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell',
  multipleStatements: true
};

async function populateUpazillas() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // First, let's check what districts we have
    const districts = await connection.execute('SELECT * FROM districts');
    console.log('Existing districts:', districts.length);

    // Define upazillas for each district
    const upazillaData = [
      // Dhaka Division
      { districtId: 'dhaka_dist', upazillas: [
        'Dhanmondi', 'Gulshan', 'Banani', 'Baridhara', 'Uttara', 'Mirpur', 'Mohammadpur', 
        'Lalbagh', 'Kotwali', 'Ramna', 'Sutrapur', 'Wari', 'Sabujbagh', 'Demra', 
        'Hazaribagh', 'Shyampur', 'Badda', 'Tejgaon', 'Cantonment', 'Pallabi'
      ]},
      { districtId: 'gazipur', upazillas: [
        'Gazipur Sadar', 'Kaliakair', 'Kapasia', 'Sreepur', 'Kaliganj'
      ]},
      { districtId: 'narayanganj', upazillas: [
        'Narayanganj Sadar', 'Araihazar', 'Bandar', 'Rupganj', 'Sonargaon'
      ]},
      { districtId: 'tangail', upazillas: [
        'Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Dhanbari'
      ]},
      { districtId: 'kishoreganj', upazillas: [
        'Kishoreganj Sadar', 'Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'
      ]},
      { districtId: 'manikganj', upazillas: [
        'Manikganj Sadar', 'Daulatpur', 'Ghior', 'Harirampur', 'Saturia', 'Shibalaya', 'Singair'
      ]},
      { districtId: 'munshiganj', upazillas: [
        'Munshiganj Sadar', 'Gazaria', 'Lohajang', 'Sirajdikhan', 'Sreenagar', 'Tongibari'
      ]},
      { districtId: 'rajbari', upazillas: [
        'Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali'
      ]},
      { districtId: 'madaripur', upazillas: [
        'Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar'
      ]},
      { districtId: 'gopalganj', upazillas: [
        'Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'
      ]},
      { districtId: 'faridpur', upazillas: [
        'Faridpur Sadar', 'Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'
      ]},
      { districtId: 'shariatpur', upazillas: [
        'Shariatpur Sadar', 'Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Zanjira'
      ]},

      // Chittagong Division
      { districtId: 'chittagong_dist', upazillas: [
        'Chittagong Sadar', 'Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Sandwip', 'Satkania', 'Sitakunda'
      ]},
      { districtId: 'coxs_bazar', upazillas: [
        'Cox\'s Bazar Sadar', 'Chakaria', 'Kutubdia', 'Maheshkhali', 'Pekua', 'Ramu', 'Teknaf', 'Ukhia'
      ]},
      { districtId: 'comilla', upazillas: [
        'Comilla Sadar', 'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Lalmai', 'Monoharganj', 'Meghna', 'Muradnagar', 'Nangalkot', 'Comilla Adarsha Sadar', 'Titas'
      ]},
      { districtId: 'feni', upazillas: [
        'Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Sonagazi', 'Fulgazi'
      ]},
      { districtId: 'lakshmipur', upazillas: [
        'Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'
      ]},
      { districtId: 'noakhali', upazillas: [
        'Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat'
      ]},
      { districtId: 'chandpur', upazillas: [
        'Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'
      ]},
      { districtId: 'bandarban', upazillas: [
        'Bandarban Sadar', 'Alikadam', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'
      ]},
      { districtId: 'rangamati', upazillas: [
        'Rangamati Sadar', 'Bagaichhari', 'Barkal', 'Juraichhari', 'Kaptai', 'Langadu', 'Naniarchar', 'Rajasthali'
      ]},
      { districtId: 'khagrachari', upazillas: [
        'Khagrachari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh'
      ]},

      // Sylhet Division
      { districtId: 'sylhet_dist', upazillas: [
        'Sylhet Sadar', 'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Dakshin Surma', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Osmani Nagar', 'South Surma', 'Zakiganj'
      ]},
      { districtId: 'moulvibazar', upazillas: [
        'Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal'
      ]},
      { districtId: 'habiganj', upazillas: [
        'Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj'
      ]},
      { districtId: 'sunamganj', upazillas: [
        'Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Tahirpur'
      ]},

      // Rajshahi Division
      { districtId: 'rajshahi_dist', upazillas: [
        'Rajshahi Sadar', 'Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore'
      ]},
      { districtId: 'natore', upazillas: [
        'Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Singra'
      ]},
      { districtId: 'naogaon', upazillas: [
        'Naogaon Sadar', 'Atrai', 'Badalgachi', 'Dhamoirhat', 'Manda', 'Mohadevpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'
      ]},
      { districtId: 'chapainawabganj', upazillas: [
        'Chapainawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'
      ]},
      { districtId: 'pabna', upazillas: [
        'Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'
      ]},
      { districtId: 'bogura', upazillas: [
        'Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shabganj', 'Sherpur', 'Shibganj', 'Sonatala'
      ]},
      { districtId: 'sirajganj', upazillas: [
        'Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Dhangora', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara'
      ]},
      { districtId: 'joypurhat', upazillas: [
        'Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'
      ]},

      // Khulna Division
      { districtId: 'khulna_dist', upazillas: [
        'Khulna Sadar', 'Batiaghata', 'Dacope', 'Dumuria', 'Fultala', 'Koyra', 'Paikgacha', 'Phultala', 'Rupsa', 'Terokhada'
      ]},
      { districtId: 'bagerhat', upazillas: [
        'Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'
      ]},
      { districtId: 'satkhira', upazillas: [
        'Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'
      ]},
      { districtId: 'jessore', upazillas: [
        'Jessore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargacha', 'Keshabpur', 'Manirampur', 'Sharsha'
      ]},
      { districtId: 'magura', upazillas: [
        'Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'
      ]},
      { districtId: 'jhenaidah', upazillas: [
        'Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'
      ]},
      { districtId: 'kushtia', upazillas: [
        'Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Mirpur'
      ]},
      { districtId: 'meherpur', upazillas: [
        'Meherpur Sadar', 'Gangni', 'Mujibnagar'
      ]},
      { districtId: 'chuadanga', upazillas: [
        'Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'
      ]},

      // Barisal Division
      { districtId: 'barisal_dist', upazillas: [
        'Barisal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'
      ]},
      { districtId: 'bhola', upazillas: [
        'Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'
      ]},
      { districtId: 'patuakhali', upazillas: [
        'Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Dumki', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Rangabali'
      ]},
      { districtId: 'pirojpur', upazillas: [
        'Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad', 'Zianagar'
      ]},
      { districtId: 'barguna', upazillas: [
        'Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'
      ]},
      { districtId: 'jhalokati', upazillas: [
        'Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'
      ]},

      // Rangpur Division
      { districtId: 'rangpur_dist', upazillas: [
        'Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'
      ]},
      { districtId: 'dinajpur', upazillas: [
        'Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Fulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khirbet', 'Kushmandi', 'Nawabganj', 'Parbatipur'
      ]},
      { districtId: 'kurigram', upazillas: [
        'Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Phulbari', 'Rajarhat', 'Raumari', 'Ulipur'
      ]},
      { districtId: 'gaibandha', upazillas: [
        'Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj'
      ]},
      { districtId: 'nilphamari', upazillas: [
        'Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Saidpur'
      ]},
      { districtId: 'panchagarh', upazillas: [
        'Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'
      ]},
      { districtId: 'thakurgaon', upazillas: [
        'Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail'
      ]},
      { districtId: 'lalmonirhat', upazillas: [
        'Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'
      ]},

      // Mymensingh Division
      { districtId: 'mymensingh_dist', upazillas: [
        'Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagacha', 'Nandail', 'Phulpur', 'Trishal'
      ]},
      { districtId: 'jamalpur', upazillas: [
        'Jamalpur Sadar', 'Bakshiganj', 'Dewanganj', 'Islampur', 'Madarganj', 'Melandaha', 'Sarishabari'
      ]},
      { districtId: 'netrokona', upazillas: [
        'Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendua', 'Madan', 'Mohongonj', 'Purbadhala'
      ]},
      { districtId: 'sherpur', upazillas: [
        'Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'
      ]}
    ];

    // Insert upazillas for each district
    for (const districtData of upazillaData) {
      for (const upazillaName of districtData.upazillas) {
        const upazillaId = `${upazillaName.toLowerCase().replace(/\s+/g, '_')}_upazilla`;
        
        try {
          await connection.execute(
            'INSERT IGNORE INTO upazillas (id, name, district_id) VALUES (?, ?, ?)',
            [upazillaId, upazillaName, districtData.districtId]
          );
          console.log(`Added upazilla: ${upazillaName} for district: ${districtData.districtId}`);
        } catch (error) {
          console.log(`Skipped upazilla: ${upazillaName} (already exists or district not found)`);
        }
      }
    }

    console.log('Upazilla population completed!');

  } catch (error) {
    console.error('Error populating upazillas:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

populateUpazillas(); 