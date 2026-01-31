document.addEventListener('DOMContentLoaded', () => {

  /* ================= HELPERS ================= */

  const el = (id) => document.getElementById(id);

  const safeText = (id, value) => {
    const e = el(id);
    if (e) e.innerText = value;
  };

  const safeHTML = (id, value) => {
    const e = el(id);
    if (e) e.innerHTML = value;
  };

  const safeWidth = (id, value) => {
    const e = el(id);
    if (e) e.style.width = value;
  };

  const fetchJSON = (url) =>
    fetch(url).then(res => res.json()).catch(() => null);


  /* ================= SUMMARY ================= */

  fetchJSON('/api/dashboard/summary').then(data => {

    if (!data) return;

    const revenue = Number(data.totalRevenue || 0);

    safeText('totalOrders', data.totalOrders || 0);
    safeText('totalRevenue', `$${revenue.toFixed(2)}`);
    safeText('totalProducts', data.totalProducts || 0);
    safeText('totalCategories', data.totalCategories || 0);

    /* ===== SALES TARGET PROGRESS ===== */
    const target = 5000;
    const percent = Math.min((revenue / target) * 100, 100);

    safeText('salesTargetPercent', percent.toFixed(1) + '%');
    safeWidth('salesTargetBar', percent + '%');
    safeText('currentRevenue', `$${revenue.toFixed(2)}`);
    safeText('targetRevenue', `$${target}`);

  });


  /* ================= LOW STOCK ================= */

  fetchJSON('/api/dashboard/low-stock').then(products => {

    const list = el('lowStockList');
    if (!list) return;

    if (!products || !products.length) {
      list.innerHTML = '<p>No low stock items</p>';
      return;
    }

    list.innerHTML = products
      .map(p => `<p>${p.name} (Stock: ${p.stock})</p>`)
      .join('');

  });


  /* ================= OUT OF STOCK ================= */

  fetchJSON('/api/dashboard/out-of-stock').then(products => {

    const alertBox = el('outOfStockAlert');
    const message = el('outOfStockMessage');

    if (!alertBox || !message) return;

    if (!products || !products.length) {
      alertBox.style.display = 'none';
      return;
    }

    message.textContent =
      `Out of stock: ${products.map(p => p.name).join(', ')}`;

    alertBox.style.display = 'flex';

  });


  /* ================= RECENT ORDERS ================= */

  fetchJSON('/api/dashboard/recent-orders').then(orders => {

    const table = el('recentOrdersTable');
    if (!table) return;

    if (!orders || !orders.length) {
      table.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No recent orders</td>
        </tr>`;
      return;
    }

    table.innerHTML = orders.map(o => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.customer_name || 'Telegram User'}</td>
        <td>${o.items || 0}</td>
        <td>$${Number(o.amount || 0).toFixed(2)}</td>
        <td>${o.status}</td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');

  });


  /* ================= TOP CATEGORIES ================= */

  fetchJSON('/api/dashboard/top-categories').then(categories => {

    const container = el('topCategoriesList');
    if (!container) return;

    if (!categories || !categories.length) {
      container.innerHTML = '<p>No category sales yet</p>';
      return;
    }

    const max = Math.max(...categories.map(c => c.total));

    container.innerHTML = categories.map(cat => {

      const percent = max ? (cat.total / max) * 100 : 0;

      return `
        <div class="category-bar">
          <div class="category-label">
            <span>${cat.name}</span>
            <span>$${Number(cat.total).toFixed(2)}</span>
          </div>
          <div class="category-bar-bg">
            <div class="category-bar-fill" style="width:${percent}%"></div>
          </div>
        </div>
      `;
    }).join('');

  });

});
