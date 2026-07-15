import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000/api';

test('Supermarket Inventory System API Tests', async (t) => {
  // Store a created item ID for test transactions
  let testItemId = null;

  await t.test('GET /api/dashboard returns correct schema and numbers', async () => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.ok(typeof data.totalItems === 'number');
    assert.ok(typeof data.lowStockCount === 'number');
    assert.ok(typeof data.expiringSoonCount === 'number');
    assert.ok(typeof data.expiredCount === 'number');
    assert.ok(typeof data.totalStockCount === 'number');
    assert.ok(typeof data.totalRevenue === 'number');
    assert.ok(typeof data.totalProfit === 'number');
    assert.ok(Array.isArray(data.needsAttention));
  });

  await t.test('GET /api/items returns list of products', async () => {
    const res = await fetch(`${BASE_URL}/items`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });

  await t.test('GET /api/items with pagination returns paginated results', async () => {
    const res = await fetch(`${BASE_URL}/items?page=1&limit=3`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.ok(Array.isArray(data.items));
    assert.strictEqual(data.items.length <= 3, true);
    assert.ok(data.pagination);
    assert.strictEqual(data.pagination.page, 1);
    assert.strictEqual(data.pagination.limit, 3);
    assert.ok(typeof data.pagination.total === 'number');
    assert.ok(typeof data.pagination.totalPages === 'number');
  });

  await t.test('POST /api/items creates a new catalog item', async () => {
    const payload = {
      name: 'Test Energy Drink',
      barcode: `test-barcode-${Date.now()}`,
      category: 'Beverages',
      costPrice: 1.20,
      salePrice: 2.50,
      quantity: 10,
      reorderThreshold: 5,
      expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days out
    };

    const res = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.name, 'Test Energy Drink');
    assert.strictEqual(data.quantity, 10);
    testItemId = data.id;
  });

  await t.test('POST /api/items/:id/stock-in increases stock levels', async () => {
    assert.ok(testItemId);
    const res = await fetch(`${BASE_URL}/items/${testItemId}/stock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 5, note: 'Test Restock' })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.quantity, 15); // 10 + 5
  });

  await t.test('POST /api/items/:id/sale decreases stock levels and records transaction', async () => {
    assert.ok(testItemId);
    const res = await fetch(`${BASE_URL}/items/${testItemId}/sale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 3 })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.quantity, 12); // 15 - 3
  });

  await t.test('GET /api/transactions filtering matches custom parameters', async () => {
    const res = await fetch(`${BASE_URL}/transactions?type=out`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.ok(Array.isArray(data.transactions));
    data.transactions.forEach(tx => {
      assert.strictEqual(tx.type, 'out');
    });
  });

  await t.test('POST /api/items/:id/sale of expired product returns 400 Bad Request', async () => {
    const payload = {
      name: 'Expired Test Product',
      barcode: `test-expired-${Date.now()}`,
      category: 'Produce',
      costPrice: 0.50,
      salePrice: 1.00,
      quantity: 5,
      reorderThreshold: 2,
      expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    };

    const createRes = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert.strictEqual(createRes.status, 201);
    const expiredItem = await createRes.json();

    const saleRes = await fetch(`${BASE_URL}/items/${expiredItem.id}/sale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1 })
    });

    assert.strictEqual(saleRes.status, 400);
    const saleData = await saleRes.json();
    assert.strictEqual(saleData.error, 'Cannot record sale for an expired product');

    const deleteRes = await fetch(`${BASE_URL}/items/${expiredItem.id}`, {
      method: 'DELETE'
    });
    assert.strictEqual(deleteRes.status, 200);
  });

  await t.test('DELETE /api/items/:id deletes the product', async () => {
    assert.ok(testItemId);
    const res = await fetch(`${BASE_URL}/items/${testItemId}`, {
      method: 'DELETE'
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.message, 'Item deleted successfully');
  });
});
