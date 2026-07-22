import type {
  Category, Supplier, Product, Transaction, TransactionType, Notification, Activity,
} from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants';
import { writeStorage, readStorage } from '../services/localStorage';

// =========================================
// Helper Utilities
// =========================================
function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

const SIX_MONTHS_AGO = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
const NOW = new Date();

function generateBarcode(sku: string): string {
  const prefix = '8901';
  const mid = sku.replace(/[^0-9]/g, '').slice(0, 5).padStart(5, '0');
  const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${mid}${suffix}`;
}

// =========================================
// Seed: Categories (10)
// =========================================
const categories: Category[] = [
  { id: 'cat-1', name: 'Electronics', icon: 'Monitor', color: 'bg-brand-500/10 text-brand-500', description: 'Computers, monitors, peripherals and electronic devices', productCount: 0, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Mobile & Accessories', icon: 'Smartphone', color: 'bg-info-500/10 text-info-500', description: 'Smartphones, tablets and mobile accessories', productCount: 0, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Networking', icon: 'Wifi', color: 'bg-success-500/10 text-success-500', description: 'Routers, switches, cables and networking equipment', productCount: 0, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'cat-4', name: 'Storage & Drives', icon: 'HardDrive', color: 'bg-purple-500/10 text-purple-500', description: 'SSDs, HDDs, USB drives and memory cards', productCount: 0, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'cat-5', name: 'Audio & Video', icon: 'Headphones', color: 'bg-pink-500/10 text-pink-500', description: 'Headphones, speakers, cameras and AV equipment', productCount: 0, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'cat-6', name: 'Office Supplies', icon: 'Briefcase', color: 'bg-warning-500/10 text-warning-500', description: 'Stationery, printers and office equipment', productCount: 0, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'cat-7', name: 'Components', icon: 'Cpu', color: 'bg-cyan-500/10 text-cyan-500', description: 'Processors, RAM, motherboards and PC components', productCount: 0, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'cat-8', name: 'Software & Licenses', icon: 'Package', color: 'bg-orange-500/10 text-orange-500', description: 'Software licenses, antivirus and productivity suites', productCount: 0, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'cat-9', name: 'Power & UPS', icon: 'Zap', color: 'bg-danger-500/10 text-danger-500', description: 'UPS, power banks, surge protectors and chargers', productCount: 0, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'cat-10', name: 'Wearables', icon: 'Watch', color: 'bg-rose-500/10 text-rose-500', description: 'Smart watches, fitness bands and wearable tech', productCount: 0, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
];

// =========================================
// Seed: Suppliers (20)
// =========================================
const suppliers: Supplier[] = [
  { id: 'sup-1',  name: 'Rahul Verma',     company: 'TechZone Distributors',   email: 'rahul@techzone.in',     phone: '9876543210', address: '42 MG Road',         city: 'Bangalore',  state: 'Karnataka',     gstNumber: '29ABCDE1234F1Z5', rating: 5, status: 'active', productsSupplied: 14, totalOrders: 128, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-2',  name: 'Priya Sharma',    company: 'MobileMart India',         email: 'priya@mobilemart.in',   phone: '8765432109', address: '17 Nehru Street',    city: 'Chennai',    state: 'Tamil Nadu',    gstNumber: '33FGHIJ5678K2L6', rating: 4, status: 'active', productsSupplied: 10, totalOrders: 94,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-3',  name: 'Anil Kumar',      company: 'NetLink Solutions',        email: 'anil@netlink.in',       phone: '7654321098', address: '8 Baner Road',       city: 'Pune',       state: 'Maharashtra',   gstNumber: '27KLMNO9012P3Q7', rating: 4, status: 'active', productsSupplied: 7,  totalOrders: 56,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-4',  name: 'Sneha Patel',     company: 'StoragePro Wholesale',     email: 'sneha@storagepro.in',   phone: '6543210987', address: '23 CG Road',         city: 'Ahmedabad',  state: 'Gujarat',       gstNumber: '24RSTU3456V4W8', rating: 5, status: 'active', productsSupplied: 8,  totalOrders: 72,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-5',  name: 'Vikram Singh',    company: 'AudioVision Traders',      email: 'vikram@audiovision.in', phone: '9543210876', address: '55 Lajpat Nagar',    city: 'Delhi',      state: 'Delhi',         gstNumber: '07VWXYZ7890A5B9', rating: 3, status: 'active', productsSupplied: 6,  totalOrders: 41,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-6',  name: 'Meena Iyer',      company: 'OfficePlus Supplies',      email: 'meena@officeplus.in',   phone: '8432109765', address: '11 Brigade Road',    city: 'Bangalore',  state: 'Karnataka',     gstNumber: '29CDEFG2345H6I0', rating: 4, status: 'active', productsSupplied: 5,  totalOrders: 63,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-7',  name: 'Ravi Nair',       company: 'ComponentHub',             email: 'ravi@componenthub.in',  phone: '7321098654', address: '99 Whitefield',      city: 'Bangalore',  state: 'Karnataka',     gstNumber: '29HIJKL6789M0N1', rating: 5, status: 'active', productsSupplied: 9,  totalOrders: 87,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-8',  name: 'Deepa Reddy',     company: 'SoftLicense India',        email: 'deepa@softlicense.in',  phone: '6210987543', address: '7 Hitech City',      city: 'Hyderabad',  state: 'Telangana',     gstNumber: '36MNOPQ0123R4S2', rating: 3, status: 'active', productsSupplied: 3,  totalOrders: 29,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-9',  name: 'Suresh Joshi',    company: 'PowerSafe Electronics',    email: 'suresh@powersafe.in',   phone: '9109876432', address: '34 FC Road',         city: 'Pune',       state: 'Maharashtra',   gstNumber: '27RSTUV4567W8X3', rating: 4, status: 'active', productsSupplied: 5,  totalOrders: 48,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-10', name: 'Kavya Menon',     company: 'WearTech Distributors',    email: 'kavya@weartech.in',     phone: '8098765321', address: '22 MG Road',         city: 'Kochi',      state: 'Kerala',        gstNumber: '32WXYZ8901A2B4', rating: 4, status: 'active', productsSupplied: 4,  totalOrders: 35,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-11', name: 'Arjun Malhotra',  company: 'Digital First Pvt Ltd',    email: 'arjun@digitalfirst.in', phone: '7987654210', address: '5 Koregaon Park',    city: 'Pune',       state: 'Maharashtra',   gstNumber: '27BCDEF1234G5H0', rating: 2, status: 'inactive', productsSupplied: 2, totalOrders: 11, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-12', name: 'Nisha Gupta',     company: 'GadgetWorld Exports',      email: 'nisha@gadgetworld.in',  phone: '6876543109', address: '77 Chandni Chowk',   city: 'Delhi',      state: 'Delhi',         gstNumber: '07GHIJK5678L9M1', rating: 3, status: 'active', productsSupplied: 6,  totalOrders: 54,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-13', name: 'Kiran Bhatia',    company: 'FastTrack Technologies',   email: 'kiran@fasttrack.in',    phone: '9765432198', address: '18 Residency Road',  city: 'Bangalore',  state: 'Karnataka',     gstNumber: '29LMNOP9012Q3R2', rating: 5, status: 'active', productsSupplied: 11, totalOrders: 103, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-14', name: 'Alisha Khan',     company: 'Prime Supplies Co.',       email: 'alisha@primesupplies.in', phone: '8654321987', address: '3 Salt Lake',      city: 'Kolkata',    state: 'West Bengal',   gstNumber: '19RSTUV3456W7X3', rating: 4, status: 'active', productsSupplied: 7,  totalOrders: 66,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-15', name: 'Manish Tiwari',   company: 'CoreTech Solutions',       email: 'manish@coretech.in',    phone: '7543210876', address: '61 Arera Colony',    city: 'Bhopal',     state: 'Madhya Pradesh', gstNumber: '23VWXYZ7890A4B5', rating: 3, status: 'active', productsSupplied: 4,  totalOrders: 38,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-16', name: 'Pooja Srivastava', company: 'Ezone Wholesale',         email: 'pooja@ezone.in',        phone: '9432109765', address: '45 Gomti Nagar',     city: 'Lucknow',    state: 'Uttar Pradesh', gstNumber: '09BCDEF2345G6H6', rating: 4, status: 'active', productsSupplied: 8,  totalOrders: 77,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-17', name: 'Rajesh Pillai',   company: 'TechSource India',         email: 'rajesh@techsource.in',  phone: '8320987654', address: '12 Anna Salai',      city: 'Chennai',    state: 'Tamil Nadu',    gstNumber: '33HIJKL6789M0N7', rating: 5, status: 'active', productsSupplied: 12, totalOrders: 115, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-18', name: 'Sunita Rao',      company: 'SmartStock Distributors', email: 'sunita@smartstock.in',  phone: '7209876543', address: '29 Jubilee Hills',   city: 'Hyderabad',  state: 'Telangana',     gstNumber: '36MNOPQ0123R4S8', rating: 3, status: 'active', productsSupplied: 5,  totalOrders: 44,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-19', name: 'Tarun Mehta',     company: 'Budget Bazaar Pvt Ltd',    email: 'tarun@budgetbazaar.in', phone: '9098765432', address: '78 Prahlad Nagar',   city: 'Ahmedabad',  state: 'Gujarat',       gstNumber: '24RSTUV4567W8X9', rating: 2, status: 'inactive', productsSupplied: 3, totalOrders: 17, createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
  { id: 'sup-20', name: 'Divya Nambiar',   company: 'InnovateTech Traders',     email: 'divya@innovatetech.in', phone: '8187654321', address: '56 Indiranagar',     city: 'Bangalore',  state: 'Karnataka',     gstNumber: '29WXYZ8901A2B0', rating: 4, status: 'active', productsSupplied: 9,  totalOrders: 82,  createdAt: randomDate(SIX_MONTHS_AGO, NOW), updatedAt: new Date().toISOString() },
];

// =========================================
// Seed: Products (50)
// =========================================
const productDefs = [
  // Electronics (cat-1)
  { name: 'Dell Inspiron 15 Laptop', sku: 'ELC-001', cat: 'cat-1', sup: 'sup-1',  pp: 42000, sp: 54999, qty: 24, min: 5,  tags: ['popular', 'featured'], img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80' },
  { name: 'HP Pavilion x360 2-in-1',  sku: 'ELC-002', cat: 'cat-1', sup: 'sup-13', pp: 51000, sp: 64999, qty: 12, min: 5,  tags: ['popular'], img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80' },
  { name: 'Lenovo IdeaPad Slim 3',    sku: 'ELC-003', cat: 'cat-1', sup: 'sup-17', pp: 34000, sp: 44999, qty: 31, min: 8,  tags: ['best-seller'], img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80' },
  { name: 'LG 27" 4K Monitor',        sku: 'ELC-004', cat: 'cat-1', sup: 'sup-1',  pp: 22000, sp: 28999, qty: 18, min: 4,  tags: ['featured'], img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80' },
  { name: 'Logitech MX Master 3 Mouse', sku: 'ELC-005', cat: 'cat-1', sup: 'sup-6', pp: 6500, sp: 8999, qty: 45, min: 10, tags: ['popular', 'best-seller'], img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80' },
  // Mobile (cat-2)
  { name: 'Samsung Galaxy S24',       sku: 'MOB-001', cat: 'cat-2', sup: 'sup-2',  pp: 61000, sp: 74999, qty: 22, min: 8,  tags: ['popular', 'featured'], img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80' },
  { name: 'Apple iPhone 15',          sku: 'MOB-002', cat: 'cat-2', sup: 'sup-13', pp: 72000, sp: 89999, qty: 15, min: 5,  tags: ['best-seller', 'imported'], img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80' },
  { name: 'OnePlus 12R',              sku: 'MOB-003', cat: 'cat-2', sup: 'sup-2',  pp: 31000, sp: 39999, qty: 28, min: 8,  tags: ['popular'], img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80' },
  { name: 'Redmi Note 13 Pro',        sku: 'MOB-004', cat: 'cat-2', sup: 'sup-12', pp: 18000, sp: 23999, qty: 40, min: 12, tags: ['best-seller'], img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80' },
  { name: 'iPad Air 5th Gen',         sku: 'MOB-005', cat: 'cat-2', sup: 'sup-14', pp: 55000, sp: 68999, qty: 9,  min: 4,  tags: ['featured', 'imported'], img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80' },
  // Networking (cat-3)
  { name: 'TP-Link WiFi 6 Router',    sku: 'NET-001', cat: 'cat-3', sup: 'sup-3',  pp: 4500,  sp: 6499,  qty: 35, min: 8,  tags: ['popular'], img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80' },
  { name: 'Cisco 8-Port Switch',      sku: 'NET-002', cat: 'cat-3', sup: 'sup-3',  pp: 7200,  sp: 9999,  qty: 18, min: 5,  tags: [], img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80' },
  { name: 'Netgear Orbi Mesh System', sku: 'NET-003', cat: 'cat-3', sup: 'sup-15', pp: 14000, sp: 18999, qty: 7,  min: 4,  tags: ['imported'], img: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400&q=80' },
  { name: 'APC Network Rack 9U',      sku: 'NET-004', cat: 'cat-3', sup: 'sup-9',  pp: 8500,  sp: 11999, qty: 5,  min: 3,  tags: [], img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { name: 'D-Link 24-Port Patch Panel', sku: 'NET-005', cat: 'cat-3', sup: 'sup-3', pp: 3200, sp: 4499, qty: 22, min: 6,  tags: [], img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80' },
  // Storage (cat-4)
  { name: 'Samsung 1TB SSD 870 EVO',  sku: 'STR-001', cat: 'cat-4', sup: 'sup-4',  pp: 7800,  sp: 9999,  qty: 42, min: 10, tags: ['best-seller', 'popular'], img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80' },
  { name: 'WD Blue 2TB HDD',          sku: 'STR-002', cat: 'cat-4', sup: 'sup-4',  pp: 4200,  sp: 5499,  qty: 55, min: 15, tags: ['popular'], img: 'https://images.unsplash.com/photo-1622654578342-0e0adf4f7d45?w=400&q=80' },
  { name: 'Kingston 512GB USB Drive', sku: 'STR-003', cat: 'cat-4', sup: 'sup-16', pp: 900,   sp: 1399,  qty: 80, min: 20, tags: ['best-seller'], img: 'https://images.unsplash.com/photo-1601737487795-dab272f52420?w=400&q=80' },
  { name: 'SanDisk 256GB Micro SD',   sku: 'STR-004', cat: 'cat-4', sup: 'sup-4',  pp: 700,   sp: 999,   qty: 95, min: 25, tags: [], img: 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=400&q=80' },
  { name: 'Seagate 4TB External HDD', sku: 'STR-005', cat: 'cat-4', sup: 'sup-14', pp: 6800,  sp: 8999,  qty: 19, min: 6,  tags: ['imported'], img: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&q=80' },
  // Audio & Video (cat-5)
  { name: 'Sony WH-1000XM5 Headphones', sku: 'AV-001', cat: 'cat-5', sup: 'sup-5', pp: 22000, sp: 29999, qty: 16, min: 5,  tags: ['popular', 'featured', 'imported'], img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
  { name: 'JBL Flip 6 Bluetooth Speaker', sku: 'AV-002', cat: 'cat-5', sup: 'sup-5', pp: 9500, sp: 12999, qty: 28, min: 8,  tags: ['best-seller'], img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80' },
  { name: 'Canon EOS R50 Camera',     sku: 'AV-003', cat: 'cat-5', sup: 'sup-17', pp: 62000, sp: 78999, qty: 6,  min: 3,  tags: ['imported', 'featured'], img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80' },
  { name: 'Bose QuietComfort Earbuds', sku: 'AV-004', cat: 'cat-5', sup: 'sup-20', pp: 19000, sp: 24999, qty: 20, min: 6,  tags: ['popular', 'imported'], img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80' },
  { name: 'Anker Soundcore Life Q45', sku: 'AV-005', cat: 'cat-5', sup: 'sup-5',  pp: 6500,  sp: 8999,  qty: 33, min: 8,  tags: [], img: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80' },
  // Office (cat-6)
  { name: 'HP LaserJet Pro Printer',  sku: 'OFF-001', cat: 'cat-6', sup: 'sup-6',  pp: 12000, sp: 15999, qty: 14, min: 4,  tags: ['popular'], img: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=80' },
  { name: 'Ergonomic Office Chair',   sku: 'OFF-002', cat: 'cat-6', sup: 'sup-18', pp: 8500,  sp: 11999, qty: 11, min: 4,  tags: [], img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
  { name: 'Epson L3250 Inkjet MFP',   sku: 'OFF-003', cat: 'cat-6', sup: 'sup-6',  pp: 9800,  sp: 13499, qty: 8,  min: 4,  tags: ['best-seller'], img: 'https://images.unsplash.com/photo-1558470598-a5dda9640f68?w=400&q=80' },
  { name: 'Stapler Premium Set',      sku: 'OFF-004', cat: 'cat-6', sup: 'sup-6',  pp: 350,   sp: 549,   qty: 120, min: 30, tags: [], img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80' },
  { name: 'Whiteboard 4x3 ft',        sku: 'OFF-005', cat: 'cat-6', sup: 'sup-16', pp: 2200,  sp: 3199,  qty: 17, min: 5,  tags: [], img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80' },
  // Components (cat-7)
  { name: 'Intel Core i7-13700K',     sku: 'CMP-001', cat: 'cat-7', sup: 'sup-7',  pp: 28000, sp: 36999, qty: 13, min: 5,  tags: ['popular', 'featured'], img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80' },
  { name: 'Corsair Vengeance 16GB RAM', sku: 'CMP-002', cat: 'cat-7', sup: 'sup-7', pp: 4500, sp: 5999, qty: 38, min: 10, tags: ['popular', 'best-seller'], img: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80' },
  { name: 'ASUS RTX 4060 GPU',        sku: 'CMP-003', cat: 'cat-7', sup: 'sup-7',  pp: 29000, sp: 37999, qty: 7,  min: 3,  tags: ['featured', 'imported'], img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80' },
  { name: 'MSI B650M Gaming Motherboard', sku: 'CMP-004', cat: 'cat-7', sup: 'sup-20', pp: 14500, sp: 18999, qty: 10, min: 4, tags: [], img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80' },
  { name: 'Cooler Master 650W PSU',   sku: 'CMP-005', cat: 'cat-7', sup: 'sup-9',  pp: 5800,  sp: 7999,  qty: 21, min: 6,  tags: [], img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80' },
  // Software (cat-8)
  { name: 'Microsoft Office 365 (1yr)', sku: 'SW-001', cat: 'cat-8', sup: 'sup-8', pp: 3800, sp: 4999, qty: 50, min: 15, tags: ['best-seller', 'popular'], img: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80' },
  { name: 'Adobe Creative Cloud (1yr)', sku: 'SW-002', cat: 'cat-8', sup: 'sup-8', pp: 18000, sp: 23999, qty: 15, min: 5, tags: ['featured', 'imported'], img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80' },
  { name: 'Kaspersky Antivirus (3PC)', sku: 'SW-003', cat: 'cat-8', sup: 'sup-8', pp: 800,  sp: 1199,  qty: 60, min: 20, tags: ['popular'], img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80' },
  // Power (cat-9)
  { name: 'APC 1500VA UPS',           sku: 'PWR-001', cat: 'cat-9', sup: 'sup-9',  pp: 7800,  sp: 10499, qty: 14, min: 4,  tags: ['popular'], img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80' },
  { name: 'Mi 20000mAh Power Bank',   sku: 'PWR-002', cat: 'cat-9', sup: 'sup-2',  pp: 1500,  sp: 1999,  qty: 62, min: 15, tags: ['best-seller', 'popular'], img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80' },
  { name: 'Belkin Surge Protector 6-Outlet', sku: 'PWR-003', cat: 'cat-9', sup: 'sup-9', pp: 1200, sp: 1699, qty: 40, min: 10, tags: [], img: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=400&q=80' },
  { name: 'Anchor 10A Power Extension', sku: 'PWR-004', cat: 'cat-9', sup: 'sup-16', pp: 450, sp: 699, qty: 88, min: 20, tags: ['best-seller'], img: 'https://images.unsplash.com/photo-1558470598-a5dda9640f68?w=400&q=80' },
  { name: 'Dell 65W USB-C Charger',   sku: 'PWR-005', cat: 'cat-9', sup: 'sup-1',  pp: 2200,  sp: 2999,  qty: 35, min: 10, tags: [], img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80' },
  // Wearables (cat-10)
  { name: 'Apple Watch Series 9',     sku: 'WBL-001', cat: 'cat-10', sup: 'sup-13', pp: 32000, sp: 41999, qty: 11, min: 4, tags: ['featured', 'imported', 'popular'], img: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&q=80' },
  { name: 'Samsung Galaxy Watch 6',   sku: 'WBL-002', cat: 'cat-10', sup: 'sup-10', pp: 21000, sp: 26999, qty: 17, min: 5, tags: ['popular'], img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
  { name: 'Fitbit Charge 6',          sku: 'WBL-003', cat: 'cat-10', sup: 'sup-10', pp: 12000, sp: 15999, qty: 20, min: 6, tags: [], img: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80' },
  { name: 'Noise ColorFit Pro 4',     sku: 'WBL-004', cat: 'cat-10', sup: 'sup-20', pp: 2800,  sp: 3999,  qty: 43, min: 12, tags: ['best-seller'], img: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&q=80' },
  { name: 'Garmin Forerunner 265',    sku: 'WBL-005', cat: 'cat-10', sup: 'sup-10', pp: 28000, sp: 36999, qty: 5,  min: 3,  tags: ['imported', 'featured'], img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80' },
  // More Electronics
  { name: 'Dell 27" Full HD Monitor', sku: 'ELC-006', cat: 'cat-1', sup: 'sup-1',  pp: 13000, sp: 17499, qty: 25, min: 6,  tags: ['popular'], img: 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=400&q=80' },
  { name: 'Mechanical Keyboard TKL',  sku: 'ELC-007', cat: 'cat-1', sup: 'sup-7',  pp: 3200,  sp: 4499,  qty: 37, min: 10, tags: ['popular', 'best-seller'], img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80' },
];

// =========================================
// Build Products Array
// =========================================
function buildProducts(): Product[] {
  return productDefs.map((def, i) => {
    const sku = def.sku;
    const barcode = generateBarcode(sku);
    const isLow = def.qty <= def.min;
    const tags = [...def.tags] as Product['tags'];
    if (isLow && !tags.includes('low-stock')) tags.push('low-stock');

    return {
      id: `prod-${String(i + 1).padStart(3, '0')}`,
      name: def.name,
      sku,
      barcode,
      description: `${def.name} — high-quality product sourced from trusted suppliers. Ideal for professional and personal use.`,
      categoryId: def.cat,
      supplierId: def.sup,
      purchasePrice: def.pp,
      sellingPrice: def.sp,
      quantity: def.qty,
      minimumStock: def.min,
      image: def.img,
      status: 'active',
      tags,
      createdAt: randomDate(SIX_MONTHS_AGO, NOW),
      updatedAt: new Date().toISOString(),
    };
  });
}

// =========================================
// Build Transactions (250)
// =========================================
function buildTransactions(products: Product[]): Transaction[] {
  const txTypes: TransactionType[] = ['stock-in', 'stock-out', 'transfer', 'adjustment'];
  const reasons: Record<TransactionType, string[]> = {
    'stock-in': ['Purchase Order', 'Supplier Delivery', 'Return from Customer', 'Transfer In', 'Initial Stock'],
    'stock-out': ['Customer Sale', 'Damaged Goods', 'Transfer Out', 'Sample', 'Returned to Supplier'],
    'transfer': ['Warehouse Transfer', 'Branch Transfer', 'Stock Rebalancing'],
    'adjustment': ['Physical Count', 'Shrinkage', 'Data Correction', 'Audit Adjustment'],
  };
  const performers = ['Alex Johnson', 'Sarah Mitchell', 'Raj Kumar'];

  const transactions: Transaction[] = [];
  for (let i = 0; i < 250; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const type = txTypes[Math.floor(Math.random() * txTypes.length)];
    const reasonList = reasons[type];
    const reason = reasonList[Math.floor(Math.random() * reasonList.length)];
    const qty = Math.floor(Math.random() * 30) + 1;
    const prevQty = Math.floor(Math.random() * 60) + 5;
    const newQty = type === 'stock-in' || type === 'transfer' ? prevQty + qty : Math.max(0, prevQty - qty);

    transactions.push({
      id: `tx-${String(i + 1).padStart(4, '0')}`,
      productId: product.id,
      type,
      quantity: qty,
      previousQuantity: prevQty,
      newQuantity: newQty,
      reason,
      notes: '',
      performedBy: performers[Math.floor(Math.random() * performers.length)],
      createdAt: randomDate(SIX_MONTHS_AGO, NOW),
    });
  }
  // Sort by date desc
  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// =========================================
// Build Notifications
// =========================================
function buildNotifications(products: Product[]): Notification[] {
  const lowStockProds = products.filter(p => p.quantity <= p.minimumStock && p.quantity > 0).slice(0, 5);
  const outProds = products.filter(p => p.quantity === 0).slice(0, 2);
  const notifs: Notification[] = [];

  lowStockProds.forEach((p, i) => {
    notifs.push({
      id: `notif-ls-${i}`,
      type: 'low-stock',
      title: 'Low Stock Alert',
      message: `${p.name} has only ${p.quantity} units remaining (min: ${p.minimumStock}).`,
      read: false,
      createdAt: randomDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), NOW),
      link: `/products/${p.id}`,
    });
  });

  outProds.forEach((p, i) => {
    notifs.push({
      id: `notif-oos-${i}`,
      type: 'out-of-stock',
      title: 'Out of Stock',
      message: `${p.name} is out of stock. Immediate restocking required.`,
      read: false,
      createdAt: randomDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), NOW),
      link: `/products/${p.id}`,
    });
  });

  notifs.push(
    { id: 'notif-sup-1', type: 'new-supplier', title: 'New Supplier Added', message: 'TechZone Distributors has been added as a new supplier.', read: true, createdAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), NOW) },
    { id: 'notif-inv-1', type: 'inventory-updated', title: 'Inventory Updated', message: 'Monthly stock count completed. 247 products verified.', read: true, createdAt: randomDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), NOW) },
    { id: 'notif-np-1', type: 'new-product', title: 'New Product Added', message: 'Apple Watch Series 9 has been added to Wearables.', read: false, createdAt: randomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), NOW) },
  );

  return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// =========================================
// Build Activities
// =========================================
function buildActivities(products: Product[], txs: Transaction[]): Activity[] {
  const activities: Activity[] = [];
  const recentTxs = txs.slice(0, 12);

  recentTxs.forEach((tx, i) => {
    const prod = products.find(p => p.id === tx.productId);
    if (!prod) return;
    const typeMap = {
      'stock-in': { type: 'stock-in' as const, title: 'Stock In', status: 'success' as const },
      'stock-out': { type: 'stock-out' as const, title: 'Stock Out', status: 'info' as const },
      'transfer': { type: 'transaction-completed' as const, title: 'Transfer', status: 'info' as const },
      'adjustment': { type: 'transaction-completed' as const, title: 'Adjustment', status: 'warning' as const },
    };
    const cfg = typeMap[tx.type];
    activities.push({
      id: `act-tx-${i}`,
      type: cfg.type,
      title: cfg.title,
      description: `${tx.quantity} units of ${prod.name} — ${tx.reason}`,
      createdAt: tx.createdAt,
      status: cfg.status,
    });
  });

  activities.push(
    { id: 'act-sup-1', type: 'supplier-created', title: 'Supplier Added', description: 'InnovateTech Traders added as active supplier', createdAt: randomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), NOW), status: 'success' },
    { id: 'act-cat-1', type: 'category-updated', title: 'Category Updated', description: 'Wearables category description updated', createdAt: randomDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), NOW), status: 'info' },
    { id: 'act-prod-1', type: 'product-added', title: 'Product Added', description: 'Garmin Forerunner 265 added to inventory', createdAt: randomDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), NOW), status: 'success' },
  );

  return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// =========================================
// Update category product counts
// =========================================
function updateCategoryCounts(cats: Category[], prods: Product[]): Category[] {
  return cats.map(cat => ({
    ...cat,
    productCount: prods.filter(p => p.categoryId === cat.id).length,
  }));
}

// =========================================
// Main Seed Function
// =========================================
export function seedData(): void {
  const alreadySeeded = readStorage<boolean>(STORAGE_KEYS.SEEDED, false);
  if (alreadySeeded) return;

  const products = buildProducts();
  const cats = updateCategoryCounts(categories, products);
  const transactions = buildTransactions(products);
  const notifications = buildNotifications(products);
  const activities = buildActivities(products, transactions);

  writeStorage(STORAGE_KEYS.CATEGORIES, cats);
  writeStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
  writeStorage(STORAGE_KEYS.PRODUCTS, products);
  writeStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  writeStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  writeStorage(STORAGE_KEYS.ACTIVITIES, activities);
  writeStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  writeStorage(STORAGE_KEYS.SEEDED, true);
}
