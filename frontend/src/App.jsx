import React, { useState, useEffect } from 'react';

// Custom inline SVG Icons (Standard Heroicons-like styles)
const IconDashboard = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const IconCatalog = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const IconStock = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3L21 7L17 11M21 7H9C5.13401 7 2 10.134 2 14V21M7 21L3 17L7 13M3 17H15C18.866 17 22 13.866 22 10V3" />
  </svg>
);

const IconLedger = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconEdit = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconDelete = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconSearch = () => (
  <svg className="search-icon-svg" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const defaultCategories = [
  'Grocery',
  'Dairy',
  'Produce',
  'Personal Care',
  'Beverages',
  'Bakery',
  'Frozen Foods',
  'Household',
];

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
const api = (path) => (path.startsWith('/api') ? `${apiBaseUrl}${path}` : path);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    totalRevenue: 0,
    totalProfit: 0,
    needsAttention: [],
  });

  // Loading/Error State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Catalog Pagination
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogPagination, setCatalogPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Transaction Filters
  const [txFilterType, setTxFilterType] = useState('');
  const [txStartDate, setTxStartDate] = useState('');
  const [txEndDate, setTxEndDate] = useState('');
  const [txSearch, setTxSearch] = useState('');

  // Modals & Item Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formItem, setFormItem] = useState({
    name: '',
    barcode: '',
    category: 'Grocery',
    costPrice: '',
    salePrice: '',
    quantity: '0',
    reorderThreshold: '5',
    expiryDate: '',
  });

  // Stock Management forms state
  const [stockActionType, setStockActionType] = useState('in'); // 'in' or 'out'
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockSearchResults, setStockSearchResults] = useState([]);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [stockQty, setStockQty] = useState('');
  const [supplierNote, setSupplierNote] = useState('');

  // Fetch functions
  const loadDashboard = async () => {
    try {
      const res = await fetch(api('/api/dashboard'));
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve dashboard metrics');
    }
  };

  const loadItems = async (page = catalogPage, search = searchQuery, cat = categoryFilter) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/items?page=${page}&limit=15&search=${encodeURIComponent(search)}&category=${encodeURIComponent(cat)}`;
      const res = await fetch(api(url));
      if (!res.ok) throw new Error('Failed to load catalog');
      const data = await res.json();
      setItems(data.items);
      setCatalogPagination(data.pagination);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve product list');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (
    page = 1,
    type = txFilterType,
    start = txStartDate,
    end = txEndDate,
    search = txSearch
  ) => {
    try {
      const url = `/api/transactions?page=${page}&type=${type}&startDate=${start}&endDate=${end}&search=${encodeURIComponent(search)}`;
      const res = await fetch(api(url));
      if (!res.ok) throw new Error('Failed to load transactions');
      const data = await res.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve activity log');
    }
  };

  // Run on load
  useEffect(() => {
    loadDashboard();
    loadItems(1);
    loadTransactions(1);
  }, []);

  // Set timeout for success alerts
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Set timeout for error alerts
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Real-time Search handler for catalog tab
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setCatalogPage(1);
    loadItems(1, val, categoryFilter);
  };

  // Category filter handler
  const handleCategoryFilterChange = (e) => {
    const val = e.target.value;
    setCategoryFilter(val);
    setCatalogPage(1);
    loadItems(1, searchQuery, val);
  };

  // Real-time search for Stock In/Out forms (dynamic from API)
  useEffect(() => {
    if (stockSearchQuery.trim() === '') {
      setStockSearchResults([]);
      return;
    }
    if (selectedStockItem && stockSearchQuery === selectedStockItem.name) {
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(api(`/api/items?search=${encodeURIComponent(stockSearchQuery)}`));
        if (res.ok) {
          const data = await res.json();
          setStockSearchResults(data.slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching stock search suggestions:", err);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [stockSearchQuery, selectedStockItem]);

  // Form Submissions
  const handleCreateItem = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(api('/api/items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formItem,
          costPrice: parseFloat(formItem.costPrice),
          salePrice: parseFloat(formItem.salePrice),
          quantity: parseInt(formItem.quantity, 10),
          reorderThreshold: parseInt(formItem.reorderThreshold, 10),
          expiryDate: formItem.expiryDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create item');

      setSuccessMsg(`Product "${data.name}" created successfully.`);
      setShowCreateModal(false);
      resetItemForm();
      loadItems();
      loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(api(`/api/items/${selectedItem.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formItem,
          costPrice: parseFloat(formItem.costPrice),
          salePrice: parseFloat(formItem.salePrice),
          quantity: parseInt(formItem.quantity, 10),
          reorderThreshold: parseInt(formItem.reorderThreshold, 10),
          expiryDate: formItem.expiryDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update item');

      setSuccessMsg(`Product "${data.name}" updated successfully.`);
      setShowEditModal(false);
      resetItemForm();
      loadItems();
      loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? All transaction history for it will be lost.')) return;
    setError(null);
    try {
      const res = await fetch(api(`/api/items/${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete item');

      setSuccessMsg('Product deleted successfully.');
      loadItems();
      loadDashboard();
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStockActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStockItem) {
      setError('Please select a product first.');
      return;
    }
    const qty = parseInt(stockQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }

    setError(null);
    const endpoint = stockActionType === 'in' ? 'stock-in' : 'sale';
    const payload = stockActionType === 'in' 
      ? { quantity: qty, note: supplierNote } 
      : { quantity: qty };

    try {
      const res = await fetch(api(`/api/items/${selectedStockItem.id}/${endpoint}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transaction failed');

      setSuccessMsg(
        stockActionType === 'in'
          ? `Logged receipt of ${qty} units for "${data.name}".`
          : `Manual sale of ${qty} units for "${data.name}" recorded.`
      );

      // Reset transaction form
      setSelectedStockItem(null);
      setStockSearchQuery('');
      setStockQty('');
      setSupplierNote('');

      // Reload all data
      loadItems();
      loadDashboard();
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper to open Edit Modal
  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormItem({
      name: item.name,
      barcode: item.barcode || '',
      category: item.category,
      costPrice: item.costPrice.toString(),
      salePrice: item.salePrice.toString(),
      quantity: item.quantity.toString(),
      reorderThreshold: item.reorderThreshold.toString(),
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().substring(0, 10) : '',
    });
    setShowEditModal(true);
  };

  // Helper to pre-select item in Stock Action
  const triggerNeedsAttentionAction = (item, action) => {
    setSelectedStockItem(item);
    setStockActionType(action);
    setStockQty('');
    setSupplierNote(action === 'in' ? 'Restocking low stock / expiring item' : '');
    setStockSearchQuery(item.name);
    setActiveTab('stock');
  };

  const resetItemForm = () => {
    setFormItem({
      name: '',
      barcode: '',
      category: 'Grocery',
      costPrice: '',
      salePrice: '',
      quantity: '0',
      reorderThreshold: '5',
      expiryDate: '',
    });
    setSelectedItem(null);
  };

  const handleExportCatalogCSV = () => {
    fetch(api(`/api/items?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(categoryFilter)}`))
      .then(res => res.json())
      .then(data => {
        const headers = ['Product Name', 'Barcode', 'Category', 'Cost Price ($)', 'Sale Price ($)', 'Stock Quantity', 'Reorder Threshold', 'Expiry Date'];
        const rows = data.map(item => [
          `"${item.name.replace(/"/g, '""')}"`,
          item.barcode ? `"${item.barcode}"` : 'None',
          `"${item.category.replace(/"/g, '""')}"`,
          item.costPrice.toFixed(2),
          item.salePrice.toFixed(2),
          item.quantity,
          item.reorderThreshold,
          item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'None'
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' 
          + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `supermarket_catalog_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => {
        console.error("CSV Export failed:", err);
        setError("Failed to export Catalog CSV");
      });
  };

  const handleExportTransactionsCSV = () => {
    fetch(api(`/api/transactions?limit=10000&type=${txFilterType}&startDate=${txStartDate}&endDate=${txEndDate}&search=${encodeURIComponent(txSearch)}`))
      .then(res => res.json())
      .then(data => {
        const headers = ['Timestamp', 'Product Name', 'Barcode', 'Type', 'Quantity', 'Note / Details', 'Transaction ID'];
        const rows = data.transactions.map(tx => [
          `"${new Date(tx.createdAt).toLocaleString()}"`,
          `"${(tx.item?.name || 'Deleted Product').replace(/"/g, '""')}"`,
          tx.item?.barcode ? `"${tx.item.barcode}"` : 'None',
          tx.type === 'in' ? 'Stock In' : 'Sale',
          tx.quantity,
          `"${(tx.note || '').replace(/"/g, '""')}"`,
          `"${tx.id}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' 
          + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `supermarket_transactions_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => {
        console.error("CSV Export failed:", err);
        setError("Failed to export Transactions CSV");
      });
  };

  // Get dynamic unique categories in current database
  const activeCategories = Array.from(new Set([
    ...defaultCategories,
    ...items.map(i => i.category).filter(Boolean)
  ]));

  return (
    <div className="app-container">
      {/* Top Header Navigation */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">S</div>
            <span className="logo-text">SuperMarket OS</span>
            <span className="logo-badge">Single Store</span>
          </div>

          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <IconDashboard />
              Dashboard
            </button>
            <button 
              className={`nav-tab ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              <IconCatalog />
              Product Catalog
            </button>
            <button 
              className={`nav-tab ${activeTab === 'stock' ? 'active' : ''}`}
              onClick={() => setActiveTab('stock')}
            >
              <IconStock />
              Stock Operations
            </button>
            <button 
              className={`nav-tab ${activeTab === 'ledger' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('ledger');
                loadTransactions(1);
              }}
            >
              <IconLedger />
              Activity Log
            </button>
          </nav>

          <div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                resetItemForm();
                setShowCreateModal(true);
              }}
            >
              <IconPlus /> Add Product
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Global Notifications */}
        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {/* VIEW: Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Metric Summary Cards */}
            <div className="dashboard-grid">
              <div className="stat-card primary">
                <div className="stat-icon">📦</div>
                <div className="stat-details">
                  <span className="stat-value">{dashboardData.totalItems || 0}</span>
                  <span className="stat-label">Catalog Products</span>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon">📈</div>
                <div className="stat-details">
                  <span className="stat-value">{dashboardData.totalStockCount || 0}</span>
                  <span className="stat-label">Total Stock Count</span>
                </div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon">⚠️</div>
                <div className="stat-details">
                  <span className="stat-value">{dashboardData.lowStockCount || 0}</span>
                  <span className="stat-label">Low Stock Items</span>
                </div>
              </div>
              <div className="stat-card secondary" style={{ borderLeft: '4px solid var(--secondary)' }}>
                <div className="stat-icon" style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>⏰</div>
                <div className="stat-details">
                  <span className="stat-value" style={{ color: 'var(--secondary)' }}>{dashboardData.expiringSoonCount || 0}</span>
                  <span className="stat-label">Expiring Soon (7d)</span>
                </div>
              </div>
              <div className="stat-card danger">
                <div className="stat-icon">🛑</div>
                <div className="stat-details">
                  <span className="stat-value">{dashboardData.expiredCount || 0}</span>
                  <span className="stat-label">Expired Products</span>
                </div>
              </div>
            </div>

            {/* Financial Overview Row */}
            <div className="financials-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="stat-card" style={{ borderLeft: '4px solid var(--secondary)', background: 'rgba(0, 242, 254, 0.03)' }}>
                <div className="stat-icon" style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>💵</div>
                <div className="stat-details">
                  <span className="stat-value" style={{ color: 'var(--secondary)' }}>
                    ${(dashboardData.totalRevenue || 0).toFixed(2)}
                  </span>
                  <span className="stat-label">Total Gross Revenue</span>
                </div>
              </div>
              <div className="stat-card" style={{ borderLeft: '4px solid var(--success)', background: 'rgba(16, 185, 129, 0.03)' }}>
                <div className="stat-icon" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>💰</div>
                <div className="stat-details">
                  <span className="stat-value" style={{ color: 'var(--success)' }}>
                    ${(dashboardData.totalProfit || 0).toFixed(2)}
                  </span>
                  <span className="stat-label">Estimated Gross Profit</span>
                </div>
              </div>
            </div>

            {/* Dashboard Sections */}
            <div className="dashboard-sections">
              {/* Needs Attention Column */}
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">⚠️ Needs Immediate Attention</h3>
                    <p className="panel-subtitle">Prioritized list of expiring or low stock items requiring restock/clearance</p>
                  </div>
                </div>

                <div className="attention-list">
                  {dashboardData.needsAttention.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                      🎉 All items are fully stocked and fresh! No actions required.
                    </div>
                  ) : (
                    dashboardData.needsAttention.map(({ item, reason, severity }) => (
                      <div key={item.id} className={`attention-item severity-${severity}`}>
                        <div className="attention-info">
                          <span className="attention-name">{item.name}</span>
                          <div className="attention-meta">
                            <span className="attention-reason-badge">{reason}</span>
                            <span>Stock: <strong>{item.quantity}</strong> / Threshold: <strong>{item.reorderThreshold}</strong></span>
                            {item.expiryDate && (
                              <span>Expires: <strong>{new Date(item.expiryDate).toLocaleDateString()}</strong></span>
                            )}
                          </div>
                        </div>
                        <div className="attention-action">
                          <button 
                            className="btn btn-primary btn-sm btn-icon" 
                            title="Restock In"
                            onClick={() => triggerNeedsAttentionAction(item, 'in')}
                          >
                            📥 Restock
                          </button>
                          {item.quantity > 0 && (
                            <button 
                              className="btn btn-success btn-sm btn-icon" 
                              title="Clearance / Sale"
                              style={{ background: 'var(--success)' }}
                              onClick={() => triggerNeedsAttentionAction(item, 'out')}
                            >
                              🏷️ Sell
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity Mini Log */}
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">📜 Recent Log Entries</h3>
                    <p className="panel-subtitle">Latest changes in store inventory levels</p>
                  </div>
                </div>

                <div className="activity-mini-list">
                  {transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                      No recent activities logged.
                    </div>
                  ) : (
                    transactions.slice(0, 6).map((tx) => (
                      <div key={tx.id} className="activity-mini-item">
                        <div className={`activity-indicator ${tx.type}`} />
                        <div className="activity-details">
                          <div className="activity-text">
                            <strong>{tx.type === 'in' ? 'Stock Received' : 'Sale Recorded'}</strong>: {tx.quantity} units of{' '}
                            <strong>{tx.item?.name || 'Deleted Product'}</strong>
                          </div>
                          <div className="activity-meta">
                            <span>{new Date(tx.createdAt).toLocaleString()}</span>
                            {tx.note && <span>• <em>{tx.note}</em></span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: Product Catalog */}
        {activeTab === 'catalog' && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">📦 Supermarket Catalog</h3>
                <p className="panel-subtitle">Manage store inventory items and reorder thresholds</p>
              </div>
            </div>

            {/* Catalog Search, Filter & Action controls */}
            <div className="view-controls">
              <div className="search-filter-group">
                <div className="input-search-wrapper">
                  <IconSearch />
                  <input
                    type="text"
                    className="input-search"
                    placeholder="Search products by name or barcode..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <select 
                  className="select-filter"
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                >
                  <option value="">All Categories/Aisles</option>
                  {activeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-sm" onClick={handleExportCatalogCSV} title="Export Catalog to CSV">
                📥 Export CSV
              </button>
            </div>

            {/* Catalog Table */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                Loading catalog items...
              </div>
            ) : items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                No items found matching the search criteria.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Barcode</th>
                      <th>Category/Aisle</th>
                      <th>Cost</th>
                      <th>Sale Price</th>
                      <th>Stock Qty</th>
                      <th>Min Threshold</th>
                      <th>Expiry</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const isLowStock = item.quantity <= item.reorderThreshold;
                      const qtyClass = item.quantity === 0 
                        ? 'critical' 
                        : isLowStock 
                          ? 'warning' 
                          : 'normal';

                      return (
                        <tr key={item.id}>
                          <td>
                            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{item.name}</strong>
                          </td>
                          <td>
                            {item.barcode ? (
                              <span className="barcode-text">{item.barcode}</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                            )}
                          </td>
                          <td>
                            <span className="category-tag">{item.category}</span>
                          </td>
                          <td className="price-text">${item.costPrice.toFixed(2)}</td>
                          <td className="price-text" style={{ color: 'var(--secondary)' }}>
                            ${item.salePrice.toFixed(2)}
                          </td>
                          <td>
                            <span className={`qty-badge ${qtyClass}`}>{item.quantity}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.reorderThreshold}</td>
                          <td>
                            {item.expiryDate ? (
                              <span 
                                style={{
                                  color: new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                                    ? 'var(--danger)' 
                                    : 'inherit',
                                  fontWeight: new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                                    ? 'bold' 
                                    : 'normal'
                                }}
                              >
                                {new Date(item.expiryDate).toLocaleDateString()}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                className="btn btn-sm btn-icon"
                                title="Edit Product"
                                onClick={() => openEditModal(item)}
                              >
                                <IconEdit />
                              </button>
                              <button 
                                className="btn btn-sm btn-icon btn-danger"
                                title="Delete Product"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <IconDelete />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Catalog Pagination Controls */}
            {!loading && catalogPagination.totalPages > 1 && (
              <div className="pagination-controls">
                <span>
                  Showing Page <strong>{catalogPagination.page}</strong> of <strong>{catalogPagination.totalPages}</strong> ({catalogPagination.total} total items)
                </span>
                <div className="pagination-buttons">
                  <button
                    className="btn btn-sm"
                    disabled={catalogPagination.page <= 1}
                    onClick={() => {
                      const newPage = catalogPagination.page - 1;
                      setCatalogPage(newPage);
                      loadItems(newPage, searchQuery, categoryFilter);
                    }}
                  >
                    ◀ Previous
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={catalogPagination.page >= catalogPagination.totalPages}
                    onClick={() => {
                      const newPage = catalogPagination.page + 1;
                      setCatalogPage(newPage);
                      loadItems(newPage, searchQuery, categoryFilter);
                    }}
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: Stock Operations */}
        {activeTab === 'stock' && (
          <div className="management-grid">
            {/* Input Form Panel */}
            <div className="panel form-card">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">🔄 Log Stock Adjustment</h3>
                  <p className="panel-subtitle">Manually receive restock items or record catalog sales</p>
                </div>
              </div>

              {/* Action Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    background: stockActionType === 'in' ? 'var(--success)' : 'transparent',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: stockActionType === 'in' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => {
                    setStockActionType('in');
                    setStockQty('');
                  }}
                >
                  📥 Receive Stock (Stock In)
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    background: stockActionType === 'out' ? 'var(--primary)' : 'transparent',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: stockActionType === 'out' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => {
                    setStockActionType('out');
                    setStockQty('');
                  }}
                >
                  🏷️ Record Sale (Stock Out)
                </button>
              </div>

              <form onSubmit={handleStockActionSubmit}>
                {/* 1. Product search & selector */}
                <div className="form-group">
                  <label className="form-label">Search Product by Name or Barcode</label>
                  {!selectedStockItem ? (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Type name or scan barcode..."
                        value={stockSearchQuery}
                        onChange={(e) => setStockSearchQuery(e.target.value)}
                      />
                      {stockSearchResults.length > 0 && (
                        <div className="item-search-results">
                          {stockSearchResults.map(item => (
                            <div
                              key={item.id}
                              className="search-result-item"
                              onClick={() => {
                                setSelectedStockItem(item);
                                setStockSearchQuery(item.name);
                                setStockSearchResults([]);
                              }}
                            >
                              <span>{item.name}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {item.barcode ? `[${item.barcode}]` : ''} Stock: {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="selected-item-display">
                      <div className="selected-item-info">
                        <h4>{selectedStockItem.name}</h4>
                        <p>
                          Category: <strong>{selectedStockItem.category}</strong> | Current Stock: <strong>{selectedStockItem.quantity}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        className="remove-selected-btn"
                        onClick={() => {
                          setSelectedStockItem(null);
                          setStockSearchQuery('');
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Quantity input */}
                <div className="form-group">
                  <label className="form-label">Quantity to {stockActionType === 'in' ? 'Receive' : 'Sell'}</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    className="form-input"
                    placeholder="Enter positive integer"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                  />
                </div>

                {/* Real-time validation warning if sale exceeds stock */}
                {stockActionType === 'out' && selectedStockItem && stockQty && parseInt(stockQty, 10) > selectedStockItem.quantity && (
                  <div className="alert alert-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    <strong>⚠️ Error:</strong> Sale quantity exceeds available stock ({selectedStockItem.quantity}). Transaction will be blocked.
                  </div>
                )}

                {/* Real-time validation warning if product is expired */}
                {selectedStockItem && selectedStockItem.expiryDate && new Date(selectedStockItem.expiryDate) < new Date() && (
                  <div className={`alert ${stockActionType === 'out' ? 'alert-danger' : 'alert-warning'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {stockActionType === 'out' ? (
                      <span><strong>🛑 Error:</strong> Product has EXPIRED ({new Date(selectedStockItem.expiryDate).toLocaleDateString()}) and cannot be sold. Please clear it from shelves.</span>
                    ) : (
                      <span><strong>⚠️ Warning:</strong> Product's catalog expiry date ({new Date(selectedStockItem.expiryDate).toLocaleDateString()}) is in the past. If you are restocking new units, please update the product's expiry date first.</span>
                    )}
                  </div>
                )}

                {/* 3. Note field (for stock-in only) */}
                {stockActionType === 'in' && (
                  <div className="form-group">
                    <label className="form-label">Supplier / Receipt Details (Free Text)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Acme Produce Corp, Invoice #10243"
                      value={supplierNote}
                      onChange={(e) => setSupplierNote(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className={`btn ${stockActionType === 'in' ? 'btn-success' : 'btn-primary'}`}
                  style={{ width: '100%', marginTop: '1rem' }}
                  disabled={
                    !selectedStockItem || 
                    !stockQty || 
                    parseInt(stockQty, 10) <= 0 || 
                    (stockActionType === 'out' && (parseInt(stockQty, 10) > selectedStockItem.quantity || (selectedStockItem.expiryDate && new Date(selectedStockItem.expiryDate) < new Date())))
                  }
                >
                  {stockActionType === 'in' ? '📥 Confirm Stock Receipt' : '🏷️ Log Cash/Manual Sale'}
                </button>
              </form>
            </div>

            {/* Quick References list on the right */}
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">📋 Direct Fast Select</h3>
                  <p className="panel-subtitle">Quickly tap items in need of attention to prefill forms</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dashboardData.needsAttention.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                    No products currently need attention. Check back later!
                  </div>
                ) : (
                  dashboardData.needsAttention.map(({ item, reason }) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onClick={() => {
                        setSelectedStockItem(item);
                        setStockSearchQuery(item.name);
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.9rem', display: 'block' }}>{item.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {reason} (Stock: {item.quantity})
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Prefill ⚡</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: Activity Log (Ledger) */}
        {activeTab === 'ledger' && (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">📜 Audit Activity Log</h3>
                <p className="panel-subtitle">Complete chronological record of stock operations and customer sales</p>
              </div>
            </div>

            {/* Activity Log search & filter controls */}
            <div className="view-controls" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div className="search-filter-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1 }}>
                <div className="input-search-wrapper" style={{ flex: 2, minWidth: '200px' }}>
                  <IconSearch />
                  <input
                    type="text"
                    className="input-search"
                    placeholder="Search by product name or barcode..."
                    value={txSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTxSearch(val);
                      loadTransactions(1, txFilterType, txStartDate, txEndDate, val);
                    }}
                  />
                </div>
                
                <select
                  className="select-filter"
                  style={{ flex: 1, minWidth: '130px' }}
                  value={txFilterType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTxFilterType(val);
                    loadTransactions(1, val, txStartDate, txEndDate, txSearch);
                  }}
                >
                  <option value="">All Types</option>
                  <option value="in">Stock In</option>
                  <option value="out">Sales</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
                  <input
                    type="date"
                    className="form-input"
                    style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                    value={txStartDate}
                    title="Start Date"
                    onChange={(e) => {
                      const val = e.target.value;
                      setTxStartDate(val);
                      loadTransactions(1, txFilterType, val, txEndDate, txSearch);
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>to</span>
                  <input
                    type="date"
                    className="form-input"
                    style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                    value={txEndDate}
                    title="End Date"
                    onChange={(e) => {
                      const val = e.target.value;
                      setTxEndDate(val);
                      loadTransactions(1, txFilterType, txStartDate, val, txSearch);
                    }}
                  />
                </div>
              </div>
              
              <button className="btn btn-sm" onClick={handleExportTransactionsCSV} title="Export Transactions to CSV">
                📥 Export CSV
              </button>
            </div>

            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                No stock transactions logged yet matching the filters.
              </div>
            ) : (
              <div>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Quantity Changed</th>
                        <th>Note / Supplier</th>
                        <th>Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{new Date(tx.createdAt).toLocaleString()}</td>
                          <td>
                            <strong>{tx.item?.name || 'Deleted Product'}</strong>
                          </td>
                          <td>
                            <span 
                              className={`qty-badge ${tx.type === 'in' ? 'normal' : 'primary'}`}
                              style={{ 
                                padding: '0.2rem 0.5rem', 
                                fontSize: '0.75rem', 
                                background: tx.type === 'in' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                color: tx.type === 'in' ? 'var(--success)' : 'var(--primary)',
                                border: 'none'
                              }}
                            >
                              {tx.type === 'in' ? 'Stock In' : 'Sale'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>
                            {tx.type === 'in' ? '+' : '-'}{tx.quantity}
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                              {tx.note || '—'}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {tx.id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer controls */}
                {pagination.totalPages > 1 && (
                  <div className="pagination-controls">
                    <span>
                      Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total logs)
                    </span>
                    <div className="pagination-buttons">
                      <button
                        className="btn btn-sm"
                        disabled={pagination.page <= 1}
                        onClick={() => loadTransactions(pagination.page - 1, txFilterType, txStartDate, txEndDate, txSearch)}
                      >
                        ◀ Previous
                      </button>
                      <button
                        className="btn btn-sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => loadTransactions(pagination.page + 1, txFilterType, txStartDate, txEndDate, txSearch)}
                      >
                        Next ▶
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE DIALOG MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">📦 Add New Catalog Item</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateItem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Heinz Tomato Ketchup 20oz"
                    value={formItem.name}
                    onChange={(e) => setFormItem({ ...formItem, name: e.target.value })}
                  />
                </div>

                <div className="form-group row-2">
                  <div>
                    <label className="form-label">Barcode (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 0120000001"
                      value={formItem.barcode}
                      onChange={(e) => setFormItem({ ...formItem, barcode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Category / Aisle *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Grocery"
                      list="categories-list"
                      value={formItem.category}
                      onChange={(e) => setFormItem({ ...formItem, category: e.target.value })}
                    />
                    <datalist id="categories-list">
                      {activeCategories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="form-group row-2">
                  <div>
                    <label className="form-label">Cost Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="form-input"
                      placeholder="e.g. 1.25"
                      value={formItem.costPrice}
                      onChange={(e) => setFormItem({ ...formItem, costPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Sale Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="form-input"
                      placeholder="e.g. 2.49"
                      value={formItem.salePrice}
                      onChange={(e) => setFormItem({ ...formItem, salePrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group row-2">
                  <div>
                    <label className="form-label">Starting Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input"
                      value={formItem.quantity}
                      onChange={(e) => setFormItem({ ...formItem, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Reorder Limit Threshold</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input"
                      value={formItem.reorderThreshold}
                      onChange={(e) => setFormItem({ ...formItem, reorderThreshold: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formItem.expiryDate}
                    onChange={(e) => setFormItem({ ...formItem, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DIALOG MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">✏️ Edit Product Details</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditItem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formItem.name}
                    onChange={(e) => setFormItem({ ...formItem, name: e.target.value })}
                  />
                </div>

                <div className="form-group row-2">
                  <div>
                    <label className="form-label">Barcode (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formItem.barcode}
                      onChange={(e) => setFormItem({ ...formItem, barcode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Category / Aisle *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Grocery"
                      list="categories-list-edit"
                      value={formItem.category}
                      onChange={(e) => setFormItem({ ...formItem, category: e.target.value })}
                    />
                    <datalist id="categories-list-edit">
                      {activeCategories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="form-group row-2">
                  <div>
                    <label className="form-label">Cost Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="form-input"
                      value={formItem.costPrice}
                      onChange={(e) => setFormItem({ ...formItem, costPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Sale Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="form-input"
                      value={formItem.salePrice}
                      onChange={(e) => setFormItem({ ...formItem, salePrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group row-2">
                  <div>
                    <label className="form-label">Current Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input"
                      value={formItem.quantity}
                      onChange={(e) => setFormItem({ ...formItem, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Reorder Limit Threshold</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input"
                      value={formItem.reorderThreshold}
                      onChange={(e) => setFormItem({ ...formItem, reorderThreshold: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formItem.expiryDate}
                    onChange={(e) => setFormItem({ ...formItem, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
