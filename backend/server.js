import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to convert Prisma Decimal fields to normal floats for ease of frontend use
const formatItem = (item) => {
  if (!item) return null;
  return {
    ...item,
    costPrice: parseFloat(item.costPrice.toString()),
    salePrice: parseFloat(item.salePrice.toString()),
  };
};

// GET /api/items → list all items (support ?search=&category=&page=&limit=)
app.get('/api/items', async (req, res) => {
  try {
    const { search, category } = req.query;
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

    const where = {};

    if (category && category.trim() !== '') {
      where.category = category;
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { barcode: { contains: searchTerm } },
      ];
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      const total = await prisma.item.count({ where });
      const items = await prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      });
      res.json({
        items: items.map(formatItem),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else {
      const items = await prisma.item.findMany({
        where,
        orderBy: { name: 'asc' },
      });
      res.json(items.map(formatItem));
    }
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// POST /api/items → create item
app.post('/api/items', async (req, res) => {
  try {
    const {
      name,
      barcode,
      category,
      costPrice,
      salePrice,
      quantity,
      reorderThreshold,
      expiryDate,
    } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ error: 'Category/Aisle is required' });
    }
    if (costPrice === undefined || costPrice === null || isNaN(Number(costPrice)) || Number(costPrice) < 0) {
      return res.status(400).json({ error: 'Cost price must be a non-negative number' });
    }
    if (salePrice === undefined || salePrice === null || isNaN(Number(salePrice)) || Number(salePrice) < 0) {
      return res.status(400).json({ error: 'Sale price must be a non-negative number' });
    }
    
    const qty = quantity !== undefined && quantity !== null ? parseInt(quantity, 10) : 0;
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }

    const threshold = reorderThreshold !== undefined && reorderThreshold !== null ? parseInt(reorderThreshold, 10) : 5;
    if (isNaN(threshold) || threshold < 0) {
      return res.status(400).json({ error: 'Reorder threshold must be a non-negative integer' });
    }

    // Barcode uniqueness check
    if (barcode && barcode.trim() !== '') {
      const existingBarcode = await prisma.item.findUnique({
        where: { barcode: barcode.trim() },
      });
      if (existingBarcode) {
        return res.status(400).json({ error: `Barcode "${barcode}" is already assigned to item "${existingBarcode.name}"` });
      }
    }

    const parsedExpiry = expiryDate ? new Date(expiryDate) : null;
    if (parsedExpiry && isNaN(parsedExpiry.getTime())) {
      return res.status(400).json({ error: 'Expiry date is invalid' });
    }

    const newItem = await prisma.item.create({
      data: {
        name: name.trim(),
        barcode: barcode && barcode.trim() !== '' ? barcode.trim() : null,
        category: category.trim(),
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        quantity: qty,
        reorderThreshold: threshold,
        expiryDate: parsedExpiry,
      },
    });

    res.status(201).json(formatItem(newItem));
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/items/:id → edit item
app.put('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      barcode,
      category,
      costPrice,
      salePrice,
      quantity,
      reorderThreshold,
      expiryDate,
    } = req.body;

    // Check if item exists
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ error: 'Category/Aisle is required' });
    }
    if (costPrice === undefined || costPrice === null || isNaN(Number(costPrice)) || Number(costPrice) < 0) {
      return res.status(400).json({ error: 'Cost price must be a non-negative number' });
    }
    if (salePrice === undefined || salePrice === null || isNaN(Number(salePrice)) || Number(salePrice) < 0) {
      return res.status(400).json({ error: 'Sale price must be a non-negative number' });
    }
    
    const qty = quantity !== undefined && quantity !== null ? parseInt(quantity, 10) : 0;
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ error: 'Quantity must be a non-negative integer' });
    }

    const threshold = reorderThreshold !== undefined && reorderThreshold !== null ? parseInt(reorderThreshold, 10) : 5;
    if (isNaN(threshold) || threshold < 0) {
      return res.status(400).json({ error: 'Reorder threshold must be a non-negative integer' });
    }

    // Barcode uniqueness check (exclude current item)
    if (barcode && barcode.trim() !== '') {
      const existingBarcode = await prisma.item.findFirst({
        where: {
          barcode: barcode.trim(),
          NOT: { id },
        },
      });
      if (existingBarcode) {
        return res.status(400).json({ error: `Barcode "${barcode}" is already assigned to another item ("${existingBarcode.name}")` });
      }
    }

    const parsedExpiry = expiryDate ? new Date(expiryDate) : null;
    if (parsedExpiry && isNaN(parsedExpiry.getTime())) {
      return res.status(400).json({ error: 'Expiry date is invalid' });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name: name.trim(),
        barcode: barcode && barcode.trim() !== '' ? barcode.trim() : null,
        category: category.trim(),
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        quantity: qty,
        reorderThreshold: threshold,
        expiryDate: parsedExpiry,
      },
    });

    res.json(formatItem(updatedItem));
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/items/:id → delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await prisma.item.delete({ where: { id } });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// POST /api/items/:id/stock-in → add stock
app.post('/api/items/:id/stock-in', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, note } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    const cleanNote = note && note.trim() !== '' ? note.trim() : 'Stock received';

    // Perform database transaction atomically
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id } });
      if (!item) {
        throw new Error('NOT_FOUND');
      }

      const updatedItem = await tx.item.update({
        where: { id },
        data: {
          quantity: item.quantity + qty,
        },
      });

      await tx.transaction.create({
        data: {
          itemId: id,
          type: 'in',
          quantity: qty,
          note: cleanNote,
        },
      });

      return updatedItem;
    });

    res.json(formatItem(result));
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Item not found' });
    }
    console.error('Error recording stock-in:', error);
    res.status(500).json({ error: 'Failed to record stock-in' });
  }
});

// POST /api/items/:id/sale → record sale
app.post('/api/items/:id/sale', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    // Perform database transaction atomically
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id } });
      if (!item) {
        throw new Error('NOT_FOUND');
      }

      if (item.quantity < qty) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
        throw new Error('EXPIRED_PRODUCT');
      }

      const updatedItem = await tx.item.update({
        where: { id },
        data: {
          quantity: item.quantity - qty,
        },
      });

      await tx.transaction.create({
        data: {
          itemId: id,
          type: 'out',
          quantity: qty,
          note: 'Manual sale',
        },
      });

      return updatedItem;
    });

    res.json(formatItem(result));
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ error: 'Sale quantity exceeds available stock' });
    }
    if (error.message === 'EXPIRED_PRODUCT') {
      return res.status(400).json({ error: 'Cannot record sale for an expired product' });
    }
    console.error('Error recording sale:', error);
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

// GET /api/transactions → list transactions (support filters: ?page=&limit=&type=&startDate=&endDate=&search=)
app.get('/api/transactions', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;
    const { type, startDate, endDate, search } = req.query;

    const where = {};

    if (type && (type === 'in' || type === 'out')) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.item = {
        OR: [
          { name: { contains: searchTerm } },
          { barcode: { contains: searchTerm } },
        ]
      };
    }

    const total = await prisma.transaction.count({ where });
    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          select: {
            name: true,
            barcode: true,
          },
        },
      },
    });

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/dashboard → returns totals, low-stock, expiring-soon, expired, and financials
app.get('/api/dashboard', async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // 1. Total items count (unique catalog products)
    const totalItems = await prisma.item.count();

    // 2. Load all items to compute states
    const allItems = await prisma.item.findMany();
    
    // Low-stock items
    const lowStockItems = allItems.filter(item => item.quantity <= item.reorderThreshold);
    const lowStockCount = lowStockItems.length;

    // Expired items (expiryDate is in the past, before today)
    const expiredItems = allItems.filter(item => {
      if (!item.expiryDate) return false;
      const expiry = new Date(item.expiryDate);
      return expiry < today;
    });
    const expiredCount = expiredItems.length;

    // Expiring-soon items (expiryDate is between today and 7 days from now)
    const expiringSoonItems = allItems.filter(item => {
      if (!item.expiryDate) return false;
      const expiry = new Date(item.expiryDate);
      return expiry >= today && expiry <= sevenDaysFromNow;
    });
    const expiringSoonCount = expiringSoonItems.length;

    // 3. Financial calculations from transaction history (type = 'out')
    const sales = await prisma.transaction.findMany({
      where: { type: 'out' },
      include: {
        item: true,
      },
    });

    let totalRevenue = 0;
    let totalProfit = 0;
    for (const tx of sales) {
      if (tx.item) {
        const costPrice = parseFloat(tx.item.costPrice.toString());
        const salePrice = parseFloat(tx.item.salePrice.toString());
        const rev = tx.quantity * salePrice;
        const profit = tx.quantity * (salePrice - costPrice);
        totalRevenue += rev;
        totalProfit += profit;
      }
    }

    // 4. Prioritized "needs attention" list:
    const needsAttentionMap = new Map();

    allItems.forEach(item => {
      const isExpired = item.expiryDate && new Date(item.expiryDate) < today;
      const isExpiring = item.expiryDate && new Date(item.expiryDate) >= today && new Date(item.expiryDate) <= sevenDaysFromNow;
      const isLowStock = item.quantity <= item.reorderThreshold;

      if (isExpired) {
        needsAttentionMap.set(item.id, {
          item: formatItem(item),
          reason: isLowStock ? 'Expired & Low stock' : 'Expired',
          priority: 1,
          severity: 'critical',
        });
      } else if (isExpiring && isLowStock) {
        needsAttentionMap.set(item.id, {
          item: formatItem(item),
          reason: 'Low stock & Expiring soon',
          priority: 1,
          severity: 'critical',
        });
      } else if (isExpiring) {
        needsAttentionMap.set(item.id, {
          item: formatItem(item),
          reason: 'Expiring soon',
          priority: 2,
          severity: 'warning',
        });
      } else if (isLowStock) {
        needsAttentionMap.set(item.id, {
          item: formatItem(item),
          reason: 'Low stock',
          priority: 3,
          severity: 'attention',
        });
      }
    });

    const needsAttention = Array.from(needsAttentionMap.values())
      .sort((a, b) => {
        // Primary sort: priority asc (1 -> 2 -> 3)
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // Secondary sort: quantity asc
        return a.item.quantity - b.item.quantity;
      });

    const totalStockCount = allItems.reduce((acc, item) => acc + item.quantity, 0);

    res.json({
      totalItems,
      lowStockCount,
      expiringSoonCount,
      expiredCount,
      totalStockCount,
      totalRevenue,
      totalProfit,
      needsAttention,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Root check
app.get('/', (req, res) => {
  res.json({ message: 'Inventory Management API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
