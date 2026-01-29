// Cấu hình nguồn dữ liệu (có thể đổi sang github nếu muốn)
const DATA_SOURCE = 'db.json';

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;
let currentSort = { key: '', order: '' };
let nextId = 10000;
// Thêm sản phẩm mới
document.getElementById('addProductForm').onsubmit = function(e) {
        e.preventDefault();
        const form = e.target;
        const title = form.title.value.trim();
        const price = parseFloat(form.price.value);
        const description = form.description.value.trim();
        const categoryName = form.category.value.trim();
        const images = form.images.value.split(',').map(s => s.trim()).filter(Boolean);
        // Tìm id lớn nhất hiện có
        let maxId = allProducts.reduce((max, p) => Math.max(max, p.id), 0);
        const newProduct = {
                id: maxId ? maxId + 1 : nextId++,
                title,
                price,
                description,
                category: { id: 0, name: categoryName, slug: categoryName.toLowerCase().replace(/\s+/g, '-'), image: '', creationAt: '', updatedAt: '' },
                images: images.length ? images : ['https://placehold.co/80x60?text=No+Image'],
                creationAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
        };
        allProducts.unshift(newProduct);
        // Đóng modal
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addProductModal'));
        modal.hide();
        form.reset();
        currentPage = 1;
        applyFilterSortPage();
        return false;
};

// Sửa sản phẩm
window.editProduct = function(id) {
        const product = allProducts.find(p => p.id === id);
        if (!product) return;
        // Tạo modal sửa nếu chưa có
        let modalDiv = document.getElementById('editProductModal');
        if (!modalDiv) {
                modalDiv = document.createElement('div');
                modalDiv.innerHTML = `
                <div class="modal fade" id="editProductModal" tabindex="-1" aria-labelledby="editProductModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <form id="editProductForm" autocomplete="off">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="editProductModalLabel">Sửa sản phẩm</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="mb-2">
                                        <label class="form-label">Tên sản phẩm</label>
                                        <input type="text" class="form-control" name="title" required>
                                    </div>
                                    <div class="mb-2">
                                        <label class="form-label">Giá</label>
                                        <input type="number" class="form-control" name="price" min="0" required>
                                    </div>
                                    <div class="mb-2">
                                        <label class="form-label">Mô tả</label>
                                        <textarea class="form-control" name="description" rows="2"></textarea>
                                    </div>
                                    <div class="mb-2">
                                        <label class="form-label">Danh mục</label>
                                        <input type="text" class="form-control" name="category" required>
                                    </div>
                                    <div class="mb-2">
                                        <label class="form-label">Ảnh (dán nhiều link, cách nhau dấu phẩy)</label>
                                        <input type="text" class="form-control" name="images">
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                                    <button type="submit" class="btn btn-primary">Lưu</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>`;
                document.body.appendChild(modalDiv);
        }
        // Gán dữ liệu vào form
        setTimeout(() => {
                const form = document.getElementById('editProductForm');
                form.title.value = product.title;
                form.price.value = product.price;
                form.description.value = product.description;
                form.category.value = product.category?.name || '';
                form.images.value = product.images.join(', ');
                form.onsubmit = function(e) {
                        e.preventDefault();
                        product.title = form.title.value.trim();
                        product.price = parseFloat(form.price.value);
                        product.description = form.description.value.trim();
                        product.category.name = form.category.value.trim();
                        product.category.slug = form.category.value.trim().toLowerCase().replace(/\s+/g, '-');
                        product.images = form.images.value.split(',').map(s => s.trim()).filter(Boolean);
                        product.updatedAt = new Date().toISOString();
                        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editProductModal'));
                        modal.hide();
                        applyFilterSortPage();
                        return false;
                };
                // Hiện modal
                const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
                modal.show();
        }, 100);
};

// Xóa sản phẩm
window.deleteProduct = function(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        allProducts = allProducts.filter(p => p.id !== id);
        applyFilterSortPage();
};

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
                <button class="btn btn-sm btn-info me-1" onclick='editProduct(${JSON.stringify(product.id)})'>Sửa</button>
                <button class="btn btn-sm btn-danger" onclick='deleteProduct(${JSON.stringify(product.id)})'>Xóa</button>
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
