// ===== DEFAULT DATA =====
const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'iPhone 16 Pro Max', brand: 'Apple', desc: 'A18 Pro chip · 48MP camera system · Titanium design', price: 185000, oldPrice: null, category: 'smartphones', badge: 'new', status: 'active', featured: 'yes', createdAt: Date.now() - 86400000 * 5 },
  { id: 'p2', name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', desc: 'Snapdragon 8 Elite · 200MP · S Pen included', price: 175000, oldPrice: null, category: 'smartphones', badge: 'hot', status: 'active', featured: 'yes', createdAt: Date.now() - 86400000 * 4 },
  { id: 'p3', name: 'Sony WH-1000XM5', brand: 'Sony', desc: 'Industry-leading ANC · 30hr battery · Hi-Res Audio', price: 42000, oldPrice: 48000, category: 'audio', badge: '', status: 'active', featured: 'yes', createdAt: Date.now() - 86400000 * 3 },
  { id: 'p4', name: 'MacBook Pro M4', brand: 'Apple', desc: 'M4 chip · 14" Liquid Retina XDR · 24GB RAM', price: 245000, oldPrice: 265000, category: 'laptops', badge: 'sale', status: 'active', featured: 'yes', createdAt: Date.now() - 86400000 * 2 },
  { id: 'p5', name: 'Apple Watch Series 10', brand: 'Apple', desc: 'Thinnest Apple Watch ever · Health sensors · GPS', price: 65000, oldPrice: null, category: 'smartwatches', badge: 'new', status: 'active', featured: 'yes', createdAt: Date.now() - 86400000 },
  { id: 'p6', name: 'PlayStation 5 Slim', brand: 'Sony', desc: '4K gaming · Ultra-HD Blu-ray · DualSense controller', price: 75000, oldPrice: null, category: 'gaming', badge: '', status: 'active', featured: 'yes', createdAt: Date.now() },
  { id: 'p7', name: 'OnePlus 13', brand: 'OnePlus', desc: 'Snapdragon 8 Elite · Hasselblad Camera · 100W charging', price: 95000, oldPrice: null, category: 'smartphones', badge: 'new', status: 'active', featured: 'no', createdAt: Date.now() },
  { id: 'p8', name: 'JBL Charge 5', brand: 'JBL', desc: 'Portable BT speaker · IP67 waterproof · 20hr battery', price: 18500, oldPrice: 21000, category: 'audio', badge: 'sale', status: 'active', featured: 'no', createdAt: Date.now() },
];

const DEFAULT_ORDERS = [
  { id: 'o1', name: 'Rajan Shrestha', phone: '9841234567', product: 'iPhone 16 Pro Max', price: 185000, status: 'delivered', notes: 'Same-day delivery to Baluwatar', createdAt: Date.now() - 86400000 * 3 },
  { id: 'o2', name: 'Priya Thapa', phone: '9812345678', product: 'MacBook Pro M4', price: 245000, status: 'shipped', notes: '', createdAt: Date.now() - 86400000 * 2 },
  { id: 'o3', name: 'Anish Maharjan', phone: '9867890123', product: 'Sony WH-1000XM5', price: 42000, status: 'confirmed', notes: 'Wants matte black', createdAt: Date.now() - 86400000 },
  { id: 'o4', name: 'Sita Karki', phone: '9854321098', product: 'Samsung Galaxy S25 Ultra', price: 175000, status: 'new', notes: '', createdAt: Date.now() - 3600000 * 2 },
  { id: 'o5', name: 'Bikash Rai', phone: '9823456789', product: 'Apple Watch Series 10', price: 65000, status: 'contacted', notes: 'Called, awaiting confirmation', createdAt: Date.now() - 3600000 },
];

const DEFAULT_INQUIRIES = [
  { id: 'i1', name: 'Nisha Gurung', phone: '9811234567', product: 'OnePlus 13', message: 'Is this available in blue? What is delivery time to Pokhara?', read: false, createdAt: Date.now() - 3600000 * 5 },
  { id: 'i2', name: 'Dipesh Tamang', phone: '9845678901', product: 'JBL Charge 5', message: 'Do you have any stock? Can I pick up from store?', read: true, createdAt: Date.now() - 86400000 },
  { id: 'i3', name: 'Sunita Lama', phone: '', product: 'PlayStation 5 Slim', message: 'Does it come with warranty? What payment methods do you accept?', read: false, createdAt: Date.now() - 1800000 },
];

const DEFAULT_SETTINGS = {
  storeName: 'Gadgets360.np',
  tagline: "Nepal's Premier Tech Destination",
  instagram: 'https://www.instagram.com/gadgets360.np/',
  facebook: 'https://www.facebook.com/101367152878558',
  tiktok: 'https://www.tiktok.com/@gadgets360np',
  youtube: 'https://youtube.com/@Gadgets360np',
  whatsapp: '+9779861913669',
  email: 'support@gameshopnepal.com',
  location: 'Mid Baneshwor, Near Ratna Rajya School, Kathmandu',
  mapsUrl: 'https://maps.app.goo.gl/Wqn9HfNVhs7SYA4a8',
  hoursWeekday: 'Sun – Fri: 10:30am – 8:00pm',
  hoursSaturday: 'Saturday: 12:00pm – 8:00pm',
  deliveryNote: 'Same-day delivery inside valley. Nationwide 3-5 days.',
  refundPolicy: 'No Refunds on any products.',
  heroTitle: 'Discover the Future of Technology',
  heroSubtitle: 'Smartphones, laptops, audio gear, and accessories — curated for Nepal.',
};

const DEFAULT_DEALS = [
  { icon: '⚡', type: 'Flash Sale', pct: 'Up to 30% OFF' },
  { icon: '🎁', type: 'Bundle Deal', pct: 'Buy 2, Save 15%' },
  { icon: '🚚', type: 'Free Delivery', pct: 'Inside Valley' },
];

// ===== STORAGE HELPERS =====
const DB = {
  get: (key, fallback) => {
    try {
      const v = localStorage.getItem('g360_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem('g360_' + key, JSON.stringify(value)); } catch {}
  },
  init: () => {
    if (!localStorage.getItem('g360_products')) DB.set('products', DEFAULT_PRODUCTS);
    if (!localStorage.getItem('g360_orders')) DB.set('orders', DEFAULT_ORDERS);
    if (!localStorage.getItem('g360_inquiries')) DB.set('inquiries', DEFAULT_INQUIRIES);
    if (!localStorage.getItem('g360_settings')) DB.set('settings', DEFAULT_SETTINGS);
    if (!localStorage.getItem('g360_deals')) DB.set('deals', DEFAULT_DEALS);
  }
};

const CATEGORY_MAP = {
  smartphones: '📱 Smartphones',
  laptops: '💻 Laptops',
  audio: '🎧 Audio',
  smartwatches: '⌚ Smartwatches',
  cameras: '📸 Cameras',
  gaming: '🎮 Gaming',
  accessories: '🔌 Accessories',
  networking: '📡 Networking',
};

const CATEGORY_EMOJI = {
  smartphones: '📱', laptops: '💻', audio: '🎧',
  smartwatches: '⌚', cameras: '📸', gaming: '🎮',
  accessories: '🔌', networking: '📡',
};

function fmtNPR(n) { return 'NPR ' + Number(n).toLocaleString('en-IN'); }
function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(ts) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return fmtDate(ts);
}
function uid() { return 'x' + Math.random().toString(36).slice(2, 9); }
