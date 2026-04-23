const API_BASE = '/api';
let _apiAvailable = false;

export async function checkApi(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    _apiAvailable = res.ok;
    return _apiAvailable;
  } catch {
    _apiAvailable = false;
    return false;
  }
}

export function isApiAvailable(): boolean {
  return _apiAvailable;
}

async function api<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  if (!_apiAvailable) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('API Error:', method, path, err);
    return null;
  }
}

// Products
export const getProducts = () => api<any[]>('GET', '/products');
export const createProduct = (data: any) => api<any>('POST', '/products', data);
export const updateProduct = (id: string, data: any) => api<any>('PUT', `/products/${id}`, data);
export const deleteProduct = (id: string) => api<void>('DELETE', `/products/${id}`);

// Categories
export const getCategories = () => api<any[]>('GET', '/categories');
export const createCategory = (data: any) => api<any>('POST', '/categories', data);
export const deleteCategory = (id: string) => api<void>('DELETE', `/categories/${id}`);

// Customers
export const getCustomers = () => api<any[]>('GET', '/customers');
export const createCustomer = (data: any) => api<any>('POST', '/customers', data);
export const updateCustomer = (id: string, data: any) => api<any>('PUT', `/customers/${id}`, data);
export const deleteCustomer = (id: string) => api<void>('DELETE', `/customers/${id}`);

// Sales
export const getSales = () => api<any[]>('GET', '/sales');
export const createSale = (data: any) => api<any>('POST', '/sales', data);

// Users
export const getUsers = () => api<any[]>('GET', '/users');
export const loginApi = (username: string, password: string) =>
  api<{ user: any }>('POST', '/auth/login', { username, password });
export const createUser = (data: any) => api<any>('POST', '/users', data);
export const updateUser = (id: string, data: any) => api<any>('PUT', `/users/${id}`, data);
export const deleteUser = (id: string) => api<void>('DELETE', `/users/${id}`);

// Settings
export const getSettings = () => api<any>('GET', '/settings');
export const updateSettings = (data: any) => api<any>('PUT', '/settings', data);

// NEW: Expenses
export const getExpenses = () => api<any[]>('GET', '/expenses');
export const createExpense = (data: any) => api<any>('POST', '/expenses', data);
export const deleteExpense = (id: string) => api<void>('DELETE', `/expenses/${id}`);

// NEW: Suppliers
export const getSuppliers = () => api<any[]>('GET', '/suppliers');
export const createSupplier = (data: any) => api<any>('POST', '/suppliers', data);
export const updateSupplier = (id: string, data: any) => api<any>('PUT', `/suppliers/${id}`, data);
export const deleteSupplier = (id: string) => api<void>('DELETE', `/suppliers/${id}`);

// NEW: Stock Movements
export const getStockMovements = () => api<any[]>('GET', '/stock-movements');
export const createStockMovement = (data: any) => api<any>('POST', '/stock-movements', data);

// NEW: Customer Payments
export const getCustomerPayments = () => api<any[]>('GET', '/customer-payments');
export const createCustomerPayment = (data: any) => api<any>('POST', '/customer-payments', data);

// NEW: Cash Register
export const getRegisterSessions = () => api<any[]>('GET', '/register-sessions');
export const createRegisterSession = (data: any) => api<any>('POST', '/register-sessions', data);
export const closeRegisterSession = (id: string, data: any) => api<any>('PUT', `/register-sessions/${id}/close`, data);
export const getActiveRegisterSession = () => api<any>('GET', '/register-sessions/active');
