# Supermarket Inventory Management System (SuperMarket OS)

A premium, neon-styled, responsive single-store inventory management system designed for independent retail operations. It provides real-time stock level tracking, cash/manual sales logs, automated low-stock alerts, expired product warnings, and financial performance metrics.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone or download the repository to your local machine.
2. In the root directory, run the installation script to install all dependencies for the root, backend, and frontend projects:
   ```bash
   npm run install:all
   ```

### Database Setup
The backend utilizes SQLite as its local database, managed via Prisma ORM.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run database migrations to set up tables:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Seed the database with sample products:
   ```bash
   npx prisma db seed
   ```

### Running the Application

To run the backend API and frontend Vite server concurrently, run the following command in the root folder:
```bash
npm run dev
```

- **Frontend:** Runs on [http://localhost:5173](http://localhost:5173)
- **Backend API:** Runs on [http://localhost:5000](http://localhost:5000)

---

## 🛠️ Technology Stack

- **Backend:**
  - Node.js & Express (REST API endpoints)
  - SQLite (Local relational database)
  - Prisma ORM (Database query client and schemas)
- **Frontend:**
  - React (Single Page Application)
  - Vite (Fast development server and bundler)
  - Vanilla CSS (Custom modern neon & cyberpunk dark styling utilizing CSS variables)

---

## 🌟 Key Features

1. **Dashboard Overview:**
   - Real-time KPI summaries for Catalog Products, Total Stock, Low Stock Items, Expiring Soon (7d), and Expired Products.
   - Financial Reporting panel indicating Gross Revenue and Estimated Gross Profit based on logged sales.
   - Prioritized "Needs Immediate Attention" panel listing expired or low stock items requiring restock/clearance.
   - Recent Log Entries list for audit tracking.

2. **Product Catalog Management:**
   - Full CRUD support (Add, View, Edit, and Delete inventory items).
   - Fast server-side search and category/aisle filter dropdown.
   - Catalog pagination for fast loading.
   - Custom Category creation support via autocomplete `<datalist>` inputs.
   - Download full catalog details as CSV.

3. **Stock operations:**
   - Log Stock Adjustments (Receive Stock vs. Record Sales).
   - Real-time dynamic search suggestions querying the backend.
   - Safety blocks preventing cashiers from checking out expired items, and supplier warning alerts if restocking expired goods.

4. **Activity Log (Audit Trail):**
   - Chronological audit ledger detailing transaction types, quantities changed, Note/Supplier details, and UUID transaction references.
   - Dynamic search, In/Out type filters, and date range query selectors.
   - Download filtered activity log as CSV.

---

## 📊 API Endpoint Documentation

### Product Catalog
- **GET `/api/items`** - List products (supports `page`, `limit`, `search`, `category`).
- **POST `/api/items`** - Create a new catalog item.
- **PUT `/api/items/:id`** - Edit product details.
- **DELETE `/api/items/:id`** - Delete item and cascade-delete its history.

### Stock Transactions
- **POST `/api/items/:id/stock-in`** - Record incoming stock.
- **POST `/api/items/:id/sale`** - Record a manual sale (blocks transactions on expired items).
- **GET `/api/transactions`** - List transactions ledger (supports `page`, `limit`, `type`, `startDate`, `endDate`, `search`).

### Dashboard Metrics
- **GET `/api/dashboard`** - Returns aggregated stats, financials, and the Needs Attention priority list.

---

## 🧪 Running Automated Tests

To execute backend route validation tests:
```bash
cd backend
node --test server.test.js
```
