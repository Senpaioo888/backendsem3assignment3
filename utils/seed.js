const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Assignment = require('../models/Assignment');
const Repair = require('../models/Repair');

dotenv.config();

const sampleProducts = [
  {
    name: 'Dell OptiPlex 7090 Desktop',
    sku: 'LAB-PC-701',
    category: 'Computers',
    price: 65000,
    quantity: 18,
    reorderLevel: 5,
    supplier: 'Dell India Enterprise',
    status: 'available',
    labLocation: 'Computer Lab 301 - Row A',
    serialNumber: 'DL-7090-001',
    condition: 'Good',
    totalIssuesCount: 14,
    totalRepairsCount: 1,
    totalRepairCost: 3500,
    lastMaintenanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'HP ZBook Studio Workstation',
    sku: 'LAB-PC-802',
    category: 'Computers',
    price: 115000,
    quantity: 2, // Low stock alert! (quantity <= reorderLevel)
    reorderLevel: 4,
    supplier: 'HP Direct Commercial',
    status: 'available',
    labLocation: 'Advanced AI/ML Lab - Room 405',
    serialNumber: 'HP-ZB-992',
    condition: 'Good',
    totalIssuesCount: 22,
    totalRepairsCount: 3,
    totalRepairCost: 18500,
    lastMaintenanceDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Epson EB-E01 3LCD Projector',
    sku: 'LAB-PROJ-101',
    category: 'Projectors',
    price: 38500,
    quantity: 1, // Low stock alert!
    reorderLevel: 2,
    supplier: 'Epson Audio-Visuals',
    status: 'available',
    labLocation: 'Lecture Hall 102 & Lab 301',
    serialNumber: 'EP-PROJ-3301',
    condition: 'Fair',
    totalIssuesCount: 35,
    totalRepairsCount: 4, // Frequently damaged & maintenance candidate!
    totalRepairCost: 22000,
    lastMaintenanceDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'BenQ 4K Smart Classroom Projector',
    sku: 'LAB-PROJ-202',
    category: 'Projectors',
    price: 82000,
    quantity: 3,
    reorderLevel: 2,
    supplier: 'BenQ Solutions',
    status: 'available',
    labLocation: 'Seminar Hall 2',
    serialNumber: 'BQ-4K-8812',
    condition: 'Good',
    totalIssuesCount: 8,
    totalRepairsCount: 1,
    totalRepairCost: 4500,
    lastMaintenanceDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Keychron V1 Custom Mechanical Keyboard',
    sku: 'LAB-KB-301',
    category: 'Keyboards',
    price: 6499,
    quantity: 24,
    reorderLevel: 10,
    supplier: 'Keychron India',
    status: 'available',
    labLocation: 'Competitive Coding Lab',
    serialNumber: 'KC-V1-401',
    condition: 'Good',
    totalIssuesCount: 40,
    totalRepairsCount: 5, // Frequently damaged due to switch wear & liquid spills
    totalRepairCost: 4200,
    lastMaintenanceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Logitech K120 Spill-Resistant Keyboard',
    sku: 'LAB-KB-102',
    category: 'Keyboards',
    price: 599,
    quantity: 45,
    reorderLevel: 15,
    supplier: 'Logitech Business',
    status: 'available',
    labLocation: 'General Computing Lab 1',
    serialNumber: 'LOG-K120-BATCH-A',
    condition: 'Good',
    totalIssuesCount: 12,
    totalRepairsCount: 2,
    totalRepairCost: 600,
    lastMaintenanceDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Rigol DS1054Z Digital Storage Oscilloscope',
    sku: 'LAB-EQ-OSC-01',
    category: 'Lab Equipment',
    price: 36000,
    quantity: 6,
    reorderLevel: 3,
    supplier: 'Rigol Test Instruments',
    status: 'available',
    labLocation: 'Electronics Hardware Lab 204',
    serialNumber: 'RIG-DS1-8841',
    condition: 'Good',
    totalIssuesCount: 19,
    totalRepairsCount: 2,
    totalRepairCost: 7500,
    lastMaintenanceDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Keysight 34461A 6.5 Digit Digital Multimeter',
    sku: 'LAB-EQ-DMM-05',
    category: 'Lab Equipment',
    price: 94000,
    quantity: 2, // Low stock alert!
    reorderLevel: 3,
    supplier: 'Keysight Technologies',
    status: 'available',
    labLocation: 'VLSI & Precision Lab',
    serialNumber: 'KS-344-9901',
    condition: 'Good',
    totalIssuesCount: 11,
    totalRepairsCount: 1,
    totalRepairCost: 6000,
    lastMaintenanceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Raspberry Pi 4 Model B (8GB RAM)',
    sku: 'LAB-DEV-RPI-4B',
    category: 'Electronics',
    price: 7800,
    quantity: 15,
    reorderLevel: 5,
    supplier: 'Element14 Electronics',
    status: 'available',
    labLocation: 'IoT & Embedded Systems Lab',
    serialNumber: 'RPI4B-BATCH-3',
    condition: 'Good',
    totalIssuesCount: 28,
    totalRepairsCount: 3,
    totalRepairCost: 2400,
    lastMaintenanceDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Arduino Mega 2560 Pro Kit',
    sku: 'LAB-DEV-ARD-2560',
    category: 'Electronics',
    price: 2450,
    quantity: 3, // Low stock alert!
    reorderLevel: 8,
    supplier: 'Robu.in Embedded Labs',
    status: 'available',
    labLocation: 'Robotics Workshop Room 108',
    serialNumber: 'ARD-MEGA-044',
    condition: 'Fair',
    totalIssuesCount: 31,
    totalRepairsCount: 4,
    totalRepairCost: 3100,
    lastMaintenanceDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Ergonomic Lab Study Workstation',
    sku: 'FURN-TB-812',
    category: 'Furniture',
    price: 3999,
    quantity: 2, // Matches PDF example!
    reorderLevel: 4,
    supplier: 'IKEA India',
    status: 'available',
    labLocation: 'Design Studio Lab 105',
    serialNumber: 'IK-TB-812-A',
    condition: 'Good',
    totalIssuesCount: 3,
    totalRepairsCount: 0,
    totalRepairCost: 0,
    lastMaintenanceDate: new Date()
  },
  {
    name: 'Lab Whiteboard Marker Box (Pack of 12)',
    sku: 'STNY-MK-101',
    category: 'Stationery',
    price: 360,
    quantity: 50,
    reorderLevel: 20,
    supplier: 'Camlin Stationery',
    status: 'available',
    labLocation: 'Faculty Stationery Store',
    serialNumber: 'CAM-MK-2024',
    condition: 'New',
    totalIssuesCount: 5,
    totalRepairsCount: 0,
    totalRepairCost: 0,
    lastMaintenanceDate: new Date()
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartlab_inventory';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB at: ${mongoUri}`);

    // Clear existing collections
    await Product.deleteMany({});
    await Assignment.deleteMany({});
    await Repair.deleteMany({});
    console.log('[Seed] Cleared existing products, assignments, and repair records.');

    // Insert Products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`[Seed] Successfully inserted ${createdProducts.length} equipment/product records.`);

    // Map created products by SKU for linking
    const prodMap = {};
    createdProducts.forEach((p) => {
      prodMap[p.sku] = p;
    });

    // Sample Assignments
    const sampleAssignments = [
      {
        equipment: prodMap['LAB-PC-701']._id,
        equipmentSku: 'LAB-PC-701',
        equipmentName: prodMap['LAB-PC-701'].name,
        borrowerName: 'Aarav Sharma',
        borrowerId: 'STU-CS-2024-041',
        borrowerRole: 'Student',
        department: 'Computer Science & Engineering',
        labRoom: 'Lab 301',
        issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        expectedReturnDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'Active',
        remarks: 'Issued for Capstone Project Deep Learning experimentation'
      },
      {
        equipment: prodMap['LAB-PROJ-101']._id,
        equipmentSku: 'LAB-PROJ-101',
        equipmentName: prodMap['LAB-PROJ-101'].name,
        borrowerName: 'Dr. Priya Ramanathan',
        borrowerId: 'FAC-IT-109',
        borrowerRole: 'Faculty',
        department: 'Information Technology',
        labRoom: 'Lecture Hall 102',
        issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expectedReturnDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'Active',
        remarks: 'Issued for Guest Lecture presentation'
      },
      {
        equipment: prodMap['LAB-KB-301']._id,
        equipmentSku: 'LAB-KB-301',
        equipmentName: prodMap['LAB-KB-301'].name,
        borrowerName: 'Rohan Deshmukh',
        borrowerId: 'STU-CS-2024-118',
        borrowerRole: 'Student',
        department: 'Computer Science & Engineering',
        labRoom: 'Lab 301',
        issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expectedReturnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        actualReturnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'Returned',
        returnCondition: 'Good',
        remarks: 'Returned in good condition'
      },
      {
        equipment: prodMap['LAB-EQ-OSC-01']._id,
        equipmentSku: 'LAB-EQ-OSC-01',
        equipmentName: prodMap['LAB-EQ-OSC-01'].name,
        borrowerName: 'Prof. Sandeep Kulkarni',
        borrowerId: 'FAC-ECE-204',
        borrowerRole: 'Faculty',
        department: 'Electronics & Communication',
        labRoom: 'Hardware Lab 204',
        issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        expectedReturnDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        actualReturnDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'Returned',
        returnCondition: 'Needs Maintenance',
        remarks: 'Probe calibration was drifting'
      }
    ];

    await Assignment.insertMany(sampleAssignments);
    console.log(`[Seed] Successfully inserted ${sampleAssignments.length} assignment records.`);

    // Sample Repairs History (for Frequently Damaged Equipment & AI Prediction)
    const sampleRepairs = [
      {
        equipment: prodMap['LAB-PROJ-101']._id,
        equipmentSku: 'LAB-PROJ-101',
        equipmentName: prodMap['LAB-PROJ-101'].name,
        category: 'Projectors',
        issueDescription: 'Cooling exhaust fan stopped rotating, causing emergency thermal shutdown.',
        damageType: 'Electrical Failure',
        repairCost: 6500,
        technician: 'Epson Authorized Care',
        status: 'Completed',
        reportedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        resolvedDate: new Date(Date.now() - 114 * 24 * 60 * 60 * 1000),
        resolutionNotes: 'Replaced thermal fan assembly and reapplied thermal conductive pad.'
      },
      {
        equipment: prodMap['LAB-PROJ-101']._id,
        equipmentSku: 'LAB-PROJ-101',
        equipmentName: prodMap['LAB-PROJ-101'].name,
        category: 'Projectors',
        issueDescription: 'High-voltage projector lamp flickering and discoloration on left lens quadrant.',
        damageType: 'Component Breakdown',
        repairCost: 9500,
        technician: 'Epson Authorized Care',
        status: 'Completed',
        reportedDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        resolvedDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        resolutionNotes: 'Replaced 210W UHE projector lamp unit.'
      },
      {
        equipment: prodMap['LAB-PROJ-101']._id,
        equipmentSku: 'LAB-PROJ-101',
        equipmentName: prodMap['LAB-PROJ-101'].name,
        category: 'Projectors',
        issueDescription: 'HDMI port 1 internal pin bent and loose contact.',
        damageType: 'Accidental Damage',
        repairCost: 4000,
        technician: 'Campus IT Lab Support',
        status: 'Completed',
        reportedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        resolvedDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        resolutionNotes: 'Resoldered HDMI header bracket.'
      },
      {
        equipment: prodMap['LAB-PROJ-101']._id,
        equipmentSku: 'LAB-PROJ-101',
        equipmentName: prodMap['LAB-PROJ-101'].name,
        category: 'Projectors',
        issueDescription: 'Buzzing ballast coil noise and ballast capacitor whine.',
        damageType: 'Electrical Failure',
        repairCost: 2000,
        technician: 'Campus IT Lab Support',
        status: 'In Progress',
        reportedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        resolutionNotes: 'Under bench inspection.'
      },
      {
        equipment: prodMap['LAB-KB-301']._id,
        equipmentSku: 'LAB-KB-301',
        equipmentName: prodMap['LAB-KB-301'].name,
        category: 'Keyboards',
        issueDescription: 'Liquid spill on spacebar and right shift key, sticky switches.',
        damageType: 'Accidental Damage',
        repairCost: 1200,
        technician: 'Campus Hardware Workshop',
        status: 'Completed',
        reportedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        resolvedDate: new Date(Date.now() - 88 * 24 * 60 * 60 * 1000),
        resolutionNotes: 'Ultrasonic cleaning of PCB and replaced 4 Gateron switches.'
      },
      {
        equipment: prodMap['LAB-KB-301']._id,
        equipmentSku: 'LAB-KB-301',
        equipmentName: prodMap['LAB-KB-301'].name,
        category: 'Keyboards',
        issueDescription: 'USB-C detachable connector port detachment from PCB mount.',
        damageType: 'Wear and Tear',
        repairCost: 800,
        technician: 'Campus Hardware Workshop',
        status: 'Completed',
        reportedDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        resolvedDate: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000),
        resolutionNotes: 'Reinforced and resoldered Type-C jack.'
      },
      {
        equipment: prodMap['LAB-PC-802']._id,
        equipmentSku: 'LAB-PC-802',
        equipmentName: prodMap['LAB-PC-802'].name,
        category: 'Computers',
        issueDescription: 'GPU thermal throttling and SMPS primary rail voltage drop.',
        damageType: 'Component Breakdown',
        repairCost: 11000,
        technician: 'HP Enterprise Service',
        status: 'Completed',
        reportedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        resolvedDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        resolutionNotes: 'Replaced workstation power supply unit.'
      },
      {
        equipment: prodMap['LAB-DEV-ARD-2560']._id,
        equipmentSku: 'LAB-DEV-ARD-2560',
        equipmentName: prodMap['LAB-DEV-ARD-2560'].name,
        category: 'Electronics',
        issueDescription: 'Short circuit on 5V regulator pin due to inverted breadboard wiring.',
        damageType: 'Accidental Damage',
        repairCost: 650,
        technician: 'Campus Lab Tech',
        status: 'Completed',
        reportedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        resolvedDate: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
        resolutionNotes: 'Replaced AMS1117 linear regulator.'
      }
    ];

    await Repair.insertMany(sampleRepairs);
    console.log(`[Seed] Successfully inserted ${sampleRepairs.length} repair records.`);

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
