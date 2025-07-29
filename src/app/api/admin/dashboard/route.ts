import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

export async function GET() {
  try {
    // Get total users count
    const totalUsersResult = await executeQuerySingle('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.count) || 0;

    // Get total orders count and status breakdown
    const totalOrdersResult = await executeQuerySingle('SELECT COUNT(*) as count FROM orders');
    const totalOrders = parseInt(totalOrdersResult.count) || 0;

    const pendingOrdersResult = await executeQuerySingle('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
    const pendingOrders = parseInt(pendingOrdersResult.count) || 0;

    const deliveredOrdersResult = await executeQuerySingle('SELECT COUNT(*) as count FROM orders WHERE status = "delivered"');
    const deliveredOrders = parseInt(deliveredOrdersResult.count) || 0;

    const cancelledOrdersResult = await executeQuerySingle('SELECT COUNT(*) as count FROM orders WHERE status = "cancelled"');
    const cancelledOrders = parseInt(cancelledOrdersResult.count) || 0;

    // Get total products count and status breakdown
    const totalProductsResult = await executeQuerySingle('SELECT COUNT(*) as count FROM products');
    const totalProducts = parseInt(totalProductsResult.count) || 0;

    const pendingProductsResult = await executeQuerySingle('SELECT COUNT(*) as count FROM products WHERE status = "pending"');
    const pendingProducts = parseInt(pendingProductsResult.count) || 0;

    const approvedProductsResult = await executeQuerySingle('SELECT COUNT(*) as count FROM products WHERE status = "approved"');
    const approvedProducts = parseInt(approvedProductsResult.count) || 0;

    // Calculate total revenue from delivered and paid orders
    const revenueResult = await executeQuerySingle(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue 
      FROM orders 
      WHERE status = 'delivered' AND payment_status = 'paid'
    `);
    const totalRevenue = parseFloat(revenueResult.total_revenue) || 0;

    // Calculate total commission earned
    const commissionQuery = `
      SELECT 
        oi.price,
        oi.quantity,
        p.commission_percentage
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.status = 'delivered' AND o.payment_status = 'paid'
    `;
    const orderItems = await executeQuery(commissionQuery);
    
    let totalCommission = 0;
    for (const item of orderItems) {
      const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
      const commissionPercentage = parseFloat(item.commission_percentage) || 5; // Default 5%
      const commissionAmount = itemTotal * (commissionPercentage / 100);
      totalCommission += commissionAmount;
    }

    // Get total withdrawals paid
    const withdrawalsResult = await executeQuerySingle(`
      SELECT COALESCE(SUM(amount), 0) as total_withdrawals 
      FROM withdrawal_requests 
      WHERE status = 'approved'
    `);
    const totalWithdrawals = parseFloat(withdrawalsResult.total_withdrawals) || 0;

    // Calculate current cash in hand
    const currentCashInHand = totalCommission - totalWithdrawals;

    const dashboardStats = {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      pendingProducts,
      approvedProducts,
      totalCommission: currentCashInHand, // Show available cash, not total commission
      totalCommissionEarned: totalCommission,
      totalWithdrawals
    };

    return NextResponse.json(dashboardStats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
} 