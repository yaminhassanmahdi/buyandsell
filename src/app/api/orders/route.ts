import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/orders - Get all orders with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'date_desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sellerId = searchParams.get('sellerId');
    const includeItems = searchParams.get('includeItems') === 'true';

    let query = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (status) {
      query += ' AND o.status = ?';
      queryParams.push(status);
    }

    if (paymentStatus) {
      query += ' AND o.payment_status = ?';
      queryParams.push(paymentStatus);
    }

    if (userId) {
      query += ' AND o.user_id = ?';
      queryParams.push(userId);
    }

    if (search) {
      query += ' AND (o.id LIKE ? OR o.user_id LIKE ? OR u.name LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (sellerId) {
      query += ' AND EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.seller_id = ?)';
      queryParams.push(sellerId);
    }

    // Add sorting
    switch (sortBy) {
      case 'date_asc':
        query += ' ORDER BY o.created_at ASC';
        break;
      case 'total_asc':
        query += ' ORDER BY o.total_amount ASC';
        break;
      case 'total_desc':
        query += ' ORDER BY o.total_amount DESC';
        break;
      default:
        query += ' ORDER BY o.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const orders = await executeQuery(query, queryParams);

    // Format orders for frontend with enriched data
    const formattedOrders = await Promise.all(orders.map(async (order: any) => {
      const formattedOrder = {
        id: order.id,
        userId: order.user_id,
        totalAmount: parseFloat(order.total_amount) || 0,
        deliveryChargeAmount: parseFloat(order.delivery_charge_amount) || 0,
        platformCommission: parseFloat(order.platform_commission) || 0,
        status: order.status,
        paymentStatus: order.payment_status,
        shippingMethodName: order.shipping_method_name,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        userName: order.user_name,
        userEmail: order.user_email,
        shippingAddress: null,
        items: []
      };

      // Parse shipping address JSON
      if (order.shipping_address) {
        try {
          formattedOrder.shippingAddress = JSON.parse(order.shipping_address);
        } catch (e) {
          formattedOrder.shippingAddress = null;
        }
      }

      // Get order items with enriched data if requested or if we need seller info
      if (includeItems || sellerId) {
        const itemsQuery = `
          SELECT 
            oi.*,
            p.name as product_name,
            p.description as product_description,
            p.category_id,
            pi.image_url,
            pi.image_hint,
            u.name as seller_name,
            u.email as seller_email,
            c.name as category_name,
            comm.percentage as commission_percentage
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
          LEFT JOIN users u ON oi.seller_id = u.id
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN commissions comm ON p.category_id = comm.category_id
          WHERE oi.order_id = ?
        `;
        
        const items = await executeQuery(itemsQuery, [order.id]);
        
        formattedOrder.items = items.map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          sellerId: item.seller_id,
          name: item.product_name || 'Unknown Product',
          description: item.product_description,
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1,
          imageUrl: item.image_url,
          imageHint: item.image_hint,
          sellerName: item.seller_name,
          sellerEmail: item.seller_email,
          categoryName: item.category_name,
          commissionPercentage: item.commission_percentage ? parseFloat(item.commission_percentage) : 5,
          // Include seller details for admin view
          sellerDetails: item.seller_name ? {
            id: item.seller_id,
            name: item.seller_name,
            email: item.seller_email
          } : null
        }));
      }

      return formattedOrder;
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      id,
      userId,
      items,
      shippingAddress,
      deliveryChargeAmount,
      totalAmount,
      paymentStatus = 'unpaid',
      status = 'pending',
      platformCommission,
      shippingMethodName
    } = body;

    // Validate required fields
    if (!id || !userId || !items || !Array.isArray(items) || items.length === 0 || !shippingAddress || totalAmount === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['id', 'userId', 'items', 'shippingAddress', 'totalAmount']
      }, { status: 400 });
    }

    // Insert order
    const orderQuery = `
      INSERT INTO orders (
        id, user_id, total_amount, delivery_charge_amount, shipping_address, 
        status, payment_status, platform_commission, shipping_method_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    await executeQuery(orderQuery, [
      id, userId, totalAmount, deliveryChargeAmount || 0, JSON.stringify(shippingAddress),
      status, paymentStatus, platformCommission || 0, shippingMethodName || null
    ]);

    // Insert order items
    for (const item of items) {
      const itemQuery = `
        INSERT INTO order_items (order_id, product_id, seller_id, name, price, quantity, image_url, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await executeQuery(itemQuery, [
        id, item.productId || item.id, item.sellerId, item.name, 
        item.price, item.quantity, item.imageUrl || '', 
        item.total || (item.price * item.quantity)
      ]);
    }

    return NextResponse.json({ success: true, orderId: id });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: 'Failed to create order', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 