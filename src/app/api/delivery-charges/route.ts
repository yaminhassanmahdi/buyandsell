import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/delivery-charges - Get delivery charge settings
export async function GET() {
  try {
    const query = 'SELECT * FROM delivery_charge_settings LIMIT 1';
    const result = await executeQuerySingle(query);

    if (!result) {
      // Return default values if no settings found
      return NextResponse.json({
        intra_upazilla_charge: 60,
        intra_district_charge: 110,
        inter_district_charge: 130,
        intra_upazilla_extra_kg_charge: 20,
        intra_district_extra_kg_charge: 30,
        inter_district_extra_kg_charge: 40
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching delivery charges:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery charges' }, { status: 500 });
  }
}

// PUT /api/delivery-charges - Update delivery charge settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      intraUpazillaCharge, 
      intraDistrictCharge, 
      interDistrictCharge,
      intraUpazillaExtraKgCharge,
      intraDistrictExtraKgCharge,
      interDistrictExtraKgCharge
    } = body;

    // First check if settings exist
    const existingQuery = 'SELECT id FROM delivery_charge_settings LIMIT 1';
    const existing = await executeQuerySingle(existingQuery);

    if (existing) {
      // Update existing
      const updateQuery = `
        UPDATE delivery_charge_settings 
        SET 
          intra_upazilla_charge = ?, 
          intra_district_charge = ?, 
          inter_district_charge = ?,
          intra_upazilla_extra_kg_charge = ?,
          intra_district_extra_kg_charge = ?,
          inter_district_extra_kg_charge = ?
        WHERE id = ?
      `;
      await executeQuery(updateQuery, [
        intraUpazillaCharge, 
        intraDistrictCharge, 
        interDistrictCharge,
        intraUpazillaExtraKgCharge || 20,
        intraDistrictExtraKgCharge || 30,
        interDistrictExtraKgCharge || 40,
        existing.id
      ]);
    } else {
      // Insert new
      const insertQuery = `
        INSERT INTO delivery_charge_settings (
          intra_upazilla_charge, 
          intra_district_charge, 
          inter_district_charge,
          intra_upazilla_extra_kg_charge,
          intra_district_extra_kg_charge,
          inter_district_extra_kg_charge
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      await executeQuery(insertQuery, [
        intraUpazillaCharge, 
        intraDistrictCharge, 
        interDistrictCharge,
        intraUpazillaExtraKgCharge || 20,
        intraDistrictExtraKgCharge || 30,
        interDistrictExtraKgCharge || 40
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating delivery charges:', error);
    return NextResponse.json({ error: 'Failed to update delivery charges' }, { status: 500 });
  }
}