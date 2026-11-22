// Smart Lab Equipment Management System Frontend Controller

let currentPage = 1;
let currentLimit = 10;
let totalPages = 1;
let allCategories = new Set();
let allProductsCache = [];

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initModals();
  initEventListeners();
  loadAllData();
});

// Navigation Handling
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const panes = document.querySelectorAll('.tab-pane');
  const title = document.getElementById('pageTitle');
  const subtitle = document.getElementById('pageSubtitle');

  const tabMeta = {
    catalog: {
      title: 'Equipment Catalog & Inventory',
      subtitle: 'Complete CRUD with field-level Mongoose validation, filtering, and pagination.'
    },
    lowstock: {
      title: 'Low-Stock Inventory Alerts',
      subtitle: 'Equipment falling at or below safe operational reorder thresholds.'
    },
    summary: {
      title: 'Category-wise Inventory Summary',
      subtitle: 'Calculated in real-time via MongoDB Aggregation Pipelines ($group, $project, $sort).'
    },
    assignments: {
      title: 'Student & Faculty Equipment Assignments',
      subtitle: 'Issue, track, and process return inspections for laboratory gear.'
    },
    repairs: {
      title: 'Equipment Repair History',
      subtitle: 'Historical incident logs, damage classifications, and maintenance resolutions.'
    },
    damaged: {
      title: 'Frequently Damaged Equipment Report',
      subtitle: 'Aggregated analytics identifying items with recurrent breakdown velocity.'
    },
    ai: {
      title: 'AI Predictive Maintenance Engine',
      subtitle: 'Statistical heuristic modeling identifying equipment likely to fail before practical exams.'
    }
  };

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      navBtns.forEach((b) => b.classList.remove('active'));
      panes.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`tab-${tabId}`);
      if (targetPane) targetPane.classList.add('active');

      if (tabMeta[tabId]) {
        title.textContent = tabMeta[tabId].title;
        subtitle.textContent = tabMeta[tabId].subtitle;
      }

      // Refresh specific tab data
      if (tabId === 'lowstock') loadLowStock();
      if (tabId === 'summary') loadSummary();
      if (tabId === 'assignments') loadAssignments();
      if (tabId === 'repairs') loadRepairs();
      if (tabId === 'damaged') loadFrequentlyDamaged();
      if (tabId === 'ai') loadAIPredictions();
    });
  });
}

// Modal Handlers
function initModals() {
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      closeModal(modalId);
    });
  });

  // Modal open buttons
  document.getElementById('openAddModalBtn').addEventListener('click', () => {
    document.getElementById('productForm').reset();
    document.getElementById('prodEditId').value = '';
    document.getElementById('productModalTitle').textContent = 'Register New Equipment';
    openModal('productModal');
  });

  document.getElementById('openIssueModalBtn').addEventListener('click', () => {
    populateIssueSelect();
    openModal('issueModal');
  });

  document.getElementById('openRepairModalBtn').addEventListener('click', () => {
    populateRepairSelect();
    openModal('repairModal');
  });

  // Return condition change listener to toggle damage fields
  const returnConditionSelect = document.getElementById('returnConditionSelect');
  if (returnConditionSelect) {
    returnConditionSelect.addEventListener('change', (e) => {
      const damageFields = document.getElementById('damageFields');
      if (e.target.value === 'Damaged' || e.target.value === 'Needs Maintenance') {
        damageFields.style.display = 'block';
      } else {
        damageFields.style.display = 'none';
      }
    });
  }
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

// Event Listeners for Filters & Forms
function initEventListeners() {
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadAllData();
    showToast('Data refreshed successfully');
  });

  // Search with debounce
  let searchTimeout;
  document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      loadProducts();
    }, 300);
  });

  // Filters & Sorting
  document.getElementById('categoryFilter').addEventListener('change', () => {
    currentPage = 1;
    loadProducts();
  });

  document.getElementById('statusFilter').addEventListener('change', () => {
    currentPage = 1;
    loadProducts();
  });

  document.getElementById('sortSelect').addEventListener('change', () => {
    currentPage = 1;
    loadProducts();
  });

  // Pagination
  document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadProducts();
    }
  });

  document.getElementById('nextPageBtn').addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadProducts();
    }
  });

  // Forms
  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
  document.getElementById('stockForm').addEventListener('submit', handleStockSubmit);
  document.getElementById('issueForm').addEventListener('submit', handleIssueSubmit);
  document.getElementById('returnForm').addEventListener('submit', handleReturnSubmit);
  document.getElementById('repairForm').addEventListener('submit', handleRepairSubmit);
}

// Initial Data Load
async function loadAllData() {
  await Promise.all([
    loadProducts(),
    loadLowStock(),
    loadSummary(),
    loadAssignments(),
    loadRepairs(),
    loadFrequentlyDamaged(),
    loadAIPredictions()
  ]);
}

// Fetch & Render Products (CRUD Read with Filter, Sort, Pagination)
async function loadProducts() {
  const search = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;
  const status = document.getElementById('statusFilter').value;
  const [sortBy, order] = document.getElementById('sortSelect').value.split(':');

  const params = new URLSearchParams({
    page: currentPage,
    limit: currentLimit,
    sortBy: sortBy || 'createdAt',
    order: order || 'desc'
  });

  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (status) params.append('status', status);

  try {
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to load products');

    totalPages = data.totalPages || 1;
    document.getElementById('currentPageDisplay').textContent = data.page;
    document.getElementById('prevPageBtn').disabled = data.page <= 1;
    document.getElementById('nextPageBtn').disabled = data.page >= data.totalPages;
    document.getElementById('pageInfo').textContent = `Showing ${data.count} of ${data.total} equipment items`;

    allProductsCache = data.products || [];
    renderProductsTable(allProductsCache);
    updateCategoryDropdown(allProductsCache);
    updateOverviewStats(data.total);
  } catch (err) {
    console.error(err);
    document.getElementById('productsTableBody').innerHTML = `<tr><td colspan="9" class="loading-cell text-danger">${err.message}</td></tr>`;
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('productsTableBody');
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">No equipment found matching criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map((p) => {
      const isLow = p.quantity <= p.reorderLevel;
      const stockVal = p.stockValue !== undefined ? p.stockValue : (p.price * p.quantity);
      return `
        <tr>
          <td>
            <strong>${p.name}</strong>
            ${p.labLocation ? `<br><small class="text-muted">📍 ${p.labLocation}</small>` : ''}
          </td>
          <td><span class="sku-tag">${p.sku}</span></td>
          <td>${p.category}</td>
          <td>₹${Number(p.price).toLocaleString()}</td>
          <td>
            <span class="${isLow ? 'text-danger text-bold' : ''}">${p.quantity}</span>
            ${isLow ? ' ⚠️' : ''}
          </td>
          <td>${p.reorderLevel}</td>
          <td>₹${Number(stockVal).toLocaleString()}</td>
          <td><span class="status-pill ${p.status || 'available'}">${p.status || 'available'}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-outline" onclick="openStockModal('${p._id}', '${p.name.replace(/'/g, "\\'")}', ${p.quantity})">📦 Stock</button>
              <button class="btn btn-sm btn-outline" onclick="editProduct('${p._id}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p._id}', '${p.name.replace(/'/g, "\\'")}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function updateCategoryDropdown(products) {
  products.forEach((p) => allCategories.add(p.category));
  const select = document.getElementById('categoryFilter');
  const curVal = select.value;
  select.innerHTML = '<option value="">All Categories</option>';
  Array.from(allCategories).sort().forEach((cat) => {
    select.innerHTML += `<option value="${cat}" ${curVal === cat ? 'selected' : ''}>${cat}</option>`;
  });
}

function updateOverviewStats(totalCount) {
  document.getElementById('statTotalItems').textContent = totalCount || 0;
}

// Low Stock Report (GET /api/products/low-stock)
async function loadLowStock() {
  try {
    const res = await fetch('/api/products/low-stock');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    document.getElementById('statLowStock').textContent = data.count || 0;
    document.getElementById('lowStockBadge').textContent = data.count || 0;

    const tbody = document.getElementById('lowStockTableBody');
    if (!data.lowStockItems || data.lowStockItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="loading-cell" style="color: #34d399;">✓ All equipment stock levels are healthy!</td></tr>';
      return;
    }

    tbody.innerHTML = data.lowStockItems
      .map((item) => {
        const deficit = Math.max(0, item.reorderLevel - item.quantity);
        return `
          <tr>
            <td><span class="sku-tag">${item.sku}</span></td>
            <td><strong>${item.name}</strong></td>
            <td>${item.category}</td>
            <td class="text-danger text-bold">${item.quantity}</td>
            <td>${item.reorderLevel}</td>
            <td class="text-danger">+${deficit} units needed</td>
            <td>${item.supplier}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="openStockModal('${item._id}', '${item.name.replace(/'/g, "\\'")}', ${item.quantity})">⚡ Quick Restock</button>
            </td>
          </tr>
        `;
      })
      .join('');
  } catch (err) {
    console.error(err);
  }
}

// Category Summary Report (GET /api/products/summary)
async function loadSummary() {
  try {
    const res = await fetch('/api/products/summary');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const grid = document.getElementById('categorySummaryGrid');
    let totalUnits = 0;
    let totalVal = 0;

    if (!data.summary || data.summary.length === 0) {
      grid.innerHTML = '<p class="loading-cell">No categories found.</p>';
      return;
    }

    grid.innerHTML = data.summary
      .map((cat) => {
        totalUnits += cat.totalQuantity;
        totalVal += cat.totalStockValue;
        return `
          <div class="summary-card">
            <div class="summary-card-header">
              <span class="summary-category-title">${cat._id}</span>
              <span class="status-pill available">${cat.totalItems} Items</span>
            </div>
            <div class="summary-stats-list">
              <div class="summary-stat-row">
                <span>Total Quantity in Lab:</span>
                <strong>${cat.totalQuantity} units</strong>
              </div>
              <div class="summary-stat-row">
                <span>Total Stock Valuation:</span>
                <strong>₹${Number(cat.totalStockValue).toLocaleString()}</strong>
              </div>
              <div class="summary-stat-row">
                <span>Average Unit Price:</span>
                <strong>₹${Number(cat.avgPrice).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    document.getElementById('statTotalUnits').textContent = totalUnits;
    document.getElementById('statTotalValue').textContent = `₹${totalVal.toLocaleString()}`;
  } catch (err) {
    console.error(err);
  }
}

// Active Assignments (GET /api/assignments/active)
async function loadAssignments() {
  try {
    const res = await fetch('/api/assignments/active');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const tbody = document.getElementById('assignmentsTableBody');
    if (!data.assignments || data.assignments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="loading-cell">No active loans. All equipment is safely stored in labs.</td></tr>';
      return;
    }

    tbody.innerHTML = data.assignments
      .map((a) => {
        const issueDateStr = new Date(a.issueDate).toLocaleDateString();
        const returnDateStr = new Date(a.expectedReturnDate).toLocaleDateString();
        return `
          <tr>
            <td><span class="sku-tag">${a.equipmentSku}</span></td>
            <td><strong>${a.equipmentName}</strong></td>
            <td>${a.borrowerName} <br><small class="text-muted">(${a.borrowerId})</small></td>
            <td>${a.borrowerRole}</td>
            <td>${a.department}</td>
            <td>${a.labRoom}</td>
            <td>${issueDateStr}</td>
            <td class="${a.isOverdue ? 'text-danger text-bold' : ''}">${returnDateStr} ${a.isOverdue ? '⚠️ Overdue' : ''}</td>
            <td><span class="status-pill ${a.isOverdue ? 'damaged' : 'issued'}">${a.isOverdue ? 'Overdue' : 'Active'}</span></td>
            <td>
              <button class="btn btn-sm btn-success" onclick="openReturnModal('${a._id}', '${a.equipmentName.replace(/'/g, "\\'")}', '${a.borrowerName.replace(/'/g, "\\'")}')">📥 Process Return</button>
            </td>
          </tr>
        `;
      })
      .join('');
  } catch (err) {
    console.error(err);
  }
}

// Repair History (GET /api/repairs)
async function loadRepairs() {
  try {
    const res = await fetch('/api/repairs');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const tbody = document.getElementById('repairsTableBody');
    if (!data.repairs || data.repairs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">No repair records logged yet.</td></tr>';
      return;
    }

    tbody.innerHTML = data.repairs
      .map((r) => {
        const dateStr = new Date(r.reportedDate).toLocaleDateString();
        const isResolved = r.status === 'Completed';
        return `
          <tr>
            <td>${dateStr}</td>
            <td><span class="sku-tag">${r.equipmentSku}</span></td>
            <td><strong>${r.equipmentName}</strong></td>
            <td><span class="status-pill maintenance">${r.damageType}</span></td>
            <td>${r.issueDescription}</td>
            <td>₹${Number(r.repairCost).toLocaleString()}</td>
            <td>${r.technician}</td>
            <td><span class="status-pill ${isResolved ? 'available' : 'damaged'}">${r.status}</span></td>
            <td>
              ${
                !isResolved
                  ? `<button class="btn btn-sm btn-outline" onclick="resolveRepair('${r._id}')">✓ Mark Resolved</button>`
                  : '<small class="text-muted">Closed</small>'
              }
            </td>
          </tr>
        `;
      })
      .join('');
  } catch (err) {
    console.error(err);
  }
}

// Frequently Damaged Equipment (GET /api/reports/frequently-damaged)
async function loadFrequentlyDamaged() {
  try {
    const res = await fetch('/api/reports/frequently-damaged');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const tbody = document.getElementById('damagedTableBody');
    if (!data.report || data.report.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">No equipment damage data available.</td></tr>';
      return;
    }

    tbody.innerHTML = data.report
      .map((item, idx) => {
        const lastDate = item.lastDamagedDate ? new Date(item.lastDamagedDate).toLocaleDateString() : 'N/A';
        return `
          <tr>
            <td><strong>#${idx + 1}</strong></td>
            <td><span class="sku-tag">${item.sku}</span></td>
            <td><strong>${item.name}</strong></td>
            <td>${item.category}</td>
            <td class="text-danger text-bold">${item.damageCount} failures</td>
            <td>₹${item.totalRepairCost.toLocaleString()}</td>
            <td>₹${item.avgRepairCost.toLocaleString()}</td>
            <td>${(item.damageTypes || []).join(', ') || 'N/A'}</td>
            <td>${lastDate}</td>
          </tr>
        `;
      })
      .join('');
  } catch (err) {
    console.error(err);
  }
}

// AI Predictive Maintenance (GET /api/ai/predictive-maintenance)
async function loadAIPredictions() {
  try {
    const res = await fetch('/api/ai/predictive-maintenance');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    document.getElementById('aiCriticalCount').textContent = data.overview.criticalCount;
    document.getElementById('aiHighCount').textContent = data.overview.highCount;
    document.getElementById('aiModerateCount').textContent = data.overview.moderateCount;
    document.getElementById('aiLowCount').textContent = data.overview.lowCount;

    const container = document.getElementById('aiPredictionsContainer');
    if (!data.predictions || data.predictions.length === 0) {
      container.innerHTML = '<p class="loading-cell">No predictions available.</p>';
      return;
    }

    container.innerHTML = data.predictions
      .map((p) => {
        const levelClass = p.riskLevel.toLowerCase();
        return `
          <div class="ai-card ${levelClass}">
            <div class="ai-card-top">
              <div>
                <span class="sku-tag">${p.sku}</span>
                <h4 class="ai-card-title">${p.name}</h4>
                <small class="text-muted">${p.category} | Status: ${p.currentStatus}</small>
              </div>
              <span class="risk-pill ${levelClass}">${p.riskLevel} RISK</span>
            </div>

            <div class="meter-wrapper">
              <div class="meter-label-row">
                <span>Failure Risk Score</span>
                <strong>${p.riskScore} / 100 (${p.failureProbability})</strong>
              </div>
              <div class="meter-bar">
                <div class="meter-fill ${levelClass}" style="width: ${p.riskScore}%;"></div>
              </div>
            </div>

            <div class="summary-stat-row" style="font-size: 12.5px;">
              <span>Predicted Days to Failure:</span>
              <strong>${p.estimatedDaysToMaintenance} days</strong>
            </div>

            <div class="summary-stat-row" style="font-size: 12.5px;">
              <span>Total Historical Repairs:</span>
              <strong>${p.totalHistoricalRepairs} incidents (₹${Number(p.totalRepairCost).toLocaleString()})</strong>
            </div>

            <div class="ai-factors">
              <strong>Triggering Risk Factors:</strong>
              <ul>
                ${p.riskFactors.map((f) => `<li>${f}</li>`).join('')}
              </ul>
            </div>

            <div class="ai-recommendation">
              <strong>🤖 AI Maintenance Advisory:</strong>
              <div style="margin-top: 4px;">${p.recommendations.join(' ')}</div>
            </div>
          </div>
        `;
      })
      .join('');
  } catch (err) {
    console.error(err);
  }
}

// Handlers for Forms
async function handleProductSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('prodEditId').value;
  const payload = {
    name: document.getElementById('prodName').value.trim(),
    sku: document.getElementById('prodSku').value.trim().toUpperCase(),
    category: document.getElementById('prodCategory').value.trim(),
    supplier: document.getElementById('prodSupplier').value.trim(),
    price: Number(document.getElementById('prodPrice').value),
    quantity: Number(document.getElementById('prodQuantity').value),
    reorderLevel: Number(document.getElementById('prodReorderLevel').value),
    labLocation: document.getElementById('prodLabLocation').value.trim(),
    serialNumber: document.getElementById('prodSerialNumber').value.trim()
  };

  try {
    const url = id ? `/api/products/${id}` : '/api/products';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Operation failed');

    showToast(id ? 'Equipment updated successfully' : 'Equipment registered successfully');
    closeModal('productModal');
    loadAllData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function handleStockSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('stockProdId').value;
  const change = Number(document.getElementById('stockChangeInput').value);

  try {
    const res = await fetch(`/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ change })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Stock adjustment failed');

    showToast('Stock level updated successfully');
    closeModal('stockModal');
    loadAllData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function handleIssueSubmit(e) {
  e.preventDefault();
  const payload = {
    equipmentId: document.getElementById('issueEquipmentSelect').value,
    borrowerName: document.getElementById('issueBorrowerName').value.trim(),
    borrowerId: document.getElementById('issueBorrowerId').value.trim(),
    borrowerRole: document.getElementById('issueBorrowerRole').value,
    department: document.getElementById('issueDepartment').value.trim(),
    labRoom: document.getElementById('issueLabRoom').value.trim() || 'Lab 301',
    expectedReturnDate: document.getElementById('issueExpectedReturn').value,
    remarks: document.getElementById('issueRemarks').value.trim()
  };

  try {
    const res = await fetch('/api/assignments/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to issue equipment');

    showToast('Equipment issued successfully');
    closeModal('issueModal');
    document.getElementById('issueForm').reset();
    loadAllData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function handleReturnSubmit(e) {
  e.preventDefault();
  const assignmentId = document.getElementById('returnAssignmentId').value;
  const returnCondition = document.getElementById('returnConditionSelect').value;
  const damageDescription = document.getElementById('damageDescInput').value.trim();
  const repairCost = Number(document.getElementById('damageCostInput').value) || 0;
  const remarks = document.getElementById('returnRemarks').value.trim();

  try {
    const res = await fetch('/api/assignments/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignmentId,
        returnCondition,
        damageDescription,
        repairCost,
        remarks
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Return processing failed');

    showToast('Return recorded successfully');
    closeModal('returnModal');
    document.getElementById('returnForm').reset();
    loadAllData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function handleRepairSubmit(e) {
  e.preventDefault();
  const payload = {
    equipmentId: document.getElementById('repairEquipmentSelect').value,
    damageType: document.getElementById('repairDamageType').value,
    repairCost: Number(document.getElementById('repairCost').value),
    technician: document.getElementById('repairTechnician').value.trim() || 'Campus IT Lab Support',
    status: document.getElementById('repairStatus').value,
    issueDescription: document.getElementById('repairDescription').value.trim()
  };

  try {
    const res = await fetch('/api/repairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to log repair');

    showToast('Repair logged successfully');
    closeModal('repairModal');
    document.getElementById('repairForm').reset();
    loadAllData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// Global modal triggering helpers
window.openStockModal = function (id, name, currentQty) {
  document.getElementById('stockProdId').value = id;
  document.getElementById('stockProdName').textContent = name;
  document.getElementById('currentStockVal').textContent = currentQty;
  document.getElementById('stockChangeInput').value = '';
  openModal('stockModal');
};

window.editProduct = async function (id) {
  try {
    const res = await fetch(`/api/products/${id}`);
    const p = await res.json();
    if (!res.ok) throw new Error(p.message);

    document.getElementById('prodEditId').value = p._id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodSku').value = p.sku;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodSupplier').value = p.supplier;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodQuantity').value = p.quantity;
    document.getElementById('prodReorderLevel').value = p.reorderLevel;
    document.getElementById('prodLabLocation').value = p.labLocation || '';
    document.getElementById('prodSerialNumber').value = p.serialNumber || '';
    document.getElementById('productModalTitle').textContent = 'Edit Equipment Details';
    openModal('productModal');
  } catch (err) {
    alert(`Failed to load details: ${err.message}`);
  }
};

window.deleteProduct = async function (id, name) {
  if (!confirm(`Are you sure you want to delete '${name}' from inventory?`)) return;

  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('Equipment deleted successfully');
    loadAllData();
  } catch (err) {
    alert(`Delete failed: ${err.message}`);
  }
};

window.openReturnModal = function (assignmentId, equipmentName, borrowerName) {
  document.getElementById('returnAssignmentId').value = assignmentId;
  document.getElementById('returnDesc').textContent = `Processing return of '${equipmentName}' borrowed by ${borrowerName}.`;
  document.getElementById('damageFields').style.display = 'none';
  document.getElementById('returnConditionSelect').value = 'Good';
  openModal('returnModal');
};

window.resolveRepair = async function (repairId) {
  const notes = prompt('Enter resolution notes (e.g., Replaced faulty capacitor, bench tested):');
  if (notes === null) return;

  try {
    const res = await fetch(`/api/repairs/${repairId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionNotes: notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('Repair resolved. Equipment returned to active pool.');
    loadAllData();
  } catch (err) {
    alert(`Resolve failed: ${err.message}`);
  }
};

function populateIssueSelect() {
  const select = document.getElementById('issueEquipmentSelect');
  select.innerHTML = '<option value="">Choose available equipment...</option>';
  allProductsCache
    .filter((p) => p.quantity > 0 && p.status !== 'damaged' && p.status !== 'maintenance')
    .forEach((p) => {
      select.innerHTML += `<option value="${p._id}">${p.name} (${p.sku}) - Available: ${p.quantity}</option>`;
    });
}

function populateRepairSelect() {
  const select = document.getElementById('repairEquipmentSelect');
  select.innerHTML = '<option value="">Select equipment...</option>';
  allProductsCache.forEach((p) => {
    select.innerHTML += `<option value="${p._id}">${p.name} (${p.sku}) [${p.status}]</option>`;
  });
}
