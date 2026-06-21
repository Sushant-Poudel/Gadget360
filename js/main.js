// ===== CONSTANTS =====
const INSTAGRAM = 'https://www.instagram.com/gadgets360.np/';

const CATEGORY_EMOJI = {
  smartphones: '📱', laptops: '💻', audio: '🎧',
  smartwatches: '⌚', cameras: '📸', gaming: '🎮',
  accessories: '🔌', networking: '📡',
};

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'iPhone 16 Pro Max', brand: 'Apple', desc: 'A18 Pro chip · 48MP camera system · Titanium design', price: 185000, oldPrice: null, category: 'smartphones', badge: 'new', status: 'active', featured: 'yes' },
  { id: 'p2', name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', desc: 'Snapdragon 8 Elite · 200MP · S Pen included', price: 175000, oldPrice: null, category: 'smartphones', badge: 'hot', status: 'active', featured: 'yes' },
  { id: 'p3', name: 'Sony WH-1000XM5', brand: 'Sony', desc: 'Industry-leading ANC · 30hr battery · Hi-Res Audio', price: 42000, oldPrice: 48000, category: 'audio', badge: '', status: 'active', featured: 'yes' },
  { id: 'p4', name: 'MacBook Pro M4', brand: 'Apple', desc: 'M4 chip · 14" Liquid Retina XDR · 24GB RAM', price: 245000, oldPrice: 265000, category: 'laptops', badge: 'sale', status: 'active', featured: 'yes' },
  { id: 'p5', name: 'Apple Watch Series 10', brand: 'Apple', desc: 'Thinnest Apple Watch ever · Health sensors · GPS', price: 65000, oldPrice: null, category: 'smartwatches', badge: 'new', status: 'active', featured: 'yes' },
  { id: 'p6', name: 'PlayStation 5 Slim', brand: 'Sony', desc: '4K gaming · Ultra-HD Blu-ray · DualSense controller', price: 75000, oldPrice: null, category: 'gaming', badge: '', status: 'active', featured: 'yes' },
];

const DEFAULT_DEALS = [
  { icon: '⚡', type: 'Flash Sale', pct: 'Up to 30% OFF' },
  { icon: '🎁', type: 'Bundle Deal', pct: 'Buy 2, Save 15%' },
  { icon: '🚚', type: 'Free Delivery', pct: 'Inside Valley' },
];

// ===== HELPERS =====
function dbGet(key, fallback) {
  try {
    const v = localStorage.getItem('g360_' + key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function fmtNPR(n) {
  return 'NPR ' + Number(n).toLocaleString('en-IN');
}

// ===== SETTINGS =====
function applySettings() {
  const s = dbGet('settings', null);
  if (!s) return;
  if (s.whatsapp) {
    const num = s.whatsapp.replace(/\D/g, '');
    document.getElementById('whatsappFab').href = `https://wa.me/${num}?text=Hi%20Gadgets360.np%2C%20I%27d%20like%20to%20enquire%20about%20a%20product.`;
  }
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const products = dbGet('products', DEFAULT_PRODUCTS);
  const featured = products.filter(p => p.featured === 'yes' && p.status === 'active');

  if (featured.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted)">No featured products yet. Add some in the admin panel.</div>`;
    return;
  }

  const insta = dbGet('settings', {})?.instagram || INSTAGRAM;

  grid.innerHTML = featured.map(p => {
    const emoji = CATEGORY_EMOJI[p.category] || '📦';
    const badge = p.badge ? `<div class="product-badge ${p.badge}">${p.badge}</div>` : '';
    const oldPrice = p.oldPrice ? `<span class="price-old">${fmtNPR(p.oldPrice)}</span>` : '';
    const orderMsg = encodeURIComponent(`Hi! I'd like to order: ${p.name} (${fmtNPR(p.price)})`);
    const waNum = (dbGet('settings', {})?.whatsapp || '+9779861913669').replace(/\D/g, '');

    return `
      <div class="product-card">
        ${badge}
        <div class="product-img-wrap">
          <div class="product-emoji-display">${emoji}</div>
        </div>
        <div class="product-body">
          <p class="product-brand">${p.brand}</p>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc || ''}</p>
          <div class="product-footer">
            <div class="product-price">
              <span class="price-current">${fmtNPR(p.price)}</span>
              ${oldPrice}
            </div>
            <div style="display:flex;gap:6px">
              <a href="https://wa.me/${waNum}?text=${orderMsg}" target="_blank" rel="noopener" class="btn-order btn-wa" title="Order via WhatsApp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="${insta}" target="_blank" rel="noopener" class="btn-order">Order</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== RENDER DEALS =====
function renderDeals() {
  const container = document.getElementById('dealsCards');
  if (!container) return;
  const deals = dbGet('deals', DEFAULT_DEALS);
  container.innerHTML = deals.map(d => `
    <div class="deal-card">
      <div class="deal-icon">${d.icon}</div>
      <div class="deal-info">
        <p class="deal-type">${d.type}</p>
        <p class="deal-pct">${d.pct}</p>
      </div>
    </div>
  `).join('');
}

// ===== CONTACT FORM with ORDER SAVING =====
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const product = document.getElementById('product').value.trim();
    const message = document.getElementById('message').value.trim();

    // Save as inquiry in admin data
    const inquiries = dbGet('inquiries', []);
    inquiries.push({
      id: 'i' + Date.now(),
      name: name || 'Unknown',
      phone,
      product,
      message,
      read: false,
      createdAt: Date.now(),
    });
    try { localStorage.setItem('g360_inquiries', JSON.stringify(inquiries)); } catch {}

    // Also save as order if product specified
    if (product) {
      const orders = dbGet('orders', []);
      orders.push({
        id: 'o' + Date.now(),
        name: name || 'Unknown',
        phone,
        product,
        price: 0,
        status: 'new',
        notes: message,
        createdAt: Date.now(),
      });
      try { localStorage.setItem('g360_orders', JSON.stringify(orders)); } catch {}
    }

    form.parentElement.innerHTML = `
      <div class="form-success">
        <div class="success-icon">🎉</div>
        <h3>Thanks, ${name || 'friend'}!</h3>
        <p>We've received your message and will reach out to you shortly via Instagram or WhatsApp.</p>
        <br/>
        <a href="${INSTAGRAM}" target="_blank" rel="noopener" class="btn btn-primary" style="margin-top:8px;">
          Follow @gadgets360.np
        </a>
      </div>
    `;
  });
}

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 50;
  navbar.classList.toggle('scrolled', scrolled);
  backToTop.classList.toggle('visible', scrolled);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  const open = navLinks.classList.contains('open');
  spans[0].style.transform = open ? 'rotate(45deg) translateY(7px)' : '';
  spans[1].style.opacity = open ? '0' : '';
  spans[2].style.transform = open ? 'rotate(-45deg) translateY(-7px)' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ===== BACK TO TOP =====
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== SCROLL ANIMATIONS =====
const animateEls = document.querySelectorAll(
  '.category-card, .why-card, .testimonial-card, .deal-card, .contact-card, .about-card-stack, .about-text'
);
animateEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

animateEls.forEach(el => observer.observe(el));

// Also animate products after they render
function observeProducts() {
  document.querySelectorAll('.product-card').forEach((el, i) => {
    el.classList.add('fade-in');
    setTimeout(() => el.classList.add('visible'), i * 80);
  });
}

// ===== ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${entry.target.id}` ? 'var(--text)' : '';
      });
    }
  });
}, { threshold: 0.4 }).observe = (() => {
  const orig = IntersectionObserver.prototype.observe;
  return function(el) { orig.call(this, el); };
})();

sections.forEach(s => observer.observe(s));

// ===== WHATSAPP FAB SETUP =====
function setupWhatsapp() {
  const fab = document.getElementById('whatsappFab');
  if (!fab) return;
  const s = dbGet('settings', {});
  const num = (s.whatsapp || '9779861913669').replace(/\D/g, '');
  fab.href = `https://wa.me/${num}?text=Hi%20Gadgets360.np%2C%20I%27d%20like%20to%20enquire%20about%20a%20product.`;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applySettings();
  renderProducts();
  renderDeals();
  observeProducts();
  initContactForm();
  setupWhatsapp();
});
