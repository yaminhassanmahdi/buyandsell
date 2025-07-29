import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'divisions', 'districts', 'upazillas'
    const divisionId = searchParams.get('divisionId');
    const districtId = searchParams.get('districtId');

    console.log('Locations API called:', { type, divisionId, districtId });

    let result;

    switch (type) {
      case 'divisions':
        // Get divisions from the divisions table
        const divisions = await executeQuery('SELECT id, name FROM divisions ORDER BY name');
        result = divisions;
        break;

      case 'districts':
        if (divisionId) {
          // Return districts for a specific division (divisionId can be either ID or name)
          const districts = await executeQuery(`
            SELECT d.id, d.name, d.division_id as divisionId
            FROM districts d
            JOIN divisions division ON d.division_id = division.id
            WHERE division.id = ? OR division.name = ?
            ORDER BY d.name
          `, [divisionId, divisionId]);
          result = districts;
        } else {
          // Return all districts
          const districts = await executeQuery(`
            SELECT d.id, d.name, d.division_id as divisionId
            FROM districts d
            ORDER BY d.division_id, d.name
          `);
          result = districts;
        }
        break;

      case 'upazillas':
        if (districtId) {
          // Return upazillas for a specific district (districtId can be either ID or name)
          const upazillas = await executeQuery(`
            SELECT u.id, u.name, u.district_id as districtId
            FROM upazillas u
            JOIN districts d ON u.district_id = d.id
            WHERE d.id = ? OR d.name = ?
            ORDER BY u.name
          `, [districtId, districtId]);
          result = upazillas;
        } else {
          // Return all upazillas
          const upazillas = await executeQuery(`
            SELECT u.id, u.name, u.district_id as districtId
            FROM upazillas u
            ORDER BY u.district_id, u.name
          `);
          result = upazillas;
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    console.log('Locations API result:', { type, count: result?.length || 0 });
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations', details: error.message }, { status: 500 });
  }
} 