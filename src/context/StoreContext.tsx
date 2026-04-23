import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Product, Category, Customer, CartItem, Sale, StoreSettings, User, UserRole,
  CashRegisterSession, Expense, Supplier, StockMovement, CustomerPayment, Toast,
} from '../types';
import * as api from '../services/api';

const defaultCategories: Category[] = [
  { id: '1', name: 'Outils', icon: '🔧', color: '#3B82F6' },
  { id: '2', name: 'Plomberie', icon: '🔧', color: '#06B6D4' },
  { id: '3', name: 'Électricité', icon: '⚡', color: '#EAB308' },
  { id: '4', name: 'Peinture', icon: '🎨', color: '#8B5CF6' },
  { id: '5', name: 'Quincaillerie', icon: '🔩', color: '#6B7280' },
  { id: '6', name: 'Menuiserie', icon: '🪚', color: '#A16207' },
  { id: '7', name: 'Jardin', icon: '🌿', color: '#16A34A' },
  { id: '8', name: 'Divers', icon: '📦', color: '#EC4899' },
];

const sampleProducts: Product[] = [
  { id: 'p1', name: 'Marteau 500g', category: '1', purchasePrice: 1500, sellingPrice: 2500, minPrice: 2000, stock: 45, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p2', name: 'Tournevis plat', category: '1', purchasePrice: 800, sellingPrice: 1500, minPrice: 1200, stock: 60, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p3', name: 'Pince universelle', category: '1', purchasePrice: 2000, sellingPrice: 3500, minPrice: 2800, stock: 30, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p4', name: 'Robinet mélangeur', category: '2', purchasePrice: 5000, sellingPrice: 8500, minPrice: 7000, stock: 15, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p5', name: 'Tuyau PVC 1m (20mm)', category: '2', purchasePrice: 500, sellingPrice: 1000, minPrice: 800, stock: 200, unit: 'mètre', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p6', name: 'Coude PVC 90°', category: '2', purchasePrice: 200, sellingPrice: 500, minPrice: 350, stock: 150, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p7', name: 'Câble électrique 2.5mm²', category: '3', purchasePrice: 300, sellingPrice: 600, minPrice: 500, stock: 500, unit: 'mètre', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p8', name: 'Interrupteur simple', category: '3', purchasePrice: 400, sellingPrice: 800, minPrice: 600, stock: 80, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p9', name: 'Ampoule LED 12W', category: '3', purchasePrice: 600, sellingPrice: 1200, minPrice: 900, stock: 100, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p10', name: 'Peinture glycéro 5L', category: '4', purchasePrice: 8000, sellingPrice: 14000, minPrice: 11000, stock: 25, unit: 'bidon', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p11', name: 'Peinture émail 1L', category: '4', purchasePrice: 2500, sellingPrice: 4500, minPrice: 3500, stock: 40, unit: 'bidon', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p12', name: 'Rouleau peinture', category: '4', purchasePrice: 1000, sellingPrice: 2000, minPrice: 1500, stock: 35, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p13', name: 'Clous 2 pouces (kg)', category: '5', purchasePrice: 1500, sellingPrice: 2500, minPrice: 2000, stock: 50, unit: 'kg', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p14', name: 'Vis à bois 3x30 (boîte)', category: '5', purchasePrice: 800, sellingPrice: 1500, minPrice: 1200, stock: 60, unit: 'boîte', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p15', name: 'Cadenas 50mm', category: '5', purchasePrice: 2000, sellingPrice: 3500, minPrice: 2800, stock: 40, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p16', name: 'Scie à métaux', category: '6', purchasePrice: 2500, sellingPrice: 4500, minPrice: 3500, stock: 20, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p17', name: 'Planches 2x4 (2m)', category: '6', purchasePrice: 3000, sellingPrice: 5500, minPrice: 4500, stock: 30, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p18', name: 'Tuyau arrosage 10m', category: '7', purchasePrice: 4000, sellingPrice: 7500, minPrice: 6000, stock: 15, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p19', name: 'Sceau plastique 20L', category: '8', purchasePrice: 1500, sellingPrice: 3000, minPrice: 2500, stock: 50, unit: 'pièce', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p20', name: 'Fil de fer (kg)', category: '5', purchasePrice: 1200, sellingPrice: 2200, minPrice: 1800, stock: 40, unit: 'kg', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const defaultSettings: StoreSettings = {
  storeName: 'Coulibaly & Frères',
  currency: 'FCFA',
  taxRate: 0,
  address: "Quartier Commerce, Abidjan, Côte d'Ivoire",
  phone: '+225 07 00 00 00 00',
  sellerName: 'Vendeur 1',
  receiptFooter: 'Merci pour votre achat chez Coulibaly & Frères ! À bientôt !',
};

const defaultUsers: User[] = [
  { id: 'u1', username: 'admin', name: 'Amadou Coulibaly', role: 'admin', password: 'admin123', phone: '+225 07 00 00 00', active: true, createdAt: new Date().toISOString() },
  { id: 'u2', username: 'manager', name: 'Moussa Koné', role: 'manager', password: 'manager123', phone: '+225 05 00 00 00', active: true, createdAt: new Date().toISOString() },
  { id: 'u3', username: 'caissier1', name: 'Awa Diallo', role: 'cashier', password: 'caissier123', phone: '+225 01 00 00 00', active: true, createdAt: new Date().toISOString() },
];

const EXPENSE_CATEGORIES = ['Loyer', 'Salaires', 'Électricité', 'Eau', 'Transport', 'Fournitures', 'Réparation', 'Impôts', 'Assurance', 'Autres'];

interface StoreContextType {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  sales: Sale[];
  settings: StoreSettings;
  cart: CartItem[];
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  // Register
  activeRegister: CashRegisterSession | null;
  registerSessions: CashRegisterSession[];
  // Expenses
  expenses: Expense[];
  expenseCategories: string[];
  // Suppliers
  suppliers: Supplier[];
  // Stock
  stockMovements: StockMovement[];
  // Customer Payments
  customerPayments: CustomerPayment[];
  // Toasts
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  // Cart
  addToCart: (product: Product, quantity?: number, price?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  // Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Categories
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  payCustomerDebt: (customerId: string, amount: number, paymentMethod: CustomerPayment['paymentMethod'], note?: string) => void;
  // Sales
  completeSale: (paymentMethod: Sale['paymentMethod'], paid: number, customerId?: string) => Sale;
  updateSettings: (settings: Partial<StoreSettings>) => void;
  // Stats
  getTodaySales: () => Sale[];
  getTodayRevenue: () => number;
  getLowStockProducts: () => Product[];
  searchProducts: (query: string) => Product[];
  // Auth
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  hasPermission: (permission: string) => boolean;
  // Register
  openRegister: (openingBalance: number, note?: string) => void;
  closeRegister: (closingBalance: number, note?: string) => void;
  isRegisterOpen: () => boolean;
  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  getTodayExpenses: () => Expense[];
  getTodayExpensesTotal: () => number;
  // Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  // Stock
  adjustStock: (productId: string, type: StockMovement['type'], quantity: number, reason: string, cost?: number, supplierId?: string) => void;
  // Export
  exportCSV: (data: Record<string, unknown>[], filename: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function loadLS<T>(key: string, def: T): T {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
}
function saveLS<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* */ }
}

export const ROLE_LABELS: Record<UserRole, string> = { admin: 'Administrateur', manager: 'Manager', cashier: 'Caissier' };
export const ROLE_COLORS: Record<UserRole, string> = { admin: 'bg-red-100 text-red-700', manager: 'bg-blue-100 text-blue-700', cashier: 'bg-green-100 text-green-700' };
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'pos', 'inventory', 'sales', 'customers', 'reports', 'settings', 'users', 'register', 'expenses', 'suppliers'],
  manager: ['dashboard', 'pos', 'inventory', 'sales', 'customers', 'reports', 'users', 'register', 'expenses', 'suppliers'],
  cashier: ['dashboard', 'pos', 'sales', 'register'],
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadLS('pos_products', sampleProducts));
  const [categories, setCategories] = useState<Category[]>(() => loadLS('pos_categories', defaultCategories));
  const [customers, setCustomers] = useState<Customer[]>(() => loadLS('pos_customers', []));
  const [sales, setSales] = useState<Sale[]>(() => loadLS('pos_sales', []));
  const [settings, setSettings] = useState<StoreSettings>(() => loadLS('pos_settings', defaultSettings));
  const [users, setUsers] = useState<User[]>(() => loadLS('pos_users', defaultUsers));
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadLS('pos_current_user', null));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeRegister, setActiveRegister] = useState<CashRegisterSession | null>(() => loadLS('pos_active_register', null));
  const [registerSessions, setRegisterSessions] = useState<CashRegisterSession[]>(() => loadLS('pos_register_sessions', []));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadLS('pos_expenses', []));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadLS('pos_suppliers', []));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => loadLS('pos_stock_movements', []));
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(() => loadLS('pos_customer_payments', []));

  const isAuthenticated = currentUser !== null;

  useEffect(() => { saveLS('pos_products', products); }, [products]);
  useEffect(() => { saveLS('pos_categories', categories); }, [categories]);
  useEffect(() => { saveLS('pos_customers', customers); }, [customers]);
  useEffect(() => { saveLS('pos_sales', sales); }, [sales]);
  useEffect(() => { saveLS('pos_settings', settings); }, [settings]);
  useEffect(() => { saveLS('pos_users', users); }, [users]);
  useEffect(() => { saveLS('pos_current_user', currentUser); }, [currentUser]);
  useEffect(() => { saveLS('pos_active_register', activeRegister); }, [activeRegister]);
  useEffect(() => { saveLS('pos_register_sessions', registerSessions); }, [registerSessions]);
  useEffect(() => { saveLS('pos_expenses', expenses); }, [expenses]);
  useEffect(() => { saveLS('pos_suppliers', suppliers); }, [suppliers]);
  useEffect(() => { saveLS('pos_stock_movements', stockMovements); }, [stockMovements]);
  useEffect(() => { saveLS('pos_customer_payments', customerPayments); }, [customerPayments]);

  // Check API on mount
  useEffect(() => {
    api.checkApi().then(available => {
      setIsOnline(available);
      if (available) {
        Promise.all([
          api.getProducts(), api.getCategories(), api.getCustomers(), api.getSales(), api.getSettings(), api.getUsers(),
          api.getExpenses(), api.getSuppliers(), api.getStockMovements(), api.getCustomerPayments(),
          api.getActiveRegisterSession(), api.getRegisterSessions(),
        ]).then(([p, c, cust, s, sett, u, exp, sup, sm, cp, ar, rs]) => {
          if (p) setProducts(p);
          if (c) setCategories(c);
          if (cust) setCustomers(cust);
          if (s) setSales(s);
          if (sett) setSettings({ ...defaultSettings, ...sett });
          if (u) setUsers(u);
          if (exp) setExpenses(exp);
          if (sup) setSuppliers(sup);
          if (sm) setStockMovements(sm);
          if (cp) setCustomerPayments(cp);
          if (ar) setActiveRegister(ar);
          if (rs) setRegisterSessions(rs);
        });
      }
    });
  }, []);

  // ---- Toasts ----
  const addToast = useCallback((type: Toast['type'], message: string, duration: number = 4000) => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id, type, message, duration }]);
    if (duration > 0) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // ---- Cart ----
  const addToCart = useCallback((product: Product, quantity: number = 1, price?: number) => {
    const unitPrice = price ?? product.sellingPrice;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, unitPrice, total: (item.quantity + quantity) * unitPrice * (1 - item.discount / 100) }
            : item
        );
      }
      return [...prev, { product, quantity, unitPrice, discount: 0, total: quantity * unitPrice }];
    });
  }, []);
  const removeFromCart = useCallback((productId: string) => setCart(prev => prev.filter(item => item.product.id !== productId)), []);
  const updateCartItem = useCallback((productId: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) { const u = { ...item, ...updates }; u.total = u.quantity * u.unitPrice * (1 - u.discount / 100); return u; }
      return item;
    }));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  // ---- Products ----
  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const np: Product = { ...product, id: 'p' + Date.now(), createdAt: now, updatedAt: now };
    setProducts(prev => [...prev, np]);
    // Don't send large base64 image to API if it's too big — handle gracefully
    api.createProduct(product).then(p => { if (p) setProducts(prev => prev.map(x => x.id === np.id ? { ...np, ...p, image: p.image || np.image } : x)); });
    addToast('success', `Produit "${product.name}" ajouté`);
  }, [addToast]);
  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    api.updateProduct(id, updates);
    addToast('success', 'Produit mis à jour');
  }, [addToast]);
  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    api.deleteProduct(id);
    addToast('success', 'Produit supprimé');
  }, [addToast]);

  // ---- Categories ----
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const nc = { ...category, id: Date.now().toString() };
    setCategories(prev => [...prev, nc]);
    api.createCategory(category).then(c => { if (c) setCategories(prev => prev.map(x => x.id === nc.id ? c : x)); });
    addToast('success', `Catégorie "${category.name}" ajoutée`);
  }, [addToast]);
  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    api.deleteCategory(id);
    addToast('success', 'Catégorie supprimée');
  }, [addToast]);

  // ---- Customers ----
  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const nc: Customer = { ...customer, id: 'c' + Date.now(), createdAt: new Date().toISOString() };
    setCustomers(prev => [...prev, nc]);
    api.createCustomer(customer).then(c => { if (c) setCustomers(prev => prev.map(x => x.id === nc.id ? c : x)); });
    addToast('success', `Client "${customer.name}" ajouté`);
  }, [addToast]);
  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    api.updateCustomer(id, updates);
  }, []);
  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    api.deleteCustomer(id);
    addToast('success', 'Client supprimé');
  }, [addToast]);

  // ---- Customer Debt Payment ----
  const payCustomerDebt = useCallback((customerId: string, amount: number, paymentMethod: CustomerPayment['paymentMethod'], note?: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;
    const payment: CustomerPayment = {
      id: 'cp' + Date.now(), customerId, customerName: cust.name, amount, paymentMethod, note,
      userId: currentUser?.id || '', userName: currentUser?.name || '', createdAt: new Date().toISOString(),
    };
    setCustomerPayments(prev => [...prev, payment]);
    const newBalance = Math.max(0, cust.balance - amount);
    const actualDeduction = cust.balance - newBalance;
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, balance: newBalance } : c));
    api.updateCustomer(customerId, { balance: newBalance });
    api.createCustomerPayment(payment);
    addToast('success', `Paiement de ${actualDeduction.toLocaleString('fr-FR')} FCFA enregistré pour ${cust.name}`);
  }, [customers, currentUser, addToast]);

  // ---- Sales ----
  const completeSale = useCallback((paymentMethod: Sale['paymentMethod'], paid: number, customerId?: string): Sale => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * settings.taxRate / 100;
    const total = subtotal + tax;
    const change = paid - total;
    const customerName = customerId ? customers.find(c => c.id === customerId)?.name : undefined;
    const sale: Sale = {
      id: 'VTE-' + Date.now(), items: [...cart], subtotal, discount: 0, tax, total, paid,
      change: Math.max(0, change), paymentMethod, customerId, customerName,
      createdAt: new Date().toISOString(), sellerId: currentUser?.id, sellerName: currentUser?.name || settings.sellerName,
    };
    setProducts(prev => prev.map(p => {
      const ci = cart.find(item => item.product.id === p.id);
      if (ci) return { ...p, stock: Math.max(0, p.stock - ci.quantity), updatedAt: new Date().toISOString() };
      return p;
    }));
    if (paymentMethod === 'credit' && customerId) {
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, balance: c.balance + total } : c));
    }
    // Update active register stats
    if (activeRegister) {
      const updatedReg = { ...activeRegister, salesCount: activeRegister.salesCount + 1, salesTotal: activeRegister.salesTotal + total };
      if (paymentMethod === 'cash') updatedReg.cashPayments += total;
      else if (paymentMethod === 'mobile') updatedReg.mobilePayments += total;
      else updatedReg.otherPayments += total;
      setActiveRegister(updatedReg);
      api.closeRegisterSession(updatedReg.id, updatedReg); // sync
    }
    setSales(prev => [...prev, sale]);
    setCart([]);
    api.createSale(sale).then(() => { api.getProducts().then(p => { if (p) setProducts(p); }); });
    addToast('success', `Vente ${sale.id} enregistrée — ${total.toLocaleString('fr-FR')} FCFA`);
    return sale;
  }, [cart, customers, settings, currentUser, activeRegister, addToast]);

  // ---- Settings ----
  const updateSettings = useCallback((updates: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    api.updateSettings(updates);
    addToast('success', 'Paramètres mis à jour');
  }, [addToast]);

  // ---- Stats ----
  const getTodaySales = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(s => s.createdAt.split('T')[0] === today);
  }, [sales]);
  const getTodayRevenue = useCallback(() => getTodaySales().reduce((sum, s) => sum + s.total, 0), [getTodaySales]);
  const getLowStockProducts = useCallback(() => products.filter(p => p.stock <= 10), [products]);
  const searchProducts = useCallback((query: string) => {
    const q = query.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }, [products]);

  // ---- Auth ----
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    if (api.isApiAvailable()) {
      const result = await api.loginApi(username, password);
      if (result?.user) { setCurrentUser({ ...result.user, password }); return true; }
      return false;
    }
    const user = users.find(u => u.username === username && u.password === password && u.active);
    if (user) { const upd = { ...user, lastLogin: new Date().toISOString() }; setUsers(prev => prev.map(u => u.id === user.id ? upd : u)); setCurrentUser(upd); return true; }
    return false;
  }, [users]);
  const logout = useCallback(() => { setCurrentUser(null); setCart([]); }, []);

  // ---- User Management ----
  const addUser = useCallback((user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    const nu: User = { ...user, id: 'u' + Date.now(), createdAt: new Date().toISOString() };
    setUsers(prev => [...prev, nu]);
    api.createUser(user).then(u => { if (u) setUsers(prev => prev.map(x => x.id === nu.id ? u : x)); });
    addToast('success', `Utilisateur "${user.name}" créé`);
  }, [addToast]);
  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    setCurrentUser(prev => (prev && prev.id === id) ? { ...prev, ...updates } : prev);
    api.updateUser(id, updates);
  }, []);
  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    api.deleteUser(id);
    addToast('success', 'Utilisateur supprimé');
  }, [addToast]);
  const hasPermission = useCallback((permission: string): boolean => {
    if (!currentUser) return false;
    return ROLE_PERMISSIONS[currentUser.role]?.includes(permission) ?? false;
  }, [currentUser]);

  // ---- Cash Register ----
  const openRegister = useCallback((openingBalance: number, note?: string) => {
    const session: CashRegisterSession = {
      id: 'reg-' + Date.now(), openerId: currentUser?.id || '', openerName: currentUser?.name || '',
      openedAt: new Date().toISOString(), openingBalance, status: 'open',
      salesCount: 0, salesTotal: 0, cashPayments: 0, mobilePayments: 0, otherPayments: 0, expensesTotal: 0, note,
    };
    setActiveRegister(session);
    setRegisterSessions(prev => [...prev, session]);
    api.createRegisterSession(session);
    addToast('success', `Caisse ouverte avec ${openingBalance.toLocaleString('fr-FR')} FCFA`);
  }, [currentUser, addToast]);
  const closeRegister = useCallback((closingBalance: number, note?: string) => {
    if (!activeRegister) return;
    const today = new Date().toISOString().split('T')[0];
    const todayExp = expenses.filter(e => e.date.split('T')[0] === today).reduce((s, e) => s + e.amount, 0);
    const expected = activeRegister.openingBalance + activeRegister.cashPayments - todayExp;
    const diff = closingBalance - expected;
    const closed: CashRegisterSession = {
      ...activeRegister, closedAt: new Date().toISOString(), closingBalance, expectedBalance: expected,
      difference: diff, status: 'closed', expensesTotal: todayExp,
      note: note || activeRegister.note,
    };
    setActiveRegister(null);
    setRegisterSessions(prev => prev.map(s => s.id === closed.id ? closed : s));
    api.closeRegisterSession(closed.id, closed);
    addToast(diff >= 0 ? 'success' : 'warning',
      `Caisse fermée. ${diff >= 0 ? 'Excédent' : 'Déficit'}: ${Math.abs(diff).toLocaleString('fr-FR')} FCFA`);
  }, [activeRegister, expenses, addToast]);
  const isRegisterOpen = useCallback(() => activeRegister?.status === 'open', [activeRegister]);

  // ---- Expenses ----
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const ne: Expense = { ...expense, id: 'exp-' + Date.now(), createdAt: new Date().toISOString() };
    setExpenses(prev => [...prev, ne]);
    if (activeRegister) {
      setActiveRegister(prev => prev ? { ...prev, expensesTotal: prev.expensesTotal + expense.amount } : null);
    }
    api.createExpense(ne);
    addToast('success', `Dépense "${expense.description}" de ${expense.amount.toLocaleString('fr-FR')} FCFA ajoutée`);
  }, [activeRegister, addToast]);
  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    api.deleteExpense(id);
    addToast('success', 'Dépense supprimée');
  }, [addToast]);
  const getTodayExpenses = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return expenses.filter(e => e.date.split('T')[0] === today);
  }, [expenses]);
  const getTodayExpensesTotal = useCallback(() => getTodayExpenses().reduce((s, e) => s + e.amount, 0), [getTodayExpenses]);

  // ---- Suppliers ----
  const addSupplier = useCallback((supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    const ns: Supplier = { ...supplier, id: 'sup-' + Date.now(), createdAt: new Date().toISOString() };
    setSuppliers(prev => [...prev, ns]);
    api.createSupplier(ns);
    addToast('success', `Fournisseur "${supplier.name}" ajouté`);
  }, [addToast]);
  const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    api.updateSupplier(id, updates);
  }, []);
  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    api.deleteSupplier(id);
    addToast('success', 'Fournisseur supprimé');
  }, [addToast]);

  // ---- Stock Movements ----
  const adjustStock = useCallback((productId: string, type: StockMovement['type'], quantity: number, reason: string, cost?: number, supplierId?: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const previousStock = product.stock;
    let newStock = previousStock;
    if (type === 'in' || type === 'return') newStock = previousStock + quantity;
    else if (type === 'out') newStock = Math.max(0, previousStock - quantity);
    else newStock = quantity; // adjustment = set to exact quantity
    const movement: StockMovement = {
      id: 'sm-' + Date.now(), productId, productName: product.name, type, quantity,
      previousStock, newStock, reason, userId: currentUser?.id || '', userName: currentUser?.name || '',
      createdAt: new Date().toISOString(), cost, supplierId,
    };
    setStockMovements(prev => [...prev, movement]);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock, updatedAt: new Date().toISOString() } : p));
    api.createStockMovement(movement);
    api.updateProduct(productId, { stock: newStock });
    addToast('success', `Stock de "${product.name}" mis à jour: ${previousStock} → ${newStock}`);
  }, [products, currentUser, addToast]);

  // ---- Export CSV ----
  const exportCSV = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) { addToast('warning', 'Aucune donnée à exporter'); return; }
    const headers = Object.keys(data[0]);
    const csv = [headers.join(';'), ...data.map(row => headers.map(h => {
      const val = row[h];
      return typeof val === 'string' && val.includes(';') ? `"${val}"` : String(val ?? '');
    }).join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    addToast('success', `Fichier "${filename}" exporté`);
  }, [addToast]);

  return (
    <StoreContext.Provider value={{
      products, categories, customers, sales, settings, cart,
      users, currentUser, isAuthenticated, isOnline,
      activeRegister, registerSessions,
      expenses, expenseCategories: EXPENSE_CATEGORIES,
      suppliers, stockMovements, customerPayments,
      toasts, addToast, removeToast,
      addToCart, removeFromCart, updateCartItem, clearCart,
      addProduct, updateProduct, deleteProduct,
      addCategory, deleteCategory,
      addCustomer, updateCustomer, deleteCustomer, payCustomerDebt,
      completeSale, updateSettings,
      getTodaySales, getTodayRevenue, getLowStockProducts, searchProducts,
      login, logout, addUser, updateUser, deleteUser, hasPermission,
      openRegister, closeRegister, isRegisterOpen,
      addExpense, deleteExpense, getTodayExpenses, getTodayExpensesTotal,
      addSupplier, updateSupplier, deleteSupplier,
      adjustStock, exportCSV,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
