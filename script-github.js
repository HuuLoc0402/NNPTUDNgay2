const GITHUB_DB = 'https://raw.githubusercontent.com/nguyenthanhtunghutechsg/NNPTUD-C5/20260129load/db.json';

async function fetchData() {
    try {
        const response = await fetch(GITHUB_DB);
        if (!response.ok) throw new Error('Không thể tải dữ liệu từ GitHub!');
        return await response.json();
    } catch (err) {
        alert('Lỗi tải dữ liệu GitHub: ' + err.message);
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
        // Hiển thị tất cả ảnh
        const imagesHtml = product.images.map(img => `<img src="${img}" alt="${product.title}" style="margin:2px;max-width:100px;max-height:80px;display:inline-block;">`).join('');
        div.innerHTML = `
            <div>${imagesHtml}</div>
            <div class="product-title">${product.title}</div>
            <div class="product-category">${product.category.name}</div>
            <div class="product-price">${product.price}₫</div>
            <div class="product-desc">${product.description}</div>
        `;
        container.appendChild(div);
    });
}

async function loadProducts() {
    const products = await fetchData();
    renderProducts(products);
}

window.onload = () => {
    loadProducts();
};
