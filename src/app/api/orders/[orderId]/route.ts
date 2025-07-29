import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/orders/[orderId] - Get a single order
export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const query = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        u.phone_number as user_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
    
    const order = await executeQuerySingle(query, [orderId]);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Convert numeric fields to proper types and format response for frontend
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
      user_name: order.user_name,
      user_email: order.user_email,
      user_phone: order.user_phone
    };

    // Parse shipping address JSON
    if (order.shipping_address) {
      try {
        formattedOrder.shippingAddress = JSON.parse(order.shipping_address);
      } catch (e) {
        formattedOrder.shippingAddress = null;
      }
    }

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.*,
        p.name as product_name,
        p.description as product_description,
        p.seller_id,
        u.name as seller_name,
        pi.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE oi.order_id = ?
    `;
    const items = await executeQuery(itemsQuery, [orderId]);
    
    // Convert item fields to frontend format
    const formattedItems = items.map(item => ({
      id: item.product_id,
      name: item.name || item.product_name || 'Unknown Product',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 0,
      imageUrl: item.image_url || '/placeholder-product.jpg',
      sellerId: item.seller_id,
      sellerName: item.seller_name,
      total: parseFloat(item.total) || (parseFloat(item.price) * parseInt(item.quantity))
    }));
    
    formattedOrder.items = formattedItems;

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/orders/[orderId] - Update an order
export async function PUT(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    
    // Get current order status before update
    const currentOrder = await executeQuerySingle('SELECT status FROM orders WHERE id = ?', [orderId]);
    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const allowedFields = ['status', 'payment_status', 'delivery_charge_amount', 'shipping_method_name', 'platform_commission'];
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(orderId);
    
    const query = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, updateValues);
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle stock restoration when order is cancelled
    if (body.status === 'cancelled' && currentOrder.status !== 'cancelled') {
      console.log(`Order ${orderId} was cancelled, restoring product stock`);
      
      // Get order items to restore stock
      const orderItems = await executeQuery(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      );

      // Restore stock for each item
      for (const item of orderItems) {
        await executeQuery(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
        console.log(`Restored ${item.quantity} stock for product ${item.product_id}`);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/orders/[orderId] - Delete an order (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    
    // First delete order items
    await executeQuery('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    
    // Then delete the order
    const result = await executeQuery('DELETE FROM orders WHERE id = ?', [orderId]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
} 