import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/users/earnings - Get user earnings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get all delivered and paid orders for this seller's products with category commission rates
    const ordersQuery = `
      SELECT 
        o.id,
        o.total_amount,
        o.delivery_charge_amount,
        o.platform_commission,
        o.status,
        o.payment_status,
        oi.price,
        oi.quantity,
        oi.seller_id,
        p.category_id,
        c.percentage as commission_percentage
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN commissions c ON p.category_id = c.category_id
      WHERE oi.seller_id = ? 
        AND o.status = 'delivered' 
        AND o.payment_status = 'paid'
    `;
    
    const orderItems = await executeQuery(ordersQuery, [userId]);

    let totalEarnings = 0;
    let totalCommissionDeducted = 0;

    // Calculate earnings for each item using category-specific commission rates
    for (const item of orderItems) {
      const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
      // Use category-specific commission percentage, fallback to 5% if not found
      const commissionPercentage = parseFloat(item.commission_percentage) || 5;
      const commissionAmount = itemTotal * (commissionPercentage / 100);
      const sellerEarning = itemTotal - commissionAmount;
      
      totalEarnings += sellerEarning;
      totalCommissionDeducted += commissionAmount;
    }

    // Get total withdrawn amount
    const withdrawalsQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_withdrawn
      FROM withdrawal_requests 
      WHERE user_id = ? AND status = 'approved'
    `;
    const withdrawalResult = await executeQuerySingle(withdrawalsQuery, [userId]);
    const totalWithdrawn = parseFloat(withdrawalResult.total_withdrawn) || 0;

    // Calculate available balance
    const availableBalance = totalEarnings - totalWithdrawn;

    return NextResponse.json({
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalCommissionDeducted: parseFloat(totalCommissionDeducted.toFixed(2)),
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      availableBalance: parseFloat(Math.max(0, availableBalance).toFixed(2)),
      orderCount: orderItems.length
    });

  } catch (error) {
    console.error('Error calculating user earnings:', error);
    return NextResponse.json({ error: 'Failed to calculate earnings' }, { status: 500 });
  }
}
