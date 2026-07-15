import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.transaction.deleteMany();
  await prisma.item.deleteMany();

  console.log('Seeding items...');

  const today = new Date();
  
  // Helper to add days
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const sampleItems = [
    {
      name: 'Organic Bananas',
      barcode: '000000000001',
      category: 'Produce',
      costPrice: 0.50,
      salePrice: 0.99,
      quantity: 15,
      reorderThreshold: 10,
      expiryDate: addDays(today, 5), // Expiring in 5 days
    },
    {
      name: 'Whole Milk 1 Gallon',
      barcode: '000000000002',
      category: 'Dairy',
      costPrice: 2.20,
      salePrice: 3.49,
      quantity: 4, // Low stock (4 <= 5)
      reorderThreshold: 5,
      expiryDate: addDays(today, 3), // Expiring in 3 days
    },
    {
      name: 'Sliced White Bread',
      barcode: '000000000003',
      category: 'Grocery',
      costPrice: 1.10,
      salePrice: 1.99,
      quantity: 20,
      reorderThreshold: 5,
      expiryDate: addDays(today, 6), // Expiring in 6 days
    },
    {
      name: 'Greek Yogurt 32oz',
      barcode: '000000000004',
      category: 'Dairy',
      costPrice: 3.50,
      salePrice: 5.49,
      quantity: 8,
      reorderThreshold: 3,
      expiryDate: addDays(today, 12),
    },
    {
      name: 'Head & Shoulders Shampoo',
      barcode: '000000000005',
      category: 'Personal Care',
      costPrice: 4.00,
      salePrice: 6.99,
      quantity: 12,
      reorderThreshold: 4,
      expiryDate: null,
    },
    {
      name: 'Colgate Toothpaste',
      barcode: '000000000006',
      category: 'Personal Care',
      costPrice: 1.50,
      salePrice: 2.79,
      quantity: 2, // Low stock (2 <= 5)
      reorderThreshold: 5,
      expiryDate: null,
    },
    {
      name: 'Honey Nut Cheerios',
      barcode: '000000000007',
      category: 'Grocery',
      costPrice: 2.50,
      salePrice: 4.29,
      quantity: 18,
      reorderThreshold: 6,
      expiryDate: addDays(today, 180),
    },
    {
      name: 'Gala Apples',
      barcode: '000000000008',
      category: 'Produce',
      costPrice: 0.60,
      salePrice: 1.20,
      quantity: 3, // Low stock (3 <= 8)
      reorderThreshold: 8,
      expiryDate: addDays(today, 4), // Expiring in 4 days
    },
    {
      name: 'Cheddar Cheese 8oz',
      barcode: '000000000009',
      category: 'Dairy',
      costPrice: 1.80,
      salePrice: 2.99,
      quantity: 25,
      reorderThreshold: 10,
      expiryDate: addDays(today, 30),
    },
    {
      name: 'Dish Soap 24oz',
      barcode: '000000000010',
      category: 'Grocery',
      costPrice: 1.20,
      salePrice: 2.19,
      quantity: 10,
      reorderThreshold: 3,
      expiryDate: addDays(today, -2), // Expired 2 days ago
    }
  ];

  for (const itemData of sampleItems) {
    await prisma.item.create({
      data: itemData,
    });
  }

  console.log('Database successfully seeded with 10 sample items!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
