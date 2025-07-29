const { calculateDeliveryCharge } = require('./src/lib/utils');

// Test delivery charge calculation
function testDeliveryCharges() {
  const deliverySettings = {
    intra_thana_charge: 60,
    intra_district_charge: 110,
    inter_district_charge: 130
  };

  // Test scenarios
  const scenarios = [
    {
      name: "Same Thana and District (Intra-Thana)",
      buyerAddress: { thana: "Dhanmondi", district: "Dhaka", division: "Dhaka", country: "Bangladesh" },
      sellerAddress: { thana: "Dhanmondi", district: "Dhaka", division: "Dhaka", country: "Bangladesh" },
      expectedCharge: 60
    },
    {
      name: "Same District, Different Thana (Intra-District)",
      buyerAddress: { thana: "Dhanmondi", district: "Dhaka", division: "Dhaka", country: "Bangladesh" },
      sellerAddress: { thana: "Gulshan", district: "Dhaka", division: "Dhaka", country: "Bangladesh" },
      expectedCharge: 110
    },
    {
      name: "Different Districts (Inter-District)",
      buyerAddress: { thana: "Dhanmondi", district: "Dhaka", division: "Dhaka", country: "Bangladesh" },
      sellerAddress: { thana: "Chittagong Sadar", district: "Chittagong", division: "Chittagong", country: "Bangladesh" },
      expectedCharge: 130
    },
    {
      name: "No Seller Address (Default to Inter-District)",
      buyerAddress: { thana: "Dhanmondi", district: "Dhaka", division: "Dhaka", country: "Bangladesh" },
      sellerAddress: null,
      expectedCharge: 130
    }
  ];

  console.log("Testing Delivery Charge Calculation\n");
  console.log("=" .repeat(50));

  scenarios.forEach((scenario, index) => {
    const calculatedCharge = calculateDeliveryCharge(
      scenario.buyerAddress,
      scenario.sellerAddress,
      deliverySettings
    );

    const passed = calculatedCharge === scenario.expectedCharge;
    const status = passed ? "✅ PASS" : "❌ FAIL";

    console.log(`\n${index + 1}. ${scenario.name}`);
    console.log(`   Buyer: ${scenario.buyerAddress.thana}, ${scenario.buyerAddress.district}`);
    console.log(`   Seller: ${scenario.sellerAddress ? `${scenario.sellerAddress.thana}, ${scenario.sellerAddress.district}` : 'No address'}`);
    console.log(`   Expected: ${scenario.expectedCharge} | Calculated: ${calculatedCharge} | ${status}`);
  });

  console.log("\n" + "=" .repeat(50));
  console.log("Delivery charge calculation test completed!");
}

// Run the test
testDeliveryCharges(); 