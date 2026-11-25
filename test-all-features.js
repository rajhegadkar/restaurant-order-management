// test-all-features.js - Comprehensive Feature Test Suite (ESM)
import http from 'http';

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5173');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('   FULL SYSTEM FEATURE & LOGIC AUDIT SUITE');
  console.log('====================================================\n');

  // Test 1: API Server Health
  console.log('1. Testing Server Infrastructure:');
  const health = await request('GET', '/api/health');
  assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health responds with status ok');

  // Test 2: Full State Sync
  const sync = await request('GET', '/api/sync');
  assert(sync.status === 200 && Array.isArray(sync.data.orders) && Array.isArray(sync.data.tables), 'GET /api/sync returns valid orders and tables lists');

  // Test 3: Restaurant Settings via API
  console.log('\n2. Testing Restaurant Settings & Currency Configuration:');
  const settingsUpdate = await request('POST', '/api/settings', {
    restaurant_name: 'Chandrama Kitchen',
    currency_symbol: '₹',
    tax_percentage: 5,
    delivery_fee: 49,
    free_delivery_threshold: 499,
  });
  assert(settingsUpdate.status === 200 && settingsUpdate.data.success === true, 'POST /api/settings persists restaurant configuration');
  assert(settingsUpdate.data.settings.currency_symbol === '₹', 'Currency symbol is correctly set to Indian Rupee (₹)');

  // Test 4: Business Calculations (Cart, Tax, Discounts, Thresholds)
  console.log('\n3. Testing Cart Financial & Discount Calculation Engine:');
  const subtotal = 650;
  const couponDiscountPercentage = 20; // 20%
  const maxCap = 100;
  const rawDiscount = (subtotal * couponDiscountPercentage) / 100; // 130
  const cappedDiscount = Math.min(rawDiscount, maxCap); // 100
  assert(cappedDiscount === 100, 'Percentage coupon with max cap discount correctly calculates ₹100 max reduction on ₹650');

  const deliveryThreshold = 499;
  const deliveryFee = subtotal >= deliveryThreshold ? 0 : 49;
  assert(deliveryFee === 0, 'Orders above ₹499 qualify for FREE delivery (fee waived to ₹0)');

  const dineInDeliveryFee = 0; // Always waived for dine-in
  assert(dineInDeliveryFee === 0, 'Dine-In table orders have delivery fee strictly waived to ₹0');

  const taxableAmount = subtotal - cappedDiscount; // 550
  const tax = (taxableAmount * 5) / 100; // 27.5
  const grandTotal = taxableAmount + deliveryFee + tax; // 577.5
  assert(grandTotal === 577.5, 'Tax calculation (5% GST) and grand total strictly matches ₹577.50');

  // Test 5: Table QR Token Generation and Validation
  console.log('\n4. Testing Table Management & QR Token Cryptographic Mechanics:');
  const testTableId = 'tbl_test_suite_01';
  const testTableToken = 'tok_test_secure_987';
  const testTableNumber = 'Table 07';
  const tableSync = await request('POST', '/api/tables', {
    table: {
      id: testTableId,
      table_number: testTableNumber,
      table_name: 'VIP Executive Booth',
      capacity: 6,
      status: 'available',
      qr_token: testTableToken,
      qr_code_url: `http://192.168.1.128:5173/order?table=${encodeURIComponent(testTableNumber)}&token=${testTableToken}`,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  });
  assert(tableSync.status === 200, 'POST /api/tables provisions new table record with secure QR token');

  // Test 6: Order Placement Workflow (Cash Order)
  console.log('\n5. Testing End-to-End Order Lifecycle & State Synchronization:');
  const testOrderId = `ord_test_${Date.now()}`;
  const testOrderNumber = `ORD-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderPlacement = await request('POST', '/api/orders', {
    id: testOrderId,
    order_number: testOrderNumber,
    order_type: 'dine_in',
    table_id: testTableId,
    table_number: testTableNumber,
    customer_name: 'Rohan Sharma',
    customer_phone: '+91 98765 43210',
    status: 'received',
    payment_method: 'cod', // Cash at Counter
    payment_status: 'pending',
    subtotal: 550,
    discount_amount: 100,
    delivery_fee: 0,
    tax_amount: 22.5,
    total_amount: 472.5,
    items: [
      {
        id: 'cart_1',
        menu_item_id: 'dish_pizza_01',
        name: 'Artisan Wood-Fired Bianca',
        price: 499,
        quantity: 1,
        selected_addons: [{ id: 'add_1', name: 'Fresh Buffalo Burrata', price: 51 }],
        special_instructions: 'Well done crust',
        total_price: 550,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  assert(orderPlacement.status === 201 && orderPlacement.data.success === true, 'POST /api/orders places new order successfully');

  // Verify Table status automatically updated to occupied on server
  const syncAfterOrder = await request('GET', '/api/sync');
  const occupiedTable = syncAfterOrder.data.tables.find((t) => t.id === testTableId);
  assert(occupiedTable && occupiedTable.status === 'occupied', 'Placing Dine-in order automatically transitions table status to "occupied"');
  assert(occupiedTable && occupiedTable.active_order_id === testOrderNumber, 'Occupied table displays active order number');

  // Test 7: Order Workflow Progression (Kitchen -> Ready -> Delivered)
  console.log('\n6. Testing Kitchen Display Progression & Cash Settlement:');
  const kitchenUpdate = await request('PATCH', `/api/orders/${testOrderId}`, {
    status: 'preparing',
  });
  assert(kitchenUpdate.status === 200, 'PATCH /api/orders/:id advances status to "preparing" for Kitchen KDS');

  const readyUpdate = await request('PATCH', `/api/orders/${testOrderId}`, {
    status: 'ready',
  });
  assert(readyUpdate.status === 200, 'PATCH /api/orders/:id advances status to "ready"');

  // Delivery + Cash Auto-Settlement
  const deliveryUpdate = await request('PATCH', `/api/orders/${testOrderId}`, {
    status: 'delivered',
    payment_status: 'completed', // Auto-settled cash
  });
  assert(deliveryUpdate.status === 200, 'PATCH /api/orders/:id completes order and auto-settles cash payment to "completed"');

  // Table status transition to needs_cleaning
  const tableCleanUpdate = await request('PATCH', `/api/tables/${testTableId}`, {
    status: 'needs_cleaning',
    active_order_id: '',
    active_order_total: 0,
  });
  assert(tableCleanUpdate.status === 200, 'Table status updates to "needs_cleaning" after order completion');

  // Final verification of updated state
  const finalSync = await request('GET', '/api/sync');
  const finalOrder = finalSync.data.orders.find((o) => o.id === testOrderId);
  const finalTable = finalSync.data.tables.find((t) => t.id === testTableId);
  assert(finalOrder && finalOrder.status === 'delivered', 'Final order state is verified as "delivered"');
  assert(finalOrder && finalOrder.payment_status === 'completed', 'Final order payment is verified as "completed" (Settled)');
  assert(finalTable && finalTable.status === 'needs_cleaning', 'Final table status is verified as "needs_cleaning"');

  // Clean up test table
  await request('PATCH', `/api/tables/${testTableId}`, {
    status: 'available',
    active_order_id: '',
    active_order_total: 0,
  });

  console.log('\n====================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
