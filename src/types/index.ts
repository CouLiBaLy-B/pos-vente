export interface Product {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  minPrice: number;
  stock: number;
  unit: string;
  barcode?: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  balance: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  change: number;
  paymentMethod: 'cash' | 'mobile' | 'credit' | 'cheque';
  customerId?: string;
  customerName?: string;
  createdAt: string;
  sellerId?: string;
  sellerName: string;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  taxRate: number;
  address: string;
  phone: string;
  sellerName: string;
  receiptFooter: string;
}

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

// =============================================
// NEW TYPES
// =============================================

export interface CashRegisterSession {
  id: string;
  openerId: string;
  openerName: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  status: 'open' | 'closed';
  salesCount: number;
  salesTotal: number;
  cashPayments: number;
  mobilePayments: number;
  otherPayments: number;
  expensesTotal: number;
  note?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paidBy: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  items?: string;
  balance: number;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId: string;
  userName: string;
  createdAt: string;
  cost?: number;
  supplierId?: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'mobile' | 'cheque';
  note?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
