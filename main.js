const LOCAL_DB = 'db.json';
const GITHUB_DB = 'https://raw.githubusercontent.com/nguyenthanhtunghutechsg/NNPTUD-C5/20260129load/db.json';

async function fetchData(source) {
    let url = source === 'local' ? LOCAL_DB : GITHUB_DB;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải dữ liệu!');
        return await response.json();
    } catch (err) {
        alert('Lỗi tải dữ liệu: ' + err.message);
        return [];
    }
}

function renderProducts(products) {
    const container = document.getElementById('products');
    container.innerHTML = '';
    if (!products.length) {
        container.innerHTML = '<p>Không có sản phẩm nào.</p>';
        return;
    }
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
            <img src="${product.images[0]}" alt="${product.title}">
            <div class="product-title">${product.title}</div>
            <div class="product-category">${product.category.name}</div>
            <div class="product-price">${product.price}₫</div>
            <div class="product-desc">${product.description}</div>
        `;
        container.appendChild(div);
    });
}

async function loadProducts() {
    const source = document.getElementById('source').value;
    const products = await fetchData(source);
    renderProducts(products);
}

// Tự động load dữ liệu local khi mở trang
window.onload = () => {
    loadProducts();
};
