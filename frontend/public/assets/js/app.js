let currentProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for API to be initialized
    while (!apiInitialized) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    updateNavbar();
    updateCartBadge();
    
    const page = document.body.getAttribute('data-page');
    if (page === 'home') initHome();
    else if (page === 'shop') initShop();
    else if (page === 'product') initProduct();
    else if (page === 'cart') initCart();
    else if (page === 'checkout') initCheckout();
    else if (page === 'offers') initOffers();
    else if (page === 'contact') initContact();
    else if (page === 'about') initAbout();
    else if (page === 'admin') initAdmin();
    else if (page === 'login') initLogin();
    else if (page === 'register') initRegister();
    else if (page === 'profile') initProfile();
    
    setupGlobalSearch();
    setupAuthForms();
});

function updateNavbar() {
    const authArea = document.getElementById('authArea');
    if (!authArea) return;
    
    const user = getCurrentUser();
    if (user) {
        let html = `
            <div class="dropdown d-inline-block">
                <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Hi, ${user.username}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    ${!isAdmin() ? '<li><a class="dropdown-item" href="profile.html">My Profile</a></li>' : ''}
                    <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </div>
        `;
        if (isAdmin()) {
            html += '<a href="admin.html" class="btn btn-outline-warning ms-2">Admin</a>';
        }
        authArea.innerHTML = html;
    } else {
        authArea.innerHTML = '<button class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#authModal">Sign in</button>';
    }
}

async function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge || !isAuthenticated()) {
        if (badge) badge.textContent = '0';
        return;
    }
    try {
        const cart = await apiGet('/cart');
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = count;
    } catch (error) {
        badge.textContent = '0';
    }
}

function setupGlobalSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchExpand = document.getElementById('searchExpand');
    const globalSearch = document.getElementById('globalSearch');
    
    if (searchToggle && searchExpand) {
        searchToggle.addEventListener('click', () => {
            searchExpand.style.display = searchExpand.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    if (globalSearch) {
        globalSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const term = globalSearch.value.trim();
                if (term) {
                    window.location.href = `shop.html?search=${encodeURIComponent(term)}`;
                }
            }
        });
    }
}

function setupAuthForms() {
    // Regular login form (login.html)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageDiv = document.getElementById('loginMessage');
            try {
                await login(
                    document.getElementById('loginUsername').value,
                    document.getElementById('loginPassword').value
                );
                if (messageDiv) {
                    messageDiv.className = 'alert alert-success';
                    messageDiv.textContent = 'Login successful! Redirecting...';
                    messageDiv.style.display = 'block';
                }
                updateNavbar();
                updateCartBadge();
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } catch (error) {
                if (messageDiv) {
                    messageDiv.className = 'alert alert-danger';
                    messageDiv.textContent = 'Login failed: ' + error.message;
                    messageDiv.style.display = 'block';
                } else {
                    alert('Login failed: ' + error.message);
                }
            }
        });
    }
    
    // Modal login form (index.html)
    const loginModalForm = document.getElementById('loginModalForm');
    if (loginModalForm) {
        loginModalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageDiv = document.getElementById('loginModalMessage');
            try {
                await login(
                    document.getElementById('loginModalUsername').value,
                    document.getElementById('loginModalPassword').value
                );
                if (messageDiv) {
                    messageDiv.className = 'alert alert-success';
                    messageDiv.textContent = 'Login successful!';
                    messageDiv.style.display = 'block';
                }
                updateNavbar();
                updateCartBadge();
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                    if (modal) modal.hide();
                    window.location.reload();
                }, 1000);
            } catch (error) {
                if (messageDiv) {
                    messageDiv.className = 'alert alert-danger';
                    messageDiv.textContent = 'Login failed: ' + error.message;
                    messageDiv.style.display = 'block';
                }
            }
        });
    }
    
    // Regular register form (register.html)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageDiv = document.getElementById('registerMessage');
            try {
                await register({
                    username: document.getElementById('regUsername').value,
                    email: document.getElementById('regEmail').value,
                    password: document.getElementById('regPassword').value,
                    firstName: document.getElementById('regFirstName').value,
                    lastName: document.getElementById('regLastName').value
                });
                if (messageDiv) {
                    messageDiv.className = 'alert alert-success';
                    messageDiv.textContent = 'Registration successful! Redirecting to login...';
                    messageDiv.style.display = 'block';
                }
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } catch (error) {
                if (messageDiv) {
                    messageDiv.className = 'alert alert-danger';
                    messageDiv.textContent = 'Registration failed: ' + error.message;
                    messageDiv.style.display = 'block';
                } else {
                    alert('Registration failed: ' + error.message);
                }
            }
        });
    }
    
    // Modal register form (index.html)
    const registerModalForm = document.getElementById('registerModalForm');
    if (registerModalForm) {
        registerModalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageDiv = document.getElementById('registerModalMessage');
            try {
                await register({
                    username: document.getElementById('regModalUsername').value,
                    email: document.getElementById('regModalEmail').value,
                    password: document.getElementById('regModalPassword').value,
                    firstName: document.getElementById('regModalFirstName').value,
                    lastName: document.getElementById('regModalLastName').value
                });
                if (messageDiv) {
                    messageDiv.className = 'alert alert-success';
                    messageDiv.textContent = 'Registration successful! Please sign in.';
                    messageDiv.style.display = 'block';
                }
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                    if (modal) {
                        const loginTab = document.getElementById('login-tab');
                        if (loginTab) loginTab.click();
                    }
                }, 1500);
            } catch (error) {
                if (messageDiv) {
                    messageDiv.className = 'alert alert-danger';
                    messageDiv.textContent = 'Registration failed: ' + error.message;
                    messageDiv.style.display = 'block';
                }
            }
        });
    }
}

function initLogin() {
    // If already logged in, redirect to home
    if (isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

function initRegister() {
    // If already logged in, redirect to home
    if (isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

async function initHome() {
    try {
        const newArrivals = await apiGet('/products/new');
        renderProducts(newArrivals.slice(0, 4), 'newArrivals');
        
        const flashSale = await apiGet('/products/flash-sale');
        renderProducts(flashSale.slice(0, 4), 'flashSale');
        
        const bestSellers = await apiGet('/products/bestsellers');
        renderProducts(bestSellers.slice(0, 4), 'bestSellers');
    } catch (error) {
        console.error('Failed to load home products:', error);
    }
}

async function initShop() {
    try {
        const products = await apiGet('/products');
        currentProducts = products;
        renderProducts(products, 'productsGrid');
        
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        const categorySelect = document.getElementById('filterCategory');
        if (categorySelect) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categorySelect.appendChild(option);
            });
        }
        
        const applyFilters = document.getElementById('applyFilters');
        if (applyFilters) {
            applyFilters.addEventListener('click', () => {
                filterAndSortProducts();
            });
        }
        
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', () => {
                filterAndSortProducts();
            });
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        if (searchTerm && document.getElementById('globalSearch')) {
            document.getElementById('globalSearch').value = searchTerm;
            filterAndSortProducts();
        }
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

function filterAndSortProducts() {
    let filtered = [...currentProducts];
    
    const category = document.getElementById('filterCategory')?.value;
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    const searchTerm = document.getElementById('globalSearch')?.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }
    
    const sortBy = document.getElementById('sortBy')?.value;
    if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    renderProducts(filtered, 'productsGrid');
}

async function initProfile() {
    // Security check: Only authenticated users (not admins) can access profile
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    if (isAdmin()) {
        window.location.href = 'admin.html';
        return;
    }
    
    try {
        // Load user profile
        const profile = await apiGet('/users/me');
        
        // Fill profile form
        document.getElementById('profileFirstName').value = profile.firstName || '';
        document.getElementById('profileLastName').value = profile.lastName || '';
        document.getElementById('profileEmail').value = profile.email || '';
        document.getElementById('profilePhone').value = profile.phone || '';
        document.getElementById('profileCity').value = profile.city || '';
        document.getElementById('profileAddress1').value = profile.address1 || '';
        document.getElementById('profileAddress2').value = profile.address2 || '';
        
        // Profile form submit
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('profileError');
            errorDiv.style.display = 'none';
            
            try {
                await apiPut('/users/me', {
                    email: document.getElementById('profileEmail').value,
                    firstName: document.getElementById('profileFirstName').value,
                    lastName: document.getElementById('profileLastName').value,
                    phone: document.getElementById('profilePhone').value,
                    city: document.getElementById('profileCity').value,
                    address1: document.getElementById('profileAddress1').value,
                    address2: document.getElementById('profileAddress2').value
                });
                
                // Show success toast
                const toast = new bootstrap.Toast(document.getElementById('successToast'));
                document.getElementById('toastMessage').textContent = 'Profile updated successfully!';
                toast.show();
                
                // Reload profile data
                setTimeout(() => initProfile(), 500);
            } catch (error) {
                errorDiv.textContent = error.message || 'Failed to update profile';
                errorDiv.style.display = 'block';
            }
        });
        
        // Password form submit
        document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('passwordError');
            errorDiv.style.display = 'none';
            
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                errorDiv.textContent = 'New passwords do not match';
                errorDiv.style.display = 'block';
                return;
            }
            
            if (newPassword.length < 6) {
                errorDiv.textContent = 'Password must be at least 6 characters';
                errorDiv.style.display = 'block';
                return;
            }
            
            try {
                await apiPost('/users/me/change-password', {
                    currentPassword: document.getElementById('oldPassword').value,
                    newPassword: newPassword
                });
                
                // Show success toast
                const toast = new bootstrap.Toast(document.getElementById('successToast'));
                document.getElementById('toastMessage').textContent = 'Password changed successfully!';
                toast.show();
                
                // Clear password form
                document.getElementById('passwordForm').reset();
            } catch (error) {
                errorDiv.textContent = error.message || 'Failed to change password';
                errorDiv.style.display = 'block';
            }
        });
        
        // Load and render orders
        await loadMyOrders();
    } catch (error) {
        console.error('Failed to load profile:', error);
        if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
            window.location.href = 'login.html';
        }
    }
}

async function loadMyOrders() {
    try {
        const orders = await apiGet('/orders/my');
        const ordersList = document.getElementById('orders-list');
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="text-muted">No orders yet.</p>';
            return;
        }
        
        ordersList.innerHTML = orders.map(order => {
            const statusBadge = getStatusBadge(order.status);
            const returnBadge = getReturnBadge(order.returnStatus);
            const paymentBadge = order.paymentMethod === 'COD' 
                ? '<span class="badge bg-secondary">Cash on Delivery</span>'
                : '<span class="badge bg-primary">Card</span>';
            
            let actionButtons = '';
            if (order.status === 'SHIPPED') {
                actionButtons = `<button class="btn btn-success btn-sm" onclick="confirmDelivery(${order.id})">تم الاستلام / Order Received</button>`;
            }
            if (order.canRequestReturn) {
                actionButtons += ` <button class="btn btn-warning btn-sm" onclick="openReturnModal(${order.id})">Request Return</button>`;
            }
            
            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h5>Order #${order.id}</h5>
                                <p class="text-muted mb-1">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                                <p class="mb-1">Subtotal: $${order.subtotal.toFixed(2)}</p>
                                <p class="mb-1">Shipping: ${order.shippingFee.toFixed(2) === '0.00' ? '<span class="text-success">FREE</span>' : '$' + order.shippingFee.toFixed(2)}</p>
                                <p class="mb-2"><strong>Total: $${order.total.toFixed(2)}</strong></p>
                                ${statusBadge} ${paymentBadge} ${returnBadge}
                            </div>
                            <div class="col-md-4 text-end">
                                ${actionButtons}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load orders:', error);
        document.getElementById('orders-list').innerHTML = '<p class="text-danger">Failed to load orders.</p>';
    }
}

function getStatusBadge(status) {
    const badges = {
        'PENDING': '<span class="badge bg-warning">Pending</span>',
        'CONFIRMED': '<span class="badge bg-info">Confirmed</span>',
        'SHIPPED': '<span class="badge bg-primary">Shipped</span>',
        'DELIVERED': '<span class="badge bg-success">Delivered</span>',
        'CANCELLED': '<span class="badge bg-danger">Cancelled</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}

function getReturnBadge(returnStatus) {
    if (returnStatus === 'NONE') return '';
    const badges = {
        'REQUESTED': '<span class="badge bg-warning">Return Requested</span>',
        'APPROVED': '<span class="badge bg-success">Return Approved</span>',
        'REJECTED': '<span class="badge bg-danger">Return Rejected</span>',
        'COMPLETED': '<span class="badge bg-info">Return Completed</span>'
    };
    return badges[returnStatus] || '';
}

async function confirmDelivery(orderId) {
    if (!confirm('Have you received this order?')) return;
    try {
        await apiPost(`/orders/${orderId}/confirm-delivery`);
        alert('Order delivery confirmed!');
        loadMyOrders();
    } catch (error) {
        alert('Failed to confirm delivery: ' + error.message);
    }
}

function openReturnModal(orderId) {
    document.getElementById('returnOrderId').value = orderId;
    document.getElementById('returnReason').value = '';
    document.getElementById('returnError').style.display = 'none';
    const modal = new bootstrap.Modal(document.getElementById('returnModal'));
    modal.show();
}

async function submitReturnRequest() {
    const orderId = document.getElementById('returnOrderId').value;
    const reason = document.getElementById('returnReason').value;
    const errorDiv = document.getElementById('returnError');
    
    if (!reason.trim()) {
        errorDiv.textContent = 'Please provide a reason for return';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        await apiPost(`/orders/${orderId}/return-request`, { reason: reason });
        const modal = bootstrap.Modal.getInstance(document.getElementById('returnModal'));
        modal.hide();
        alert('Return request submitted successfully!');
        loadMyOrders();
    } catch (error) {
        errorDiv.textContent = error.message || 'Failed to submit return request';
        errorDiv.style.display = 'block';
    }
}

async function initProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) {
        alert('Product ID missing');
        return;
    }
    
    try {
        const product = await apiGet(`/products/${productId}`);
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productCategory').textContent = product.category || '';
        document.getElementById('productDescription').textContent = product.description || '';
        document.getElementById('productId').value = product.id;
        
        let price = `$${product.sellingPrice.toFixed(2)}`;
        if (product.onSale && product.salePercentage > 0) {
            const originalPrice = product.sellingPrice;
            const discount = originalPrice * (product.salePercentage / 100);
            const salePrice = originalPrice - discount;
            price = `$${salePrice.toFixed(2)} <small class="text-muted text-decoration-line-through">$${originalPrice.toFixed(2)}</small>`;
            document.getElementById('productSaleBadge').textContent = `${product.salePercentage}% OFF`;
            document.getElementById('productSaleBadge').style.display = 'inline';
        }
        document.getElementById('productPrice').innerHTML = price;
        
        if (product.imageUrl) {
            document.getElementById('productImage').src = getImageUrlWithCacheBust(product.imageUrl);
        }
        
        const sizes = product.sizes ? (product.sizes.startsWith('[') ? JSON.parse(product.sizes) : product.sizes.split(',')) : [];
        const sizeSelect = document.getElementById('productSize');
        sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size.trim();
            option.textContent = size.trim();
            sizeSelect.appendChild(option);
        });
        
        const colors = product.colors ? (product.colors.startsWith('[') ? JSON.parse(product.colors) : product.colors.split(',')) : [];
        const colorSelect = document.getElementById('productColor');
        colors.forEach(color => {
            const option = document.createElement('option');
            option.value = color.trim();
            option.textContent = color.trim();
            colorSelect.appendChild(option);
        });
        
        const form = document.getElementById('addToCartForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }
            try {
                await apiPost('/cart', {
                    productId: parseInt(product.id),
                    quantity: parseInt(document.getElementById('productQuantity').value),
                    size: document.getElementById('productSize').value,
                    color: document.getElementById('productColor').value
                });
                alert('Added to cart!');
                updateCartBadge();
            } catch (error) {
                alert('Failed to add to cart: ' + error.message);
            }
        });
    } catch (error) {
        console.error('Failed to load product:', error);
        alert('Product not found');
    }
}

async function initCart() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html#login';
        return;
    }
    
    try {
        const cart = await apiGet('/cart');
        renderCart(cart);
    } catch (error) {
        console.error('Failed to load cart:', error);
        document.getElementById('cartItems').innerHTML = '<p class="text-muted">Failed to load cart.</p>';
    }
}

function renderCart(cart) {
    const container = document.getElementById('cartItems');
    if (cart.length === 0) {
        container.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
        document.getElementById('cartTotal').textContent = '$0.00';
        return;
    }
    
    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.priceSnapshot * item.quantity;
        total += itemTotal;
        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${getImageUrlWithCacheBust(item.product?.imageUrl || '')}" alt="${item.product?.name || ''}" class="img-fluid">
                        </div>
                        <div class="col-md-4">
                            <h5>${item.product?.name || 'Product'}</h5>
                            <p class="text-muted">${item.size || ''} ${item.color || ''}</p>
                        </div>
                        <div class="col-md-2">
                            <input type="number" class="form-control" value="${item.quantity}" min="1" 
                                onchange="updateCartItem(${item.id}, this.value)">
                        </div>
                        <div class="col-md-2">
                            <p class="mb-0">$${itemTotal.toFixed(2)}</p>
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-danger btn-sm" onclick="removeCartItem(${item.id})">Remove</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
}

async function updateCartItem(id, quantity) {
    try {
        await apiPut(`/cart/${id}`, { quantity: parseInt(quantity) });
        initCart();
        updateCartBadge();
    } catch (error) {
        alert('Failed to update cart: ' + error.message);
    }
}

async function removeCartItem(id) {
    try {
        await apiDelete(`/cart/${id}`);
        initCart();
        updateCartBadge();
    } catch (error) {
        alert('Failed to remove item: ' + error.message);
    }
}

async function initCheckout() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html#login';
        return;
    }
    
    try {
        // Auto-fill from user profile
        try {
            const profile = await apiGet('/users/me');
            if (profile) {
                const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
                if (fullName) document.getElementById('shippingName').value = fullName;
                if (profile.phone) document.getElementById('shippingPhone').value = profile.phone;
                if (profile.city) document.getElementById('shippingCity').value = profile.city;
                if (profile.address1) document.getElementById('shippingAddress').value = profile.address1;
            }
        } catch (error) {
            console.log('Could not load profile for auto-fill:', error);
        }
        
        const cart = await apiGet('/cart');
        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }
        
        let subtotal = 0;
        const summary = cart.map(item => {
            const itemTotal = item.priceSnapshot * item.quantity;
            subtotal += itemTotal;
            return `<p>${item.product?.name || 'Product'} x${item.quantity} - $${itemTotal.toFixed(2)}</p>`;
        }).join('');
        
        // Calculate shipping based on selected method (free if subtotal >= 200)
        function calculateShipping() {
            if (subtotal >= 200) return 0;
            const method = document.getElementById('shippingMethod')?.value || 'STANDARD';
            const fees = { STANDARD: 20, EXPRESS: 35, OVERNIGHT: 50 };
            return fees[method] || 20;
        }
        
        const shippingFee = calculateShipping();
        const total = subtotal + shippingFee;
        
        document.getElementById('orderSummary').innerHTML = summary;
        document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('orderShipping').textContent = shippingFee === 0 
            ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>FREE</span>' 
            : `$${shippingFee.toFixed(2)}`;
        document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
        
        // Update shipping when method changes
        window.updateShippingCost = function() {
            const newShipping = calculateShipping();
            const newTotal = subtotal + newShipping;
            document.getElementById('orderShipping').textContent = newShipping === 0 
                ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>FREE</span>' 
                : `$${newShipping.toFixed(2)}`;
            document.getElementById('orderTotal').textContent = `$${newTotal.toFixed(2)}`;
        };
        
        const form = document.getElementById('checkoutForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const response = await apiPost('/orders/checkout', {
                    shippingName: document.getElementById('shippingName').value,
                    shippingAddress: document.getElementById('shippingAddress').value,
                    shippingCity: document.getElementById('shippingCity').value,
                    shippingState: document.getElementById('shippingState').value,
                    shippingZip: document.getElementById('shippingZip').value,
                    shippingPhone: document.getElementById('shippingPhone').value,
                    paymentMethod: document.getElementById('paymentMethod').value,
                    shippingMethod: document.getElementById('shippingMethod').value
                });
                // Update summary with actual values from backend
                document.getElementById('orderSubtotal').textContent = `$${response.subtotal.toFixed(2)}`;
                document.getElementById('orderShipping').textContent = response.shippingFee.toFixed(2) === '0.00' 
                    ? '<span class="text-success">FREE</span>' 
                    : `$${response.shippingFee.toFixed(2)}`;
                document.getElementById('orderTotal').textContent = `$${response.total.toFixed(2)}`;
                
                alert(`Order placed successfully! Order ID: ${response.orderId}`);
                updateCartBadge();
                window.location.href = 'index.html';
            } catch (error) {
                alert('Checkout failed: ' + error.message);
            }
        });
    } catch (error) {
        console.error('Failed to load checkout:', error);
    }
}

async function initOffers() {
    try {
        const products = await apiGet('/products/flash-sale');
        renderProducts(products, 'offersGrid');
    } catch (error) {
        console.error('Failed to load offers:', error);
    }
}

function initContact() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await apiPost('/contact', {
                    name: document.getElementById('contactName').value,
                    email: document.getElementById('contactEmail').value,
                    message: document.getElementById('contactMessageText').value
                });
                const msgDiv = document.getElementById('contactMessage');
                msgDiv.className = 'alert alert-success';
                msgDiv.textContent = 'Message sent successfully!';
                msgDiv.style.display = 'block';
                form.reset();
            } catch (error) {
                const msgDiv = document.getElementById('contactMessage');
                msgDiv.className = 'alert alert-danger';
                msgDiv.textContent = 'Failed to send message: ' + error.message;
                msgDiv.style.display = 'block';
            }
        });
    }
}

function initAbout() {
    // Animations handled by animations.js
}

async function initAdmin() {
    if (!isAuthenticated() || !isAdmin()) {
        document.getElementById('adminContent').style.display = 'none';
        document.getElementById('adminUnauthorized').style.display = 'block';
        return;
    }
    
    document.getElementById('adminContent').style.display = 'block';
    document.getElementById('adminUnauthorized').style.display = 'none';
    
    try {
        const products = await apiGet('/products');
        renderAdminProducts(products);
    } catch (error) {
        console.error('Failed to load admin products:', error);
    }
    
    // Load orders when Orders tab is clicked
    const ordersTab = document.getElementById('orders-tab');
    if (ordersTab) {
        ordersTab.addEventListener('shown.bs.tab', async () => {
            await loadAdminOrders();
        });
        // Also load if Orders tab is already active
        if (ordersTab.classList.contains('active')) {
            await loadAdminOrders();
        }
    }
    
    // Load orders on filter change
    const returnStatusFilter = document.getElementById('returnStatusFilter');
    if (returnStatusFilter) {
        returnStatusFilter.addEventListener('change', () => {
            loadAdminOrders();
        });
    }
}

async function loadAdminOrders() {
    const tbody = document.getElementById('ordersTable');
    if (!tbody) {
        console.error('ordersTable element not found');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="10" class="text-muted text-center py-4"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Loading orders...</td></tr>';
    
    try {
        const filter = document.getElementById('returnStatusFilter')?.value || '';
        let url = '/admin/orders';
        if (filter) {
            url += `?returnStatus=${filter}`;
        }
        console.log('Loading orders from:', url);
        const orders = await apiGet(url);
        console.log('Orders loaded:', orders);
        if (Array.isArray(orders)) {
            renderAdminOrders(orders);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Failed to load admin orders:', error);
        const errorMsg = error.message || 'Unknown error';
        tbody.innerHTML = `<tr><td colspan="10" class="text-danger text-center py-4">
            <i class="bi bi-exclamation-triangle me-2"></i>Failed to load orders: ${errorMsg}
            <br><small class="text-muted">Please check console for details</small>
        </td></tr>`;
    }
}

function renderAdminOrders(orders) {
    const tbody = document.getElementById('ordersTable');
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4"><i class="bi bi-inbox me-2"></i>No orders found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const statusBadge = getStatusBadge(order.status);
        const returnBadge = getReturnBadge(order.returnStatus);
        const paymentBadge = order.paymentMethod === 'COD' 
            ? '<span class="badge bg-secondary"><i class="bi bi-cash-coin me-1"></i>COD</span>'
            : '<span class="badge bg-primary"><i class="bi bi-credit-card me-1"></i>Card</span>';
        
        const rowClass = order.returnStatus === 'REQUESTED' ? 'table-warning' : '';
        
        let statusButtons = '';
        if (order.status === 'PENDING') {
            statusButtons += `
                <button class="btn btn-sm btn-success me-1 mb-1" onclick="updateOrderStatus(${order.id}, 'confirm')">
                    <i class="bi bi-check-circle me-1"></i>Confirm
                </button>
                <button class="btn btn-sm btn-primary me-1 mb-1" onclick="updateOrderStatus(${order.id}, 'ship')">
                    <i class="bi bi-truck me-1"></i>Ship
                </button>
                <button class="btn btn-sm btn-danger mb-1" onclick="updateOrderStatus(${order.id}, 'cancel')">
                    <i class="bi bi-x-circle me-1"></i>Cancel
                </button>
            `;
        } else if (order.status === 'CONFIRMED') {
            statusButtons += `
                <button class="btn btn-sm btn-primary me-1 mb-1" onclick="updateOrderStatus(${order.id}, 'ship')">
                    <i class="bi bi-truck me-1"></i>Ship
                </button>
                <button class="btn btn-sm btn-danger mb-1" onclick="updateOrderStatus(${order.id}, 'cancel')">
                    <i class="bi bi-x-circle me-1"></i>Cancel
                </button>
            `;
        } else if (order.status === 'SHIPPED') {
            statusButtons += `
                <button class="btn btn-sm btn-info me-1 mb-1" onclick="updateOrderStatus(${order.id}, 'complete')">
                    <i class="bi bi-check2-all me-1"></i>Complete
                </button>
            `;
        }
        
        let returnButtons = '';
        if (order.returnStatus === 'REQUESTED') {
            returnButtons = `
                <button class="btn btn-sm btn-success me-1 mb-1" onclick="approveReturn(${order.id})"><i class="bi bi-check-lg me-1"></i>Approve</button>
                <button class="btn btn-sm btn-danger mb-1" onclick="rejectReturn(${order.id})"><i class="bi bi-x-lg me-1"></i>Reject</button>
            `;
        }
        
        const shippingDisplay = order.shippingFee && parseFloat(order.shippingFee) === 0 
            ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>FREE</span>' 
            : `$${order.shippingFee ? parseFloat(order.shippingFee).toFixed(2) : '0.00'}`;
        
        return `
            <tr class="${rowClass}">
                <td><strong>#${order.id}</strong></td>
                <td>${order.userId}</td>
                <td>$${order.subtotal ? parseFloat(order.subtotal).toFixed(2) : '0.00'}</td>
                <td>${shippingDisplay}</td>
                <td><strong class="text-primary">$${order.total ? parseFloat(order.total).toFixed(2) : '0.00'}</strong></td>
                <td>${statusBadge}</td>
                <td>${paymentBadge}</td>
                <td>${returnBadge}</td>
                <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                <td>
                    <div class="btn-group-vertical btn-group-sm">
                        ${statusButtons}
                        ${returnButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function updateOrderStatus(orderId, action) {
    const actionNames = {
        'confirm': 'Confirm',
        'ship': 'Ship',
        'cancel': 'Cancel',
        'complete': 'Complete'
    };
    const actionName = actionNames[action] || action;
    
    if (!confirm(`Are you sure you want to ${actionName.toLowerCase()} this order?`)) return;
    
    // Wait for API to be initialized
    while (!apiInitialized) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
        // Ensure apiBase is set
        while (!apiInitialized) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        const baseUrl = apiBase || 'http://localhost:8090/api';
        
        // Map action to status (uppercase for backend)
        const statusMap = {
            'confirm': 'CONFIRMED',
            'ship': 'SHIPPED',
            'cancel': 'CANCELLED',
            'complete': 'DELIVERED'
        };
        const status = statusMap[action.toLowerCase()] || action.toUpperCase();
        const url = `${baseUrl}/orders/${orderId}/${status}`;
        
        console.log('Updating order status:', url);
        
        // Use PUT method
        const response = await fetch(url, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            let errorMessage = 'Request failed';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                errorMessage = errorText || `HTTP ${response.status}`;
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json().catch(() => ({ message: 'Success' }));
        // Show success toast
        showToast('success', result.message || `Order ${actionName.toLowerCase()}ed successfully!`);
        await loadAdminOrders();
    } catch (error) {
        console.error('Update order status error:', error);
        showToast('error', 'Failed to update order status: ' + (error.message || 'Unknown error'));
    }
}

function showToast(type, message) {
    // Create toast if doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header ${bgClass} text-white">
                <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}

async function approveReturn(orderId) {
    if (!confirm('Approve this return request?')) return;
    try {
        await apiPost(`/admin/orders/${orderId}/return/approve`);
        alert('Return approved successfully!');
        loadAdminOrders();
    } catch (error) {
        alert('Failed to approve return: ' + error.message);
    }
}

async function rejectReturn(orderId) {
    if (!confirm('Reject this return request?')) return;
    try {
        await apiPost(`/admin/orders/${orderId}/return/reject`);
        alert('Return rejected.');
        loadAdminOrders();
    } catch (error) {
        alert('Failed to reject return: ' + error.message);
    }
}

function renderAdminProducts(products) {
    const tbody = document.getElementById('productsTable');
    if (!tbody) return;
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4"><i class="bi bi-inbox me-2"></i>No products found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => {
        const stockBadge = product.stockQuantity > 10 
            ? `<span class="badge bg-success">${product.stockQuantity}</span>`
            : product.stockQuantity > 0 
            ? `<span class="badge bg-warning">${product.stockQuantity}</span>`
            : `<span class="badge bg-danger">Out of Stock</span>`;
        
        return `
            <tr>
                <td><strong>#${product.id}</strong></td>
                <td>
                    <div class="d-flex align-items-center">
                        ${product.imageUrl ? `<img src="${getImageUrlWithCacheBust(product.imageUrl)}" alt="${product.name}" class="me-2" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;">` : ''}
                        <span>${product.name}</span>
                    </div>
                </td>
                <td><span class="badge bg-info">${product.category || 'N/A'}</span></td>
                <td><strong>$${product.sellingPrice ? parseFloat(product.sellingPrice).toFixed(2) : '0.00'}</strong></td>
                <td>${stockBadge}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="openProductModal(${product.id})">
                        <i class="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="bi bi-trash me-1"></i>Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function openProductModal(productId) {
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    document.getElementById('productModalTitle').textContent = productId ? 'Edit Product' : 'Add Product';
    document.getElementById('productFormId').value = productId || '';
    
    if (productId) {
        try {
            const product = await apiGet(`/products/${productId}`);
            document.getElementById('productFormName').value = product.name || '';
            document.getElementById('productFormDescription').value = product.description || '';
            document.getElementById('productFormCategory').value = product.category || '';
            document.getElementById('productFormSellingPrice').value = product.sellingPrice || '';
            document.getElementById('productFormCostPrice').value = product.costPrice || '';
            document.getElementById('productFormSizes').value = product.sizes || '';
            document.getElementById('productFormColors').value = product.colors || '';
            document.getElementById('productFormStockQuantity').value = product.stockQuantity || 0;
            document.getElementById('productFormImageUrl').value = product.imageUrl || '';
            document.getElementById('productFormNewArrival').checked = product.newArrival || false;
            document.getElementById('productFormBestSeller').checked = product.bestSeller || false;
            document.getElementById('productFormOnSale').checked = product.onSale || false;
            document.getElementById('productFormSalePercentage').value = product.salePercentage || 0;
        } catch (error) {
            alert('Failed to load product: ' + error.message);
        }
    } else {
        document.getElementById('productForm').reset();
    }
    
    modal.show();
}

async function saveProduct() {
    const id = document.getElementById('productFormId').value;
    const data = {
        name: document.getElementById('productFormName').value,
        description: document.getElementById('productFormDescription').value,
        category: document.getElementById('productFormCategory').value,
        sellingPrice: parseFloat(document.getElementById('productFormSellingPrice').value),
        costPrice: parseFloat(document.getElementById('productFormCostPrice').value),
        sizes: document.getElementById('productFormSizes').value,
        colors: document.getElementById('productFormColors').value,
        stockQuantity: parseInt(document.getElementById('productFormStockQuantity').value),
        imageUrl: document.getElementById('productFormImageUrl').value,
        newArrival: document.getElementById('productFormNewArrival').checked,
        bestSeller: document.getElementById('productFormBestSeller').checked,
        onSale: document.getElementById('productFormOnSale').checked,
        salePercentage: parseInt(document.getElementById('productFormSalePercentage').value)
    };
    
    try {
        if (id) {
            await apiPut(`/admin/products/${id}`, data);
        } else {
            await apiPost('/admin/products', data);
        }
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        // Force reload to clear image cache
        setTimeout(() => {
            initAdmin();
            // Reload products on other pages if they're open
            if (window.location.pathname.includes('shop.html')) {
                initShop();
            } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                initHome();
            } else if (window.location.pathname.includes('offers.html')) {
                initOffers();
            }
        }, 100);
    } catch (error) {
        alert('Failed to save product: ' + error.message);
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        await apiDelete(`/admin/products/${id}`);
        initAdmin();
    } catch (error) {
        alert('Failed to delete product: ' + error.message);
    }
}

function normalizeImageUrl(imageUrl) {
    // If null/empty → return placeholder
    if (!imageUrl || imageUrl.trim() === '') {
        return '/assets/images/placeholder.jpg';
    }
    
    // If starts with http/https → return as-is (external URL)
    if (imageUrl.toLowerCase().startsWith('http://') || imageUrl.toLowerCase().startsWith('https://')) {
        return imageUrl;
    }
    
    // Clean the URL: strip leading slashes, backslashes, quotes
    let cleaned = imageUrl.trim()
        .replace(/^[/\\]+/, '')  // Remove leading slashes/backslashes
        .replace(/^["']|["']$/g, '')  // Remove surrounding quotes
        .replace(/^assets\/images\/|^\/assets\/images\//, '');  // Remove assets/images/ prefix if present
    
    // Ensure it's in assets/images/ folder
    return '/assets/images/' + cleaned;
}

function getImageUrlWithCacheBust(imageUrl) {
    const normalized = normalizeImageUrl(imageUrl);
    // Add timestamp to bypass cache
    const separator = normalized.includes('?') ? '&' : '?';
    return normalized + separator + 'v=' + Date.now();
}

function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted text-center py-5"><i class="bi bi-inbox me-2"></i>No products found.</p></div>';
        return;
    }
    
    container.innerHTML = products.map(product => {
        let price = `$${product.sellingPrice.toFixed(2)}`;
        if (product.onSale && product.salePercentage > 0) {
            const originalPrice = product.sellingPrice;
            const discount = originalPrice * (product.salePercentage / 100);
            const salePrice = originalPrice - discount;
            price = `$${salePrice.toFixed(2)} <small class="text-muted text-decoration-line-through">$${originalPrice.toFixed(2)}</small>`;
        }
        
        const imageUrl = getImageUrlWithCacheBust(product.imageUrl);
        const badges = [];
        if (product.newArrival) badges.push('<span class="badge bg-success">New</span>');
        if (product.bestSeller) badges.push('<span class="badge bg-info">Best Seller</span>');
        if (product.onSale && product.salePercentage > 0) badges.push(`<span class="badge bg-danger">${product.salePercentage}% OFF</span>`);
        
        return `
            <div class="col-lg-3 col-md-4 col-sm-6 product-card">
                <div class="card h-100">
                    <div class="position-relative" style="height: 280px; overflow: hidden; background: #f8f9fa;">
                        <img src="${imageUrl}" class="card-img-top" alt="${product.name}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                        ${badges.length > 0 ? `<div class="position-absolute top-0 end-0 p-2" style="z-index: 10;">${badges.join(' ')}</div>` : ''}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title" style="min-height: 2.5rem; font-size: 1rem; line-height: 1.3;">${product.name}</h5>
                        <p class="card-text text-muted small mb-2">${product.category || ''}</p>
                        <p class="card-text fw-bold text-primary mb-3">${price}</p>
                        <a href="product.html?id=${product.id}" class="btn btn-primary btn-sm mt-auto">View Details</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

