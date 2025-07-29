import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/users/withdrawable - Get withdrawable amount for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Calculate earnings from delivered and paid orders
    const earningsQuery = `
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN o.status = 'delivered' AND o.payment_status = 'paid' 
            THEN (oi.price * oi.quantity) - ((oi.price * oi.quantity) * COALESCE(c.percentage, 5) / 100)
            ELSE 0 
          END
        ), 0) as total_earnings
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN commissions c ON p.category_id = c.category_id
      WHERE oi.seller_id = ?
    `;

    const earningsResult = await executeQuerySingle(earningsQuery, [userId]);
    const totalEarnings = parseFloat(earningsResult?.total_earnings || '0');

    // Calculate total withdrawn (approved and pending withdrawal requests)
    const withdrawnQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_withdrawn
      FROM withdrawal_requests 
      WHERE user_id = ? AND status IN ('approved', 'pending')
    `;

    const withdrawnResult = await executeQuerySingle(withdrawnQuery, [userId]);
    const totalWithdrawn = parseFloat(withdrawnResult?.total_withdrawn || '0');

    // Calculate withdrawable amount
    const withdrawableAmount = totalEarnings - totalWithdrawn;

    return NextResponse.json({
      userId,
      totalEarnings,
      totalWithdrawn,
      withdrawableAmount: Math.max(0, withdrawableAmount), // Ensure it's not negative
      canWithdraw: withdrawableAmount > 0
    });

  } catch (error) {
    console.error('Error calculating withdrawable amount:', error);
    return NextResponse.json({ error: 'Failed to calculate withdrawable amount' }, { status: 500 });
  }
} 