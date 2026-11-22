// Smart Lab Equipment Management System - Client Controller
// Supports both Local Express Backend (/api/*) and GitHub Pages Client-Side Simulation

const isGitHubPages = window.location.hostname.includes('github.io');
let currentPage = 1;
let currentLimit = 10;
let totalPages = 1;
let allCategories = new Set();
let allProductsCache = [];

// Seed Data for GitHub Pages / Offline Client-Side Engine
const SEED_PRODUCTS = [
  {
    _id: "6a54767af6123427d6e61d76",
    id: "6a54767af6123427d6e61d76",
    name: "Study Table",
    sku: "FURN-TB-812",
    category: "Furniture",
    price: 3999,
    quantity: 2,
    reorderLevel: 4,
    supplier: "IKEA India",
    status: "available",
    labLocation: "Design Studio Lab 105",
    serialNumber: "IK-TB-812-A",
    condition: "Good",
    totalIssuesCount: 3,
    totalRepairsCount: 0,
    totalRepairCost: 0,
    stockValue: 7998,
    createdAt: "2026-07-13T05:24:10.351Z",
    updatedAt: "2026-07-13T05:24:10.351Z"
  },
  {
    _id: "6a547727f6123427d6e61d7c",
    id: "6a547727f6123427d6e61d7c",
    name: "Gel Pen Pack of 15",
    sku: "STNY-PN-713",
    category: "Stationery",
    price: 120,
    quantity: 40,
    reorderLevel: 20,
    supplier: "Cello Pens",
    status: "available",
    labLocation: "Faculty Stationery Store",
    serialNumber: "CP-713-BATCH",
    condition: "New",
    totalIssuesCount: 5,
    totalRepairsCount: 0,
    totalRepairCost: 0,
    stockValue: 4800,
    createdAt: "2026-07-13T05:27:03.054Z",
    updatedAt: "2026-07-13T05:27:03.054Z"
  },
  {
    _id: "6a54767af6123427d6e61d80",
    id: "6a54767af6123427d6e61d80",
    name: "Dell OptiPlex 7090 Desktop",
    sku: "LAB-PC-701",
    category: "Computers",
    price: 65000,
    quantity: 18,
    reorderLevel: 5,
    supplier: "Dell India Enterprise",
    status: "available",
    labLocation: "Computer Lab 301 - Row A",
    serialNumber: "DL-7090-001",
    condition: "Good",
    totalIssuesCount: 14,
    totalRepairsCount: 1,
    totalRepairCost: 3500,
    stockValue: 1170000,
    lastMaintenanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z"
  },
  {
    _id: "6a54767af6123427d6e61d81",
    id: "6a54767af6123427d6e61d81",
    name: "HP ZBook Studio Workstation",
    sku: "LAB-PC-802",
    category: "Computers",
    price: 115000,
    quantity: 2,
    reorderLevel: 4,
    supplier: "HP Direct Commercial",
    status: "available",
    labLocation: "Advanced AI/ML Lab - Room 405",
    serialNumber: "HP-ZB-992",
    condition: "Good",
    totalIssuesCount: 22,
    totalRepairsCount: 3,
    totalRepairCost: 18500,
    stockValue: 230000,
    lastMaintenanceDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-05-15T10:00:00.000Z",
    updatedAt: "2026-07-05T10:00:00.000Z"
  },
  {
    _id: "6a54767af6123427d6e61d82",
    id: "6a54767af6123427d6e61d82",
    name: "Epson EB-E01 3LCD Projector",
    sku: "LAB-PROJ-101",
    category: "Projectors",
    price: 38500,
    quantity: 1,
    reorderLevel: 2,
    supplier: "Epson Audio-Visuals",
    status: "available",
    labLocation: "Lecture Hall 102 & Lab 301",
    serialNumber: "EP-PROJ-3301",
    condition: "Fair",
    totalIssuesCount: 35,
    totalRepairsCount: 4,
    totalRepairCost: 22000,
    stockValue: 38500,
    lastMaintenanceDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-04-10T10:00:00.000Z",
    updatedAt: "2026-07-10T10:00:00.000Z"
  },
  {
    _id: "6a54767af6123427d6e61d83",
    id: "6a54767af6123427d6e61d83",
    name: "BenQ 4K Smart Classroom Projector",
    sku: "LAB-PROJ-202",
    category: "Projectors",
    price: 82000,
    quantity: 3,
    reorderLevel: 2,
    supplier: "BenQ Solutions",
    status: "available",
    labLocation: "Seminar Hall 2",
    serialNumber: "BQ-4K-8812",
    condition: "Good",
    totalIssuesCount: 8,
    totalRepairsCount: 1,
    totalRepairCost: 4500,
    stockValue: 246000,
    lastMaintenanceDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-05-20T10:00:00.000Z",
    updatedAt: "2026-07-02T10:00:00.000Z"
  },
  {
    _id: "6a54767af6123427d6e61d84",
    id: "6a54767af6123427d6e61d84",
    name: "Keychron V1 Mechanical Keyboard",
    sku: "LAB-KB-301",
    category: "Keyboards",
    price: 6499,
    quantity: 24,
    reorderLevel: 10,
    supplier: "Keychron India",
    status: "available",
    labLocation: "Competitive Coding Lab",
    serialNumber: "KC-V1-401",
    condition: "Good",
    totalIssuesCount: 40,
    totalRepairsCount: 5,
    totalRepairCost: 4200,
    stockValue: 155976,
    lastMaintenanceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-07-12T10:00:00.000Z"
  },
  {
    _id: "6a54767af6123427d6e61d85",
    id: "6a54767af6123427d6e61d85",
    name: "Logitech K120 Spill-Resistant Keyboard",
    sku: "LAB-KB-102",
    category: "Keyboards",
    price: 599,
    quantity: 45,
    reorderLevel: 15,
    supplier: "Logitech Business",
    status: "available",
    labLocation: "General Computing Lab 1",
    serialNumber: "LOG-K120-BATCH-A",
    condition: "Good",
    totalIssuesCount: 12,
    totalRepairsCount: 2,
    totalRepairCost: 600,
    stockValue: 26955,
    lastMaintenanceDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-06-10T10:00:00.000Z",
    updatedAt: "2026-07-08T10:00:00.000Z"
  },
  {
    _id: "6a54767af6123427d6e61d86",
    id: "6a54767af6123427d6e61d86",
    name: "Rigol DS1054Z Digital Storage Oscilloscope",
    sku: "LAB-EQ-OSC-01",
    category: "Lab Equipment",
    price: 36000,
    quantity: 6,
    reorderLevel: 3,
    supplier: "Rigol Test Instruments",
    status: "available",
    labLocation: "Electronics Hardware Lab 204",
    serialNumber: "RIG-DS1-8841",
    condition: "Good",
    totalIssuesCount: 19,
    totalRepairsCount: 2,
    totalRepairCost: 7500,
    stockValue: 216000,
    lastMaintenanceDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-04-18T10:00:00.000Z",
    updatedAt: "2026-07-03T10:00:00.000Z"
  },
  {
    _id: "6a54767af6123427d6e61d87",
    id: "6a54767af6123427d6e61d87",
    name: "Keysight 34461A 6.5 Digit Multimeter",
    sku: "LAB-EQ-DMM-05",
    category: "Lab Equipment",
    price: 94000,
    quantity: 2,
    reorderLevel: 3,
    supplier: "Keysight Technologies",
    status: "available",
    labLocation: "VLSI & Precision Lab",
    serialNumber: "KS-344-9901",
    condition: "Good",
    totalIssuesCount: 11,
    totalRepairsCount: 1,
    totalRepairCost: 6000,
    stockValue: 188000,
    lastMaintenanceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-05-12T10:00:00.000Z",
    updatedAt: "2026-07-04T10:00:00.000Z"
  },
  {
    _id: "6a54767af6123427d6e61d88",
    id: "6a54767af6123427d6e61d88",
    name: "Raspberry Pi 4 Model B (8GB RAM)",
    sku: "LAB-DEV-RPI-4B",
    category: "Electronics",
    price: 7800,
    quantity: 15,
    reorderLevel: 5,
    supplier: "Element14 Electronics",
    status: "available",
    labLocation: "IoT & Embedded Systems Lab",
    serialNumber: "RPI4B-BATCH-3",
    condition: "Good",
    totalIssuesCount: 28,
    totalRepairsCount: 3,
    totalRepairCost: 2400,
    stockValue: 117000,
    lastMaintenanceDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-05-25T10:00:00.000Z",
    updatedAt: "2026-07-11T10:00:00.000Z"
  },
  {
    _id: "6a54767af6123427d6e61d89",
    id: "6a54767af6123427d6e61d89",
    name: "Arduino Mega 2560 Pro Kit",
    sku: "LAB-DEV-ARD-2560",
    category: "Electronics",
    price: 2450,
    quantity: 3,
    reorderLevel: 8,
    supplier: "Robu.in Embedded Labs",
    status: "available",
    labLocation: "Robotics Workshop Room 108",
    serialNumber: "ARD-MEGA-044",
    condition: "Fair",
    totalIssuesCount: 31,
    totalRepairsCount: 4,
    totalRepairCost: 3100,
    stockValue: 7350,
    lastMaintenanceDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: "2026-04-20T10:00:00.000Z",
    updatedAt: "2026-07-09T10:00:00.000Z"
  }
];

const SEED_ASSIGNMENTS = [
  {
    _id: "asgn_01",
    equipment: "6a54767af6123427d6e61d80",
    equipmentSku: "LAB-PC-701",
    equipmentName: "Dell OptiPlex 7090 Desktop",
    borrowerName: "Aarav Sharma",
    borrowerId: "STU-CS-2024-041",
    borrowerRole: "Student",
    department: "Computer Science",
    labRoom: "Lab 301",
    issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expectedReturnDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Active",
    remarks: "Issued for Capstone Project Deep Learning experimentation"
  },
  {
    _id: "asgn_02",
    equipment: "6a54767af6123427d6e61d82",
    equipmentSku: "LAB-PROJ-101",
    equipmentName: "Epson EB-E01 3LCD Projector",
    borrowerName: "Dr. Priya Ramanathan",
    borrowerId: "FAC-IT-109",
    borrowerRole: "Faculty",
    department: "Information Technology",
    labRoom: "Lecture Hall 102",
    issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expectedReturnDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Active",
    remarks: "Issued for Guest Lecture presentation"
  }
];

const SEED_REPAIRS = [
  {
    _id: "rep_01",
    equipment: "6a54767af6123427d6e61d82",
    equipmentSku: "LAB-PROJ-101",
    equipmentName: "Epson EB-E01 3LCD Projector",
    category: "Projectors",
    damageType: "Component Breakdown",
    issueDescription: "Projector lamp discoloration on left lens quadrant.",
    repairCost: 9500,
    technician: "Epson Authorized Care",
    status: "Completed",
    reportedDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "rep_02",
    equipment: "6a54767af6123427d6e61d82",
    equipmentSku: "LAB-PROJ-101",
    equipmentName: "Epson EB-E01 3LCD Projector",
    category: "Projectors",
    damageType: "Electrical Failure",
    issueDescription: "Cooling exhaust fan stopped rotating, emergency thermal shutdown.",
    repairCost: 6500,
    technician: "Epson Authorized Care",
    status: "Completed",
    reportedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "rep_03",
    equipment: "6a54767af6123427d6e61d84",
    equipmentSku: "LAB-KB-301",
    equipmentName: "Keychron V1 Mechanical Keyboard",
    category: "Keyboards",
    damageType: "Accidental Damage",
    issueDescription: "Liquid spill on spacebar and right shift key.",
    repairCost: 1200,
    technician: "Campus Hardware Workshop",
    status: "Completed",
    reportedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "rep_04",
    equipment: "6a54767af6123427d6e61d81",
    equipmentSku: "LAB-PC-802",
    equipmentName: "HP ZBook Studio Workstation",
    category: "Computers",
    damageType: "Component Breakdown",
    issueDescription: "SMPS primary rail voltage drop.",
    repairCost: 11000,
    technician: "HP Enterprise Service",
    status: "Completed",
    reportedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initialize LocalStorage Data Store
function initStorage() {
  if (!localStorage.getItem('smartlab_products')) {
    localStorage.setItem('smartlab_products', JSON.stringify(SEED_PRODUCTS));
  }
  if (!localStorage.getItem('smartlab_assignments')) {
    localStorage.setItem('smartlab_assignments', JSON.stringify(SEED_ASSIGNMENTS));
  }
  if (!localStorage.getItem('smartlab_repairs')) {
    localStorage.setItem('smartlab_repairs', JSON.stringify(SEED_REPAIRS));
  }
}
initStorage();

function getStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Client-Side AI Prediction Engine
function computeClientAIPredictions() {
  const products = getStore('smartlab_products');
  const allRepairs = getStore('smartlab_repairs');
  const allAssignments = getStore('smartlab_assignments');

  const predictions = products.map((prod) => {
    const repairs = allRepairs.filter((r) => r.equipment === prod._id || r.equipmentSku === prod.sku);
    const assignments = allAssignments.filter((a) => a.equipment === prod._id || a.equipmentSku === prod.sku);

    const totalRepairs = repairs.length;
    const totalRepairCost = repairs.reduce((acc, curr) => acc + (Number(curr.repairCost) || 0), 0);
    const totalUsageCount = assignments.length;

    let riskScore = 15;
    const riskFactors = [];
    const recommendations = [];

    if (totalRepairs >= 4) {
      riskScore += 35;
      riskFactors.push(`High failure frequency: ${totalRepairs} historical repairs logged`);
    } else if (totalRepairs >= 2) {
      riskScore += 20;
      riskFactors.push(`Moderate failure frequency: ${totalRepairs} historical repairs logged`);
    } else if (totalRepairs === 1) {
      riskScore += 10;
      riskFactors.push('1 previous repair logged');
    }

    const costRatio = prod.price > 0 ? (totalRepairCost / prod.price) * 100 : 0;
    if (costRatio >= 50) {
      riskScore += 30;
      riskFactors.push(`Severe economic depreciation: Total repair cost is ${costRatio.toFixed(1)}% of asset price`);
    } else if (costRatio >= 25) {
      riskScore += 15;
      riskFactors.push(`Noticeable cumulative repair expense: ${costRatio.toFixed(1)}% of asset price`);
    }

    if (totalUsageCount > 15) {
      riskScore += 20;
      riskFactors.push(`High circulation stress: Issued ${totalUsageCount} times`);
    }

    if (prod.category.toLowerCase().includes('projector')) {
      riskScore += 10;
      riskFactors.push('Projector optical & lamp thermal degradation vulnerability');
    } else if (prod.category.toLowerCase().includes('keyboard')) {
      riskScore += 5;
      riskFactors.push('Mechanical contact switch dust & liquid spill risk');
    }

    if (prod.status === 'damaged') riskScore = Math.max(riskScore, 90);
    riskScore = Math.min(100, Math.max(5, riskScore));

    let riskLevel = 'LOW';
    let estimatedDaysToMaintenance = 90;

    if (riskScore >= 75) {
      riskLevel = 'CRITICAL';
      estimatedDaysToMaintenance = Math.max(3, 14 - totalRepairs * 2);
      recommendations.push('Immediate preventive servicing or bench testing required.');
      if (costRatio >= 50) {
        recommendations.push('Decommissioning Advisory: Further repairs exceed asset value. Consider replacement.');
      } else {
        recommendations.push('Check power supply units (SMPS), capacitors, and thermal paste.');
      }
    } else if (riskScore >= 50) {
      riskLevel = 'HIGH';
      estimatedDaysToMaintenance = 21;
      recommendations.push('Schedule preventive inspection within the next 2-3 weeks.');
    } else if (riskScore >= 25) {
      riskLevel = 'MODERATE';
      estimatedDaysToMaintenance = 45;
      recommendations.push('Standard quarterly checkup recommended.');
    } else {
      riskLevel = 'LOW';
      estimatedDaysToMaintenance = 120;
      recommendations.push('Equipment operating within optimal healthy parameters.');
    }

    return {
      equipmentId: prod._id,
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      currentStatus: prod.status || 'available',
      riskScore,
      riskLevel,
      failureProbability: `${Math.min(98, Math.round(riskScore * 0.95))}%`,
      estimatedDaysToMaintenance,
      totalHistoricalRepairs: totalRepairs,
      totalRepairCost,
      riskFactors,
      recommendations
    };
  });

  predictions.sort((a, b) => b.riskScore - a.riskScore);
  return {
    success: true,
    overview: {
      criticalCount: predictions.filter((p) => p.riskLevel === 'CRITICAL').length,
      highCount: predictions.filter((p) => p.riskLevel === 'HIGH').length,
      moderateCount: predictions.filter((p) => p.riskLevel === 'MODERATE').length,
      lowCount: predictions.filter((p) => p.riskLevel === 'LOW').length
    },
    predictions
  };
}

// Client-Side Simulated API Request Dispatcher
async function apiRequest(endpoint, options = {}) {
  // If running locally, attempt real backend first
  if (!isGitHubPages) {
    try {
      const res = await fetch(endpoint, options);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Backend not running locally, seamlessly fall through to simulation
    }
  }

  // Simulated Client-Side Logic
  const method = (options.method || 'GET').toUpperCase();
  const urlParts = endpoint.split('?');
  const path = urlParts[0];
  const queryParams = new URLSearchParams(urlParts[1] || '');

  // 1. GET /api/products
  if (path === '/api/products' && method === 'GET') {
    let prods = getStore('smartlab_products');
    const search = queryParams.get('search');
    const category = queryParams.get('category');
    const status = queryParams.get('status');
    const sortBy = queryParams.get('sortBy') || 'createdAt';
    const order = queryParams.get('order') || 'desc';
    const page = parseInt(queryParams.get('page'), 10) || 1;
    const limit = parseInt(queryParams.get('limit'), 10) || 10;

    if (category) prods = prods.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    if (status) prods = prods.filter((p) => (p.status || 'available').toLowerCase() === status.toLowerCase());
    if (search) {
      const s = search.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.sku.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          p.supplier.toLowerCase().includes(s)
      );
    }

    prods.sort((a, b) => {
      let va = a[sortBy] !== undefined ? a[sortBy] : '';
      let vb = b[sortBy] !== undefined ? b[sortBy] : '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (order === 'asc') return va > vb ? 1 : -1;
      return va < vb ? 1 : -1;
    });

    const total = prods.length;
    const skip = (page - 1) * limit;
    const paginated = prods.slice(skip, skip + limit);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      count: paginated.length,
      products: paginated
    };
  }

  // 2. POST /api/products
  if (path === '/api/products' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const prods = getStore('smartlab_products');
    const newId = 'prod_' + Date.now();
    const newProd = {
      _id: newId,
      id: newId,
      ...body,
      stockValue: Number(body.price || 0) * Number(body.quantity || 0),
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    prods.unshift(newProd);
    setStore('smartlab_products', prods);
    return newProd;
  }

  // 3. GET /api/products/low-stock
  if (path === '/api/products/low-stock') {
    const prods = getStore('smartlab_products');
    const lowStockItems = prods.filter((p) => Number(p.quantity) <= Number(p.reorderLevel));
    return { count: lowStockItems.length, lowStockItems };
  }

  // 4. GET /api/products/summary
  if (path === '/api/products/summary') {
    const prods = getStore('smartlab_products');
    const catMap = {};
    prods.forEach((p) => {
      if (!catMap[p.category]) {
        catMap[p.category] = { _id: p.category, totalItems: 0, totalQuantity: 0, totalStockValue: 0, prices: [] };
      }
      catMap[p.category].totalItems += 1;
      catMap[p.category].totalQuantity += Number(p.quantity || 0);
      catMap[p.category].totalStockValue += Number(p.price || 0) * Number(p.quantity || 0);
      catMap[p.category].prices.push(Number(p.price || 0));
    });

    const summary = Object.values(catMap).map((c) => ({
      _id: c._id,
      totalItems: c.totalItems,
      totalQuantity: c.totalQuantity,
      totalStockValue: c.totalStockValue,
      avgPrice: Number((c.prices.reduce((a, b) => a + b, 0) / c.prices.length).toFixed(2))
    }));

    return { categories: summary.length, summary };
  }

  // 5. PATCH /api/products/:id/stock
  if (path.includes('/stock') && method === 'PATCH') {
    const id = path.split('/')[3];
    const body = JSON.parse(options.body || '{}');
    const prods = getStore('smartlab_products');
    const p = prods.find((item) => item._id === id || item.sku === id);
    if (!p) throw new Error('Product not found');
    p.quantity = Math.max(0, Number(p.quantity) + Number(body.change || 0));
    p.stockValue = Number(p.price) * Number(p.quantity);
    p.updatedAt = new Date().toISOString();
    setStore('smartlab_products', prods);
    return { message: 'Stock updated', product: p };
  }

  // 6. DELETE /api/products/:id
  if (path.startsWith('/api/products/') && method === 'DELETE') {
    const id = path.split('/')[3];
    let prods = getStore('smartlab_products');
    prods = prods.filter((p) => p._id !== id && p.sku !== id);
    setStore('smartlab_products', prods);
    return { message: 'Product deleted', id };
  }

  // 7. GET /api/assignments/active
  if (path === '/api/assignments/active') {
    const asgns = getStore('smartlab_assignments');
    const active = asgns.filter((a) => a.status === 'Active');
    const now = new Date();
    const enriched = active.map((item) => ({
      ...item,
      isOverdue: new Date(item.expectedReturnDate) < now
    }));
    return { count: enriched.length, assignments: enriched };
  }

  // 8. POST /api/assignments/issue
  if (path === '/api/assignments/issue' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const prods = getStore('smartlab_products');
    const prod = prods.find((p) => p._id === body.equipmentId || p.sku === body.equipmentId);
    if (!prod) throw new Error('Equipment not found');
    if (prod.quantity <= 0) throw new Error('Out of stock');

    prod.quantity -= 1;
    prod.stockValue = prod.price * prod.quantity;
    if (prod.quantity === 0) prod.status = 'issued';

    const asgns = getStore('smartlab_assignments');
    const newAsgn = {
      _id: 'asgn_' + Date.now(),
      equipment: prod._id,
      equipmentSku: prod.sku,
      equipmentName: prod.name,
      ...body,
      issueDate: new Date().toISOString(),
      status: 'Active'
    };
    asgns.unshift(newAsgn);
    setStore('smartlab_assignments', asgns);
    setStore('smartlab_products', prods);
    return { success: true, assignment: newAsgn };
  }

  // 9. POST /api/assignments/return
  if (path === '/api/assignments/return' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const asgns = getStore('smartlab_assignments');
    const asgn = asgns.find((a) => a._id === body.assignmentId);
    if (!asgn) throw new Error('Assignment not found');

    asgn.status = 'Returned';
    asgn.actualReturnDate = new Date().toISOString();
    asgn.returnCondition = body.returnCondition || 'Good';

    const prods = getStore('smartlab_products');
    const prod = prods.find((p) => p._id === asgn.equipment || p.sku === asgn.equipmentSku);
    if (prod) {
      if (body.returnCondition === 'Damaged') {
        prod.status = 'damaged';
        prod.condition = 'Damaged';
      } else {
        prod.quantity += 1;
        prod.status = 'available';
        prod.condition = 'Good';
      }
      prod.stockValue = prod.price * prod.quantity;
      setStore('smartlab_products', prods);
    }
    setStore('smartlab_assignments', asgns);
    return { success: true, assignment: asgn };
  }

  // 10. GET /api/repairs
  if (path === '/api/repairs') {
    const repairs = getStore('smartlab_repairs');
    return { count: repairs.length, repairs };
  }

  // 11. POST /api/repairs
  if (path === '/api/repairs' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const prods = getStore('smartlab_products');
    const prod = prods.find((p) => p._id === body.equipmentId || p.sku === body.equipmentId);
    if (!prod) throw new Error('Equipment not found');

    const repairs = getStore('smartlab_repairs');
    const newRepair = {
      _id: 'rep_' + Date.now(),
      equipment: prod._id,
      equipmentSku: prod.sku,
      equipmentName: prod.name,
      category: prod.category,
      ...body,
      reportedDate: new Date().toISOString()
    };
    repairs.unshift(newRepair);
    setStore('smartlab_repairs', repairs);

    prod.status = 'maintenance';
    prod.condition = 'Under Repair';
    setStore('smartlab_products', prods);
    return { success: true, repair: newRepair };
  }

  // 12. GET /api/reports/frequently-damaged
  if (path === '/api/reports/frequently-damaged') {
    const repairs = getStore('smartlab_repairs');
    const map = {};
    repairs.forEach((r) => {
      if (!map[r.equipmentSku]) {
        map[r.equipmentSku] = {
          sku: r.equipmentSku,
          name: r.equipmentName,
          category: r.category,
          damageCount: 0,
          totalRepairCost: 0,
          damageTypes: new Set(),
          lastDamagedDate: r.reportedDate
        };
      }
      map[r.equipmentSku].damageCount += 1;
      map[r.equipmentSku].totalRepairCost += Number(r.repairCost || 0);
      map[r.equipmentSku].damageTypes.add(r.damageType);
    });

    const report = Object.values(map).map((item) => ({
      sku: item.sku,
      name: item.name,
      category: item.category,
      damageCount: item.damageCount,
      totalRepairCost: item.totalRepairCost,
      avgRepairCost: Number((item.totalRepairCost / item.damageCount).toFixed(2)),
      damageTypes: Array.from(item.damageTypes),
      lastDamagedDate: item.lastDamagedDate
    }));

    report.sort((a, b) => b.damageCount - a.damageCount);
    return { success: true, report };
  }

  // 13. GET /api/ai/predictive-maintenance
  if (path === '/api/ai/predictive-maintenance') {
    return computeClientAIPredictions();
  }

  return { success: true };
}

// Main Page Initialization
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initModals();
  initEventListeners();
  loadAllData();
});

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

      if (tabId === 'lowstock') loadLowStock();
      if (tabId === 'summary') loadSummary();
      if (tabId === 'assignments') loadAssignments();
      if (tabId === 'repairs') loadRepairs();
      if (tabId === 'damaged') loadFrequentlyDamaged();
      if (tabId === 'ai') loadAIPredictions();
    });
  });
}

function initModals() {
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      closeModal(modalId);
    });
  });

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

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

function initEventListeners() {
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadAllData();
    showToast('Data refreshed successfully');
  });

  let searchTimeout;
  document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      loadProducts();
    }, 300);
  });

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

  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
  document.getElementById('stockForm').addEventListener('submit', handleStockSubmit);
  document.getElementById('issueForm').addEventListener('submit', handleIssueSubmit);
  document.getElementById('returnForm').addEventListener('submit', handleReturnSubmit);
  document.getElementById('repairForm').addEventListener('submit', handleRepairSubmit);
}

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
    const data = await apiRequest(`/api/products?${params.toString()}`);

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
      const isLow = Number(p.quantity) <= Number(p.reorderLevel);
      const stockVal = p.stockValue !== undefined ? p.stockValue : Number(p.price) * Number(p.quantity);
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

async function loadLowStock() {
  try {
    const data = await apiRequest('/api/products/low-stock');
    document.getElementById('statLowStock').textContent = data.count || 0;
    document.getElementById('lowStockBadge').textContent = data.count || 0;

    const tbody = document.getElementById('lowStockTableBody');
    if (!data.lowStockItems || data.lowStockItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="loading-cell" style="color: #34d399;">✓ All equipment stock levels are healthy!</td></tr>';
      return;
    }

    tbody.innerHTML = data.lowStockItems
      .map((item) => {
        const deficit = Math.max(0, Number(item.reorderLevel) - Number(item.quantity));
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

async function loadSummary() {
  try {
    const data = await apiRequest('/api/products/summary');
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

async function loadAssignments() {
  try {
    const data = await apiRequest('/api/assignments/active');
    const tbody = document.getElementById('assignmentsTableBody');
    if (!data.assignments || data.assignments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="loading-cell">No active loans. All equipment is stored in labs.</td></tr>';
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

async function loadRepairs() {
  try {
    const data = await apiRequest('/api/repairs');
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

async function loadFrequentlyDamaged() {
  try {
    const data = await apiRequest('/api/reports/frequently-damaged');
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
            <td>₹${Number(item.totalRepairCost).toLocaleString()}</td>
            <td>₹${Number(item.avgRepairCost).toLocaleString()}</td>
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

async function loadAIPredictions() {
  try {
    const data = await apiRequest('/api/ai/predictive-maintenance');

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

    await apiRequest(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

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
    await apiRequest(`/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ change })
    });

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
    await apiRequest('/api/assignments/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

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
    await apiRequest('/api/assignments/return', {
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
    await apiRequest('/api/repairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    showToast('Repair logged successfully');
    closeModal('repairModal');
    document.getElementById('repairForm').reset();
    loadAllData();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

window.openStockModal = function (id, name, currentQty) {
  document.getElementById('stockProdId').value = id;
  document.getElementById('stockProdName').textContent = name;
  document.getElementById('currentStockVal').textContent = currentQty;
  document.getElementById('stockChangeInput').value = '';
  openModal('stockModal');
};

window.editProduct = async function (id) {
  const prods = getStore('smartlab_products');
  const p = prods.find((item) => item._id === id || item.sku === id);
  if (!p) return alert('Equipment not found');

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
};

window.deleteProduct = async function (id, name) {
  if (!confirm(`Are you sure you want to delete '${name}' from inventory?`)) return;

  try {
    await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
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

  const repairs = getStore('smartlab_repairs');
  const r = repairs.find((item) => item._id === repairId);
  if (r) {
    r.status = 'Completed';
    r.resolutionNotes = notes;
    setStore('smartlab_repairs', repairs);

    const prods = getStore('smartlab_products');
    const p = prods.find((prod) => prod._id === r.equipment || prod.sku === r.equipmentSku);
    if (p) {
      p.status = 'available';
      p.condition = 'Good';
      setStore('smartlab_products', prods);
    }
  }

  showToast('Repair resolved. Equipment returned to active pool.');
  loadAllData();
};

function populateIssueSelect() {
  const select = document.getElementById('issueEquipmentSelect');
  select.innerHTML = '<option value="">Choose available equipment...</option>';
  allProductsCache
    .filter((p) => Number(p.quantity) > 0 && p.status !== 'damaged' && p.status !== 'maintenance')
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
