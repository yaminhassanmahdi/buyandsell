import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';
import { generateOrderId } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
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
    if (!userId || !items || !Array.isArray(items) || items.length === 0 || !shippingAddress || totalAmount === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['userId', 'items', 'shippingAddress', 'totalAmount']
      }, { status: 400 });
    }

    // Generate user-friendly order ID
    let orderId = generateOrderId();
    let counter = 1;
    
    // Ensure the ID is unique (very unlikely but good practice)
    while (true) {
      const existingOrder = await executeQuerySingle(
        'SELECT id FROM orders WHERE id = ?',
        [orderId]
      );
      
      if (!existingOrder) {
        break; // ID is unique
      }
      
      // Try with a number suffix (very rare case)
      const baseId = generateOrderId();
      orderId = `${baseId}-${counter}`;
      counter++;
    }

    // Check stock availability for all items first
    const stockChecks = await Promise.all(
      items.map(async (item: any) => {
        const productQuery = 'SELECT id, name, stock FROM products WHERE id = ?';
        const product = await executeQuerySingle(productQuery, [item.productId || item.id]);
        
        if (!product) {
          throw new Error(`Product ${item.productId || item.id} not found`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
        
        return { productId: product.id, currentStock: product.stock, requestedQuantity: item.quantity };
      })
    );

    // If all stock checks pass, proceed with order creation
    // Insert order
    const orderQuery = `
      INSERT INTO orders (
        id, user_id, total_amount, delivery_charge_amount, shipping_address, 
        status, payment_status, platform_commission, shipping_method_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    await executeQuery(orderQuery, [
      orderId, userId, totalAmount, deliveryChargeAmount || 0, JSON.stringify(shippingAddress),
      status, paymentStatus, platformCommission || 0, shippingMethodName || null
    ]);

    // Insert order items and update product stock
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const stockCheck = stockChecks[i];
      
      // Insert order item
      const itemQuery = `
        INSERT INTO order_items (order_id, product_id, seller_id, name, price, quantity, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await executeQuery(itemQuery, [
        orderId, item.productId || item.id, item.sellerId, item.name, 
        item.price, item.quantity, item.imageUrl || ''
      ]);
      
      // Update product stock
      const newStock = stockCheck.currentStock - stockCheck.requestedQuantity;
      const updateStockQuery = 'UPDATE products SET stock = ? WHERE id = ?';
      await executeQuery(updateStockQuery, [newStock, stockCheck.productId]);
      
      // If stock becomes 0, mark as sold but keep it visible to seller
      if (newStock === 0) {
        console.log(`Product ${stockCheck.productId} is now sold out (stock = 0)`);
        // Note: We don't change status here, we let the stock = 0 indicate sold out
        // The product will be filtered from public listings but remain visible to seller
      }
    }

    return NextResponse.json({ 
      success: true, 
      orderId,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: 'Failed to create order', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
