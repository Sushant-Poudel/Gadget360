// ===== AUTH GUARD =====
if (sessionStorage.getItem('g360_admin') !== 'true') {
  window.location.href = 'index.html';
}

// ===== INIT =====
DB.init();

let currentPage = 'dashboard';

// ===== NAV =====
const navItems = document.querySelectorAll('.nav-item');
const pageContent = document.getElementById('pageContent');
const topbarTitle = document.getElementById('topbarTitle');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    switchPage(page);
  });
});

function switchPage(page) {
  currentPage = page;
  navItems.forEach(n => n.classList.toggle('active', n.dataset.page === page));
  topbarTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
  renderPage(page);
  updateBadges();
}

function updateBadges() {
  const orders = DB.get('orders', []);
  const inquiries = DB.get('inquiries', []);
  const newOrders = orders.filter(o => o.status === 'new').length;
  const unreadInq = inquiries.filter(i => !i.read).length;

  const ob = document.getElementById('ordersBadge');
  const ib = document.getElementById('inquiriesBadge');
  ob.textContent = newOrders;
  ob.classList.toggle('show', newOrders > 0);
  ib.textContent = unreadInq;
  ib.classList.toggle('show', unreadInq > 0);
}

// ===== TOAST =====
function toast(msg, type = 'success') {
  const wrap = document.getElementById('toastWrap');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${type === 'success' ? '✅' : '❌'} ${msg}`;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ===== SIDEBAR TOGGLE =====
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('g360_admin');
  window.location.href = 'index.html';
});

// ===== RENDER PAGE =====
function renderPage(page) {
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'products': renderProducts(); break;
    case 'orders': renderOrders(); break;
    case 'inquiries': renderInquiries(); break;
    case 'deals': renderDeals(); break;
    case 'settings': renderSettings(); break;
  }
}

// ===== DASHBOARD =====
function renderDashboard() {
  const products = DB.get('products', []);
  const orders = DB.get('orders', []);
  const inquiries = DB.get('inquiries', []);
  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.price || 0), 0);

  const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const barHeights = [40, 65, 45, 80, 55, 90, 70];

  pageContent.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card purple">
        <div class="stat-icon">📦</div>
        <div class="stat-label">Total Products</div>
        <div class="stat-value">${products.length}</div>
        <div class="stat-sub">${products.filter(p => p.status === 'active').length} active</div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon">🛒</div>
        <div class="stat-label">Total Orders</div>
        <div class="stat-value">${orders.length}</div>
        <div class="stat-sub">${orders.filter(o => o.status === 'new').length} new orders</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">💰</div>
        <div class="stat-label">Revenue (Delivered)</div>
        <div class="stat-value">${(revenue / 100000).toFixed(1)}L</div>
        <div class="stat-sub">NPR ${revenue.toLocaleString('en-IN')}</div>
      </div>
      <div class="stat-card yellow">
        <div class="stat-icon">💬</div>
        <div class="stat-label">Inquiries</div>
        <div class="stat-value">${inquiries.length}</div>
        <div class="stat-sub">${inquiries.filter(i => !i.read).length} unread</div>
      </div>
    </div>

    <div class="chart-placeholder">
      <div class="chart-header">
        <h3>Weekly Orders Overview</h3>
        <span style="font-size:0.78rem;color:var(--text-muted)">This week</span>
      </div>
      <div class="chart-bars">
        ${dayLabels.map((l, i) => `
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="height:${barHeights[i]}%"></div>
            <div class="chart-label">${l}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="panels-row">
      <div class="panel">
        <div class="panel-header">
          <h3>Recent Orders</h3>
          <button class="panel-link" onclick="switchPage('orders')">View all</button>
        </div>
        <div class="activity-list">
          ${orders.slice(-5).reverse().map(o => `
            <div class="activity-item">
              <div class="activity-icon">🛒</div>
              <div class="activity-info">
                <div class="activity-name">${o.name}</div>
                <div class="activity-sub">${o.product}</div>
              </div>
              <span class="pill pill-${o.status}">${o.status}</span>
            </div>
          `).join('') || '<div class="empty-state"><p>No orders yet</p></div>'}
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <h3>Recent Inquiries</h3>
          <button class="panel-link" onclick="switchPage('inquiries')">View all</button>
        </div>
        <div class="activity-list">
          ${inquiries.slice(-5).reverse().map(i => `
            <div class="activity-item">
              <div class="activity-icon">💬</div>
              <div class="activity-info">
                <div class="activity-name">${i.name} ${!i.read ? '<span style="color:var(--accent);font-size:0.7rem;font-weight:700;margin-left:4px">NEW</span>' : ''}</div>
                <div class="activity-sub">${i.product || 'General enquiry'}</div>
              </div>
              <span style="font-size:0.72rem;color:var(--text-muted)">${fmtTime(i.createdAt)}</span>
            </div>
          `).join('') || '<div class="empty-state"><p>No inquiries yet</p></div>'}
        </div>
      </div>
    </div>
  `;
}

// ===== PRODUCTS =====
let productSearch = '';
let productFilter = 'all';

function renderProducts() {
  let products = DB.get('products', []);

  if (productSearch) {
    const q = productSearch.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }
  if (productFilter !== 'all') {
    products = products.filter(p => p.category === productFilter);
  }

  pageContent.innerHTML = `
    <div class="page-header">
      <h2>Products <span style="color:var(--text-muted);font-size:0.85rem;font-weight:400">(${products.length})</span></h2>
      <button class="btn-primary" id="addProductBtn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Product
      </button>
    </div>

    <div class="table-wrap">
      <div class="table-toolbar">
        <input class="search-input" id="productSearch" placeholder="Search products..." value="${productSearch}" />
        <select class="filter-select" id="productCatFilter">
          <option value="all">All Categories</option>
          ${Object.entries(CATEGORY_MAP).map(([k, v]) => `<option value="${k}" ${productFilter === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>
      <div style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Badge</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${products.length === 0 ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📦</div><p>No products found</p></div></td></tr>` :
              products.map(p => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="font-size:1.4rem">${CATEGORY_EMOJI[p.category] || '📦'}</div>
                    <div>
                      <div style="font-weight:600;font-size:0.9rem">${p.name}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted)">${p.brand}</div>
                    </div>
                  </div>
                </td>
                <td><span style="font-size:0.82rem;color:var(--text-muted)">${CATEGORY_MAP[p.category] || p.category}</span></td>
                <td>
                  <div style="font-weight:600;font-size:0.9rem">${fmtNPR(p.price)}</div>
                  ${p.oldPrice ? `<div style="font-size:0.75rem;color:var(--text-muted);text-decoration:line-through">${fmtNPR(p.oldPrice)}</div>` : ''}
                </td>
                <td>${p.badge ? `<span class="pill pill-${p.badge}">${p.badge}</span>` : '<span style="color:var(--text-muted);font-size:0.8rem">—</span>'}</td>
                <td><span class="pill pill-${p.status}">${p.status}</span></td>
                <td><span style="font-size:0.85rem">${p.featured === 'yes' ? '⭐ Yes' : '—'}</span></td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="btn-icon edit" onclick="openEditProduct('${p.id}')" title="Edit">✏️</button>
                    <button class="btn-icon delete" onclick="deleteProduct('${p.id}')" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('addProductBtn').addEventListener('click', openAddProduct);
  document.getElementById('productSearch').addEventListener('input', e => {
    productSearch = e.target.value;
    renderProducts();
  });
  document.getElementById('productCatFilter').addEventListener('change', e => {
    productFilter = e.target.value;
    renderProducts();
  });
}

function openAddProduct() {
  document.getElementById('modalTitle').textContent = 'Add Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('productModal').hidden = false;
}

function openEditProduct(id) {
  const products = DB.get('products', []);
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modalTitle').textContent = 'Edit Product';
  document.getElementById('productId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pBrand').value = p.brand;
  document.getElementById('pDesc').value = p.desc || '';
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pOldPrice').value = p.oldPrice || '';
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pBadge').value = p.badge || '';
  document.getElementById('pStatus').value = p.status;
  document.getElementById('pFeatured').value = p.featured;
  document.getElementById('productModal').hidden = false;
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  let products = DB.get('products', []);
  products = products.filter(p => p.id !== id);
  DB.set('products', products);
  toast('Product deleted');
  renderProducts();
}

// Product form submit
document.getElementById('productForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const newProduct = {
    id: id || uid(),
    name: document.getElementById('pName').value.trim(),
    brand: document.getElementById('pBrand').value.trim(),
    desc: document.getElementById('pDesc').value.trim(),
    price: parseFloat(document.getElementById('pPrice').value),
    oldPrice: document.getElementById('pOldPrice').value ? parseFloat(document.getElementById('pOldPrice').value) : null,
    category: document.getElementById('pCategory').value,
    badge: document.getElementById('pBadge').value,
    status: document.getElementById('pStatus').value,
    featured: document.getElementById('pFeatured').value,
    createdAt: id ? undefined : Date.now(),
  };

  let products = DB.get('products', []);
  if (id) {
    const idx = products.findIndex(p => p.id === id);
    newProduct.createdAt = products[idx].createdAt;
    products[idx] = newProduct;
    toast('Product updated ✨');
  } else {
    products.push(newProduct);
    toast('Product added ✨');
  }
  DB.set('products', products);
  document.getElementById('productModal').hidden = true;
  renderProducts();
});

// Modal close
['modalClose', 'modalCancel'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    document.getElementById('productModal').hidden = true;
  });
});
document.getElementById('productModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('productModal')) {
    document.getElementById('productModal').hidden = true;
  }
});

// ===== ORDERS =====
let orderSearch = '';
let orderStatusFilter = 'all';

function renderOrders() {
  let orders = DB.get('orders', []).slice().reverse();
  if (orderSearch) {
    const q = orderSearch.toLowerCase();
    orders = orders.filter(o => o.name.toLowerCase().includes(q) || o.product.toLowerCase().includes(q));
  }
  if (orderStatusFilter !== 'all') {
    orders = orders.filter(o => o.status === orderStatusFilter);
  }

  pageContent.innerHTML = `
    <div class="page-header">
      <h2>Orders <span style="color:var(--text-muted);font-size:0.85rem;font-weight:400">(${orders.length})</span></h2>
      <button class="btn-primary" id="addOrderBtn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Order
      </button>
    </div>
    <div class="table-wrap">
      <div class="table-toolbar">
        <input class="search-input" id="orderSearch" placeholder="Search orders..." value="${orderSearch}" />
        <select class="filter-select" id="orderStatusFilter">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Product</th>
              <th>Price</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orders.length === 0 ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🛒</div><p>No orders found</p></div></td></tr>` :
              orders.map(o => `
              <tr>
                <td>
                  <div style="font-weight:600;font-size:0.9rem">${o.name}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">${o.phone || '—'}</div>
                </td>
                <td style="font-size:0.88rem">${o.product}</td>
                <td style="font-weight:600;font-size:0.88rem">${fmtNPR(o.price || 0)}</td>
                <td><span class="pill pill-${o.status}">${o.status}</span></td>
                <td style="font-size:0.78rem;color:var(--text-muted)">${fmtDate(o.createdAt)}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="btn-icon edit" onclick="openEditOrder('${o.id}')" title="Edit">✏️</button>
                    <button class="btn-icon delete" onclick="deleteOrder('${o.id}')" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('orderSearch').addEventListener('input', e => { orderSearch = e.target.value; renderOrders(); });
  document.getElementById('orderStatusFilter').addEventListener('change', e => { orderStatusFilter = e.target.value; renderOrders(); });
  document.getElementById('addOrderBtn').addEventListener('click', openAddOrder);
  document.getElementById('orderStatusFilter').value = orderStatusFilter;
}

function openAddOrder() {
  document.getElementById('editOrderId').value = '';
  document.getElementById('editOrderName').value = '';
  document.getElementById('editOrderName').removeAttribute('readonly');
  document.getElementById('editOrderProduct').value = '';
  document.getElementById('editOrderProduct').removeAttribute('readonly');
  document.getElementById('editOrderStatus').value = 'new';
  document.getElementById('editOrderNotes').value = '';
  document.querySelector('#orderModal .modal-header h3').textContent = 'Add Order';
  document.getElementById('orderModal').hidden = false;
}

function openEditOrder(id) {
  const orders = DB.get('orders', []);
  const o = orders.find(x => x.id === id);
  if (!o) return;
  document.getElementById('editOrderId').value = o.id;
  document.getElementById('editOrderName').value = o.name;
  document.getElementById('editOrderName').setAttribute('readonly', true);
  document.getElementById('editOrderProduct').value = o.product;
  document.getElementById('editOrderProduct').setAttribute('readonly', true);
  document.getElementById('editOrderStatus').value = o.status;
  document.getElementById('editOrderNotes').value = o.notes || '';
  document.querySelector('#orderModal .modal-header h3').textContent = 'Update Order';
  document.getElementById('orderModal').hidden = false;
}

function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  let orders = DB.get('orders', []);
  orders = orders.filter(o => o.id !== id);
  DB.set('orders', orders);
  toast('Order deleted');
  renderOrders();
  updateBadges();
}

document.getElementById('saveOrderBtn').addEventListener('click', () => {
  const id = document.getElementById('editOrderId').value;
  let orders = DB.get('orders', []);
  if (id) {
    const idx = orders.findIndex(o => o.id === id);
    orders[idx].status = document.getElementById('editOrderStatus').value;
    orders[idx].notes = document.getElementById('editOrderNotes').value;
    toast('Order updated');
  } else {
    orders.push({
      id: uid(),
      name: document.getElementById('editOrderName').value.trim() || 'Unknown',
      phone: '',
      product: document.getElementById('editOrderProduct').value.trim() || 'Unknown',
      price: 0,
      status: document.getElementById('editOrderStatus').value,
      notes: document.getElementById('editOrderNotes').value,
      createdAt: Date.now(),
    });
    toast('Order added');
  }
  DB.set('orders', orders);
  document.getElementById('orderModal').hidden = false;
  document.getElementById('orderModal').hidden = true;
  renderOrders();
  updateBadges();
});

['orderModalClose', 'orderModalCancel'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    document.getElementById('orderModal').hidden = true;
  });
});

// ===== INQUIRIES =====
function renderInquiries() {
  let inquiries = DB.get('inquiries', []).slice().reverse();

  pageContent.innerHTML = `
    <div class="page-header">
      <h2>Inquiries <span style="color:var(--text-muted);font-size:0.85rem;font-weight:400">(${inquiries.length})</span></h2>
      <button class="btn-ghost" onclick="markAllRead()">Mark all read</button>
    </div>
    <div class="table-wrap">
      <div style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Product</th>
              <th>Message</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${inquiries.length === 0 ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">💬</div><p>No inquiries yet</p></div></td></tr>` :
              inquiries.map(i => `
              <tr style="${!i.read ? 'background:rgba(108,99,255,0.04)' : ''}">
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    ${!i.read ? '<span style="width:7px;height:7px;border-radius:50%;background:var(--primary);flex-shrink:0;display:inline-block"></span>' : '<span style="width:7px;height:7px;border-radius:50%;display:inline-block"></span>'}
                    <span style="font-weight:${!i.read ? '700' : '500'}">${i.name}</span>
                  </div>
                </td>
                <td style="font-size:0.82rem;color:var(--text-muted)">${i.phone || '—'}</td>
                <td style="font-size:0.85rem">${i.product || '—'}</td>
                <td style="font-size:0.82rem;color:var(--text-soft);max-width:260px">
                  <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.message}</div>
                </td>
                <td style="font-size:0.75rem;color:var(--text-muted);white-space:nowrap">${fmtTime(i.createdAt)}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    ${!i.read ? `<button class="btn-icon view" onclick="markRead('${i.id}')" title="Mark read">✓</button>` : ''}
                    <button class="btn-icon delete" onclick="deleteInquiry('${i.id}')" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function markRead(id) {
  let inqs = DB.get('inquiries', []);
  const i = inqs.find(x => x.id === id);
  if (i) i.read = true;
  DB.set('inquiries', inqs);
  toast('Marked as read');
  renderInquiries();
  updateBadges();
}
function markAllRead() {
  let inqs = DB.get('inquiries', []).map(i => ({ ...i, read: true }));
  DB.set('inquiries', inqs);
  toast('All marked as read');
  renderInquiries();
  updateBadges();
}
function deleteInquiry(id) {
  if (!confirm('Delete this inquiry?')) return;
  let inqs = DB.get('inquiries', []);
  inqs = inqs.filter(i => i.id !== id);
  DB.set('inquiries', inqs);
  toast('Inquiry deleted');
  renderInquiries();
  updateBadges();
}

// ===== DEALS =====
function renderDeals() {
  const deals = DB.get('deals', DEFAULT_DEALS);

  pageContent.innerHTML = `
    <div class="page-header">
      <h2>Deals & Banners</h2>
    </div>
    <div class="deals-grid">
      ${deals.map((d, i) => `
        <div class="deal-edit-card">
          <h4>${d.icon} Deal ${i + 1}</h4>
          <div class="form-group">
            <label>Icon (emoji)</label>
            <input type="text" id="dealIcon${i}" value="${d.icon}" maxlength="4" />
          </div>
          <div class="form-group">
            <label>Type / Label</label>
            <input type="text" id="dealType${i}" value="${d.type}" />
          </div>
          <div class="form-group">
            <label>Highlight Text</label>
            <input type="text" id="dealPct${i}" value="${d.pct}" />
          </div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:24px">
      <button class="btn-settings-save" onclick="saveDeals(${deals.length})">Save Deals</button>
    </div>
  `;
}

function saveDeals(count) {
  const deals = [];
  for (let i = 0; i < count; i++) {
    deals.push({
      icon: document.getElementById(`dealIcon${i}`).value.trim() || '⚡',
      type: document.getElementById(`dealType${i}`).value.trim(),
      pct: document.getElementById(`dealPct${i}`).value.trim(),
    });
  }
  DB.set('deals', deals);
  toast('Deals saved! Refresh the site to see changes.');
}

// ===== SETTINGS =====
function renderSettings() {
  const s = DB.get('settings', DEFAULT_SETTINGS);

  pageContent.innerHTML = `
    <div class="page-header">
      <h2>Settings</h2>
    </div>
    <div class="settings-grid">
      <div class="settings-card">
        <h3>🏪 Store Info</h3>
        <div class="form-group">
          <label>Store Name</label>
          <input type="text" id="sStoreName" value="${s.storeName || ''}" />
        </div>
        <div class="form-group">
          <label>Tagline</label>
          <input type="text" id="sTagline" value="${s.tagline || ''}" />
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" id="sLocation" value="${s.location || ''}" />
        </div>
        <div class="form-group">
          <label>Delivery Note</label>
          <input type="text" id="sDelivery" value="${s.deliveryNote || ''}" />
        </div>
        <button class="btn-settings-save" onclick="saveSettings()">Save Store Info</button>
      </div>

      <div class="settings-card">
        <h3>📱 Contact & Social</h3>
        <div class="form-group">
          <label>Instagram URL</label>
          <input type="url" id="sInstagram" value="${s.instagram || ''}" />
        </div>
        <div class="form-group">
          <label>WhatsApp Number</label>
          <input type="text" id="sWhatsapp" value="${s.whatsapp || ''}" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="sEmail" value="${s.email || ''}" />
        </div>
        <button class="btn-settings-save" onclick="saveSettings()">Save Contact Info</button>
      </div>

      <div class="settings-card">
        <h3>🖥️ Hero Section</h3>
        <div class="form-group">
          <label>Hero Title</label>
          <input type="text" id="sHeroTitle" value="${s.heroTitle || ''}" />
        </div>
        <div class="form-group">
          <label>Hero Subtitle</label>
          <textarea id="sHeroSub" rows="3">${s.heroSubtitle || ''}</textarea>
        </div>
        <button class="btn-settings-save" onclick="saveSettings()">Save Hero Content</button>
      </div>

      <div class="settings-card">
        <h3>🔒 Change Password</h3>
        <div class="form-group">
          <label>Current Password</label>
          <input type="password" id="sCurrPw" placeholder="••••••••" />
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" id="sNewPw" placeholder="New password" />
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input type="password" id="sConfPw" placeholder="Repeat new password" />
        </div>
        <button class="btn-settings-save" onclick="changePassword()">Update Password</button>
      </div>
    </div>
  `;
}

function saveSettings() {
  const s = {
    storeName: document.getElementById('sStoreName')?.value || '',
    tagline: document.getElementById('sTagline')?.value || '',
    location: document.getElementById('sLocation')?.value || '',
    deliveryNote: document.getElementById('sDelivery')?.value || '',
    instagram: document.getElementById('sInstagram')?.value || '',
    whatsapp: document.getElementById('sWhatsapp')?.value || '',
    email: document.getElementById('sEmail')?.value || '',
    heroTitle: document.getElementById('sHeroTitle')?.value || '',
    heroSubtitle: document.getElementById('sHeroSub')?.value || '',
  };
  DB.set('settings', s);
  toast('Settings saved! Refresh the main site to see changes.');
}

function changePassword() {
  const curr = document.getElementById('sCurrPw').value;
  const nw = document.getElementById('sNewPw').value;
  const conf = document.getElementById('sConfPw').value;
  const stored = DB.get('adminPassword', 'gadgets360');

  if (curr !== stored) { toast('Current password incorrect', 'error'); return; }
  if (nw.length < 6) { toast('New password must be 6+ characters', 'error'); return; }
  if (nw !== conf) { toast('Passwords do not match', 'error'); return; }
  DB.set('adminPassword', nw);
  toast('Password updated! Use new password next login.');
  document.getElementById('sCurrPw').value = '';
  document.getElementById('sNewPw').value = '';
  document.getElementById('sConfPw').value = '';
}

// ===== INIT RENDER =====
renderPage('dashboard');
updateBadges();
