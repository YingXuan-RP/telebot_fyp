let discounts = [];
let currentPage = 1;
const pageSize = 10;
let editingId = null;

/* ================= LOAD ================= */
document.addEventListener('DOMContentLoaded', () => {

  loadDiscounts();

  const createBtn = document.getElementById('createBtn');
  if (createBtn) {
    createBtn.addEventListener('click', openCreateModal);
  }

  const form = document.getElementById('discountForm');
  if (form) {
    form.addEventListener('submit', saveDiscount);
  }

  // ⭐ Apply Scope Toggle
  setupApplyScopeToggle();

});

/* ================= APPLY SCOPE TOGGLE ================= */
function setupApplyScopeToggle() {
  const radios = document.querySelectorAll("input[name='apply_scope']");
  const multiBox = document.getElementById("categoryMultiBox");

  if (!radios.length || !multiBox) return;

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "selected" && radio.checked) {
        multiBox.style.display = "block";
      } else {
        multiBox.style.display = "none";
      }
    });
  });
}

/* ================= FETCH ================= */
async function loadDiscounts() {
  try {
    const res = await fetch('/api/discounts');
    discounts = await res.json();
    currentPage = 1;
    renderTable();
  } catch (err) {
    console.error('Failed to load discounts', err);
  }
}

/* ================= TABLE ================= */
function renderTable() {
  const tbody = document.getElementById('discountsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const start = (currentPage - 1) * pageSize;
  const pageData = discounts.slice(start, start + pageSize);

  if (pageData.length === 0) {
    tbody.innerHTML =
      `<tr><td colspan="8" class="text-center">No discounts found</td></tr>`;
    return;
  }

  pageData.forEach(d => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${d.code}</td>
      <td>${d.type}</td>
      <td>${d.type === 'percentage' ? d.value + '%' : 'SGD ' + d.value}</td>
      <td>${d.usage_limit ?? '∞'}</td>
      <td>${d.used}</td>
      <td>${d.valid_until}</td>
      <td>
        <span class="badge ${d.is_active ? 'badge-success' : 'badge-secondary'}">
          ${d.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editDiscount(${d.id})">
          Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteDiscount(${d.id})">
          Delete
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  updatePagination();
}

/* ================= PAGINATION ================= */
function updatePagination() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (!prevBtn || !nextBtn) return;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * pageSize >= discounts.length;

  prevBtn.onclick = () => {
    currentPage--;
    renderTable();
  };

  nextBtn.onclick = () => {
    currentPage++;
    renderTable();
  };
}

/* ================= MODAL ================= */
function openCreateModal() {
  editingId = null;

  document.getElementById('modalTitle').innerText = 'Create Discount';
  document.getElementById('discountForm').reset();
  document.getElementById('isActive').checked = true;

  document.getElementById('discountModal').style.display = 'flex';
}

function editDiscount(id) {
  const d = discounts.find(x => x.id === id);
  if (!d) return;

  editingId = id;

  document.getElementById('modalTitle').innerText = 'Edit Discount';

  discountCode.value = d.code;
  discountType.value = d.type;
  discountValue.value = d.value;
  usageLimit.value = d.usage_limit ?? '';
  validUntil.value = d.valid_until;
  discountDescription.value = d.description ?? '';
  isActive.checked = !!d.is_active;

  document.getElementById('discountModal').style.display = 'flex';
}

function closeDiscountModal() {
  document.getElementById('discountModal').style.display = 'none';
}

/* ================= SAVE ================= */
async function saveDiscount(e) {
  e.preventDefault();

  const payload = {
    code: discountCode.value.trim(),
    type: discountType.value,
    value: discountValue.value,
    usage_limit: usageLimit.value || null,
    valid_until: validUntil.value,
    description: discountDescription.value,
    is_active: isActive.checked ? 1 : 0
  };

  const url = editingId
    ? `/api/discounts/${editingId}`
    : '/api/discounts';

  const method = editingId ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  closeDiscountModal();
  loadDiscounts();
}

/* ================= DELETE ================= */
async function deleteDiscount(id) {
  if (!confirm('Delete this discount?')) return;

  await fetch(`/api/discounts/${id}`, { method: 'DELETE' });

  loadDiscounts();
}
