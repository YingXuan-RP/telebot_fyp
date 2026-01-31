document.addEventListener('DOMContentLoaded', () => {

  /* ===============================
     VIEW ORDER → GO TO DETAILS PAGE
     =============================== */
  document.querySelectorAll('.view-order').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      if (row) row.classList.add('row-active');

      const orderId = btn.dataset.id;
      window.location.href = `/orders/${orderId}`;
    });
  });

  /* ===============================
     STATUS BADGE STYLING
     =============================== */
  document.querySelectorAll('.status-badge').forEach(badge => {
    const status = badge.textContent.trim().toLowerCase();

    badge.classList.remove('paid', 'completed', 'pending', 'cancelled');

    if (status === 'paid') badge.classList.add('paid');
    if (status === 'completed') badge.classList.add('completed');
    if (status === 'pending') badge.classList.add('pending');
    if (status === 'cancelled') badge.classList.add('cancelled');
  });

  /* ===============================
     OPTIONAL STATUS FILTER
     (safe if filter doesn't exist)
     =============================== */
  const filter = document.getElementById('statusFilter');
  if (filter) {
    filter.addEventListener('change', () => {
      const value = filter.value;

      document.querySelectorAll('tbody tr').forEach(row => {
        const status = row
          .querySelector('.status-badge')
          .textContent.trim()
          .toLowerCase();

        row.style.display = !value || status === value ? '' : 'none';
      });
    });
  }

});
