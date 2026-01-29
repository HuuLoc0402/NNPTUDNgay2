// Cấu hình nguồn dữ liệu (có thể đổi sang github nếu muốn)
const DATA_SOURCE = 'db.json';

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;
let currentSort = { key: '', order: '' };

async function fetchData() {
    try {
        const res = await fetch(DATA_SOURCE);
        if (!res.ok) throw new Error('Không thể tải dữ liệu!');
        return await res.json();
    } catch (e) {
        alert('Lỗi tải dữ liệu: ' + e.message);
        return [];
    }
}

function renderTable(products) {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';
    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không có sản phẩm nào.</td></tr>';
        return;
    }
    products.forEach((product, idx) => {
        const tr = document.createElement('tr');
        // Ảnh
        const imagesHtml = product.images.map(img => `<img src="${img}" alt="${product.title}" class="me-1 mb-1" onerror="this.onerror=null;this.src='https://placehold.co/80x60?text=No+Image';">`).join('');
        tr.innerHTML = `
            <td>${idx + 1 + (currentPage - 1) * pageSize}</td>
            <td class="product-images">${imagesHtml}</td>
            <td>${product.title}</td>
            <td>${product.category?.name || ''}</td>
            <td class="text-end">${product.price.toLocaleString()}₫</td>
            <td>${product.description}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="editProduct(${product.id})">Sửa</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPagination(total) {
    const ul = document.getElementById('pagination');
    ul.innerHTML = '';
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === currentPage ? ' active' : '');
        li.innerHTML = `<a class="page-link" href="#" onclick="gotoPage(${i});return false;">${i}</a>`;
        ul.appendChild(li);
    }
}

function applyFilterSortPage() {
    // Lọc
    const search = document.getElementById('searchInput').value.trim().toLowerCase();
    filteredProducts = allProducts.filter(p => p.title.toLowerCase().includes(search));
    // Sắp xếp
    if (currentSort.key) {
        filteredProducts.sort((a, b) => {
            let v1 = a[currentSort.key], v2 = b[currentSort.key];
            if (currentSort.key === 'title') {
                v1 = v1.toLowerCase(); v2 = v2.toLowerCase();
            }
            if (v1 < v2) return currentSort.order === 'asc' ? -1 : 1;
            if (v1 > v2) return currentSort.order === 'asc' ? 1 : -1;
            return 0;
        });
    }
    // Phân trang
    const total = filteredProducts.length;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    renderTable(filteredProducts.slice(start, end));
    renderPagination(total);
}

function onSearchChanged() {
    currentPage = 1;
    applyFilterSortPage();
}

function sortBy(key, order) {
    currentSort = { key, order };
    applyFilterSortPage();
}

function gotoPage(page) {
    currentPage = page;
    applyFilterSortPage();
}

function onPageSizeChanged() {
    pageSize = parseInt(document.getElementById('pageSize').value, 10);
    currentPage = 1;
    applyFilterSortPage();
}

window.reloadProductData = async function() {
    allProducts = await fetchData();
    document.getElementById('searchInput').value = '';
    currentSort = { key: '', order: '' };
    currentPage = 1;
    pageSize = parseInt(document.getElementById('pageSize').value, 10);
    applyFilterSortPage();
};

window.onload = window.reloadProductData;
