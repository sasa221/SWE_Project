let apiBase = '';
let apiInitialized = false;

async function initApi() {
    if (apiInitialized) return;
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        apiBase = config.apiBase;
        apiInitialized = true;
    } catch (error) {
        console.error('Failed to load API config, using default:', error);
        apiBase = 'http://localhost:8090/api';
        apiInitialized = true;
    }
}

// Initialize immediately
initApi();

function getAuthHeaders() {
    const token = localStorage.getItem('jwt');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

async function apiGet(endpoint) {
    const response = await fetch(`${apiBase}${endpoint}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
}

async function apiPost(endpoint, data) {
    const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
}

async function apiPut(endpoint, data) {
    const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
}

async function apiDelete(endpoint) {
    const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    return response.json();
}

async function login(username, password) {
    const response = await apiPost('/auth/login', { username, password });
    localStorage.setItem('jwt', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
}

async function register(data) {
    const response = await apiPost('/auth/register', data);
    localStorage.setItem('jwt', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
}

function logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function isAuthenticated() {
    return !!localStorage.getItem('jwt');
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'ROLE_ADMIN';
}

