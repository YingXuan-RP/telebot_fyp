document.addEventListener('DOMContentLoaded', () => {

  const timeSelect = document.getElementById('timePeriod');

  let salesChart;
  let topProductsChart;
  let categoryRevenueChart;

  /* ================= HELPERS ================= */

  function generateLabels(days) {
    const labels = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      labels.push(
        d.toLocaleDateString('en-SG', {
          day: '2-digit',
          month: 'short'
        })
      );
    }

    return labels;
  }

  /* ================= SUMMARY ================= */

  async function loadSummary(period) {
    try {
      const res = await fetch(`/api/analytics/summary?period=${period}`);
      const data = await res.json();

      // Gross Sales
      document.getElementById('analyticsRevenue').textContent =
        `SGD ${Number(data.revenue || 0).toFixed(2)}`;

      // Total Customers
      document.getElementById('analyticsCustomers').textContent =
        data.customers ?? 0;

      // Orders
      document.getElementById('analyticsTotalOrders').textContent =
        data.orders ?? 0;

    } catch (err) {
      console.error('Summary load failed:', err);
    }
  }

  /* ================= SALES OVER TIME ================= */

  async function loadSalesTimeline(period, labels) {

    const res = await fetch(`/api/analytics/sales-over-time?period=${period}`);
    const salesTimeline = await res.json();

    const salesData = labels.map(label => {
      const found = salesTimeline.find(row => {
        const d = new Date(row.date);
        const formatted = d.toLocaleDateString('en-SG', {
          day: '2-digit',
          month: 'short'
        });
        return formatted === label;
      });
      return found ? Number(found.revenue) : 0;
    });

    if (salesChart) salesChart.destroy();

    salesChart = new Chart(
      document.getElementById('salesOverTimeChart'),
      {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Sales',
            data: salesData,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.15)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    );
  }

  /* ================= TOP PRODUCTS ================= */

  async function loadTopProducts(period) {

    const res = await fetch(`/api/analytics/top-products?period=${period}`);
    const data = await res.json();

    const labels = data.map(p => p.name);
    const values = data.map(p => Number(p.total_sold));

    if (topProductsChart) topProductsChart.destroy();

    topProductsChart = new Chart(
      document.getElementById('sellingProductsChart'),
      {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Units Sold',
            data: values,
            backgroundColor: '#10b981'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    );
  }

  /* ================= REVENUE BY CATEGORY ================= */

  async function loadRevenueByCategory(period) {

    const res = await fetch(`/api/analytics/revenue-by-category?period=${period}`);
    const data = await res.json();

    const labels = data.map(r => r.category);
    const values = data.map(r => Number(r.revenue));

    if (categoryRevenueChart) categoryRevenueChart.destroy();

    categoryRevenueChart = new Chart(
      document.getElementById('revenueCategoryChart'),
      {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: [
              '#2563eb',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6',
              '#06b6d4',
              '#f97316'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      }
    );
  }

  /* ================= MAIN RENDER ================= */

  async function renderAnalytics() {

    const period = timeSelect?.value || 'today';
    const days = period === 'today' ? 1 : Number(period);
    const labels = generateLabels(days);

    await loadSummary(period);
    await loadSalesTimeline(period, labels);
    await loadTopProducts(period);
    await loadRevenueByCategory(period);
  }

  /* ================= INIT ================= */

  if (timeSelect) {
    timeSelect.value = 'today';
    timeSelect.addEventListener('change', renderAnalytics);
  }

  renderAnalytics();

});
