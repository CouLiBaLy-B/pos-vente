import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import ToastContainer from './components/ToastContainer';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Login from './pages/Login';
import CashRegister from './pages/CashRegister';
import Expenses from './pages/Expenses';
import Suppliers from './pages/Suppliers';
import type { ReactNode } from 'react';

function ProtectedRoute({ children, permission }: { children: ReactNode; permission: string }) {
  const { isAuthenticated, hasPermission } = useStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasPermission(permission)) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-6a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
      </div>
      <h2 className="text-xl font-bold text-gray-600 mb-2">Accès refusé</h2>
      <p className="text-sm text-gray-400">Permissions insuffisantes.</p>
    </div>
  );
  return <>{children}</>;
}

import { useStore } from './context/StoreContext';

function AppRoutes() {
  const { isAuthenticated } = useStore();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={
        isAuthenticated ? (
          <Layout>
            <Routes>
              <Route path="/" element={<ProtectedRoute permission="dashboard"><Dashboard /></ProtectedRoute>} />
              <Route path="/pos" element={<ProtectedRoute permission="pos"><POS /></ProtectedRoute>} />
              <Route path="/register" element={<ProtectedRoute permission="register"><CashRegister /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute permission="inventory"><Inventory /></ProtectedRoute>} />
              <Route path="/suppliers" element={<ProtectedRoute permission="suppliers"><Suppliers /></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute permission="expenses"><Expenses /></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute permission="sales"><Sales /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute permission="customers"><Customers /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute permission="reports"><Reports /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute permission="users"><Users /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute permission="settings"><Settings /></ProtectedRoute>} />
            </Routes>
          </Layout>
        ) : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
