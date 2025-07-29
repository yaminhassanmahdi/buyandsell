import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/withdrawal-requests - Get withdrawal requests with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        wr.*,
        u.name as user_name,
        u.email as user_email,
        wm.method_type as withdrawal_method_type,
        wm.details as withdrawal_method_details
      FROM withdrawal_requests wr
      LEFT JOIN users u ON wr.user_id = u.id
      LEFT JOIN withdrawal_methods wm ON wr.withdrawal_method_id = wm.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (userId) {
      query += ' AND wr.user_id = ?';
      queryParams.push(userId);
    }

    if (status) {
      query += ' AND wr.status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY wr.requested_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const withdrawalRequests = await executeQuery(query, queryParams);

    // Format response for frontend
    const formattedRequests = withdrawalRequests.map((wr: any) => ({
      id: wr.id,
      userId: wr.user_id,
      userName: wr.user_name,
      userEmail: wr.user_email,
      amount: parseFloat(wr.amount),
      withdrawalMethodId: wr.withdrawal_method_id,
      withdrawalMethodType: wr.withdrawal_method_type,
      withdrawalMethodDetails: wr.withdrawal_method_details,
      status: wr.status,
      requestedAt: wr.requested_at,
      processedAt: wr.processed_at,
      adminNote: wr.admin_note
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return NextResponse.json({ error: 'Failed to fetch withdrawal requests' }, { status: 500 });
  }
}

// POST /api/withdrawal-requests - Create a new withdrawal request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      amount,
      withdrawalMethodId
    } = body;

    // Validate required fields
    if (!userId || !amount || !withdrawalMethodId) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['userId', 'amount', 'withdrawalMethodId']
      }, { status: 400 });
    }

    // Check if user has sufficient balance
    const earningsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/users/earnings?userId=${userId}`);
    if (!earningsResponse.ok) {
      return NextResponse.json({ error: 'Unable to verify user balance' }, { status: 400 });
    }
    
    const earnings = await earningsResponse.json();
    if (earnings.availableBalance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Generate withdrawal request ID
    const requestId = `WR${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Insert withdrawal request
    const insertQuery = `
      INSERT INTO withdrawal_requests (
        id, user_id, amount, withdrawal_method_id, status, requested_at
      ) VALUES (?, ?, ?, ?, 'pending', NOW())
    `;
    
    await executeQuery(insertQuery, [requestId, userId, amount, withdrawalMethodId]);

    return NextResponse.json({ 
      success: true, 
      requestId,
      message: 'Withdrawal request submitted successfully'
    });

  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return NextResponse.json({ 
      error: 'Failed to create withdrawal request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/withdrawal-requests - Update withdrawal request status (admin only)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      requestId,
      status,
      adminNote
    } = body;

    // Validate required fields
    if (!requestId || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['requestId', 'status']
      }, { status: 400 });
    }

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update withdrawal request
    const updateQuery = `
      UPDATE withdrawal_requests 
      SET status = ?, admin_note = ?, processed_at = NOW()
      WHERE id = ?
    `;
    
    const result = await executeQuery(updateQuery, [status, adminNote || null, requestId]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Withdrawal request ${status} successfully`
    });

  } catch (error) {
    console.error('Error updating withdrawal request:', error);
    return NextResponse.json({ 
      error: 'Failed to update withdrawal request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
