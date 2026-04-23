import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Receipt,
  Users, BarChart3, Settings, Menu, X, Store, LogOut, Shield, ShieldCheck, ShieldAlert, Wifi, WifiOff, Wallet, TrendingDown, Truck, Database
} from 'lucide-react';
import { useStore, ROLE_LABELS } from '../context/StoreContext';

const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', permission: 'dashboard' },
  { to: '/pos', icon: ShoppingCart, label: 'Caisse', permission: 'pos' },
  { to: '/register', icon: Wallet, label: 'Gestion de caisse', permission: 'register' },
  { to: '/inventory', icon: Package, label: 'Stock', permission: 'inventory' },
  { to: '/suppliers', icon: Truck, label: 'Fournisseurs', permission: 'suppliers' },
  { to: '/expenses', icon: TrendingDown, label: 'Dépenses', permission: 'expenses' },
  { to: '/sales', icon: Receipt, label: 'Ventes', permission: 'sales' },
  { to: '/customers', icon: Users, label: 'Clients', permission: 'customers' },
  { to: '/reports', icon: BarChart3, label: 'Rapports', permission: 'reports' },
  { to: '/users', icon: Shield, label: 'Utilisateurs', permission: 'users' },
  { to: '/settings', icon: Settings, label: 'Paramètres', permission: 'settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout, hasPermission, isOnline } = useStore();
  const navigate = useNavigate();
  const navItems = allNavItems.filter(item => hasPermission(item.permission));

  const handleLogout = () => { logout(); navigate('/login'); };

  const getRoleIcon = () => {
    switch (currentUser?.role) {
      case 'admin': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'manager': return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      default: return <Shield className="w-4 h-4 text-green-500" />;
    }
  };

  const getRoleColor = () => {
    switch (currentUser?.role) {
      case 'admin': return 'text-red-600 bg-red-50';
      case 'manager': return 'text-blue-600 bg-blue-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-200 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700">
          <Store className="w-7 h-7 text-amber-400" />
          <div><h1 className="text-sm font-bold leading-tight">Coulibaly & Frères</h1><p className="text-xs text-gray-400">POS Quincaillerie</p></div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden"><X className="w-5 h-5" /></button>
        </div>

        <div className="mx-3 mt-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${isOnline ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            {isOnline ? <Database className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'PostgreSQL' : 'Local'}</span>
          </div>
        </div>

        {currentUser && (
          <div className="mx-3 mt-2 p-2.5 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentUser.role === 'admin' ? 'bg-red-500/20 text-red-400' : currentUser.role === 'manager' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1"><p className="text-xs font-medium text-white truncate">{currentUser.name}</p><div className="flex items-center gap-1">{getRoleIcon()}<p className="text-xs text-gray-400">{ROLE_LABELS[currentUser.role]}</p></div></div>
            </div>
          </div>
        )}

        <nav className="mt-1 px-3 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-amber-500/20 text-amber-400' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}>
              <Icon className="w-4.5 h-4.5 flex-shrink-0" /><span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/20 transition">
            <LogOut className="w-4.5 h-4.5" /> Déconnexion
          </button>
          <div className="mt-1.5 p-2 bg-gray-700/30 rounded-lg"><p className="text-xs text-gray-500">🇨🇮 Côte d'Ivoire</p><p className="text-xs text-gray-600">© 2024 Coulibaly & Frères</p></div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm border-b px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100"><Menu className="w-5 h-5" /></button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${isOnline ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}<span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
            </div>
            {currentUser && <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${getRoleColor()}`}>{getRoleIcon()}<span>{ROLE_LABELS[currentUser.role]}</span></div>}
            <div className="text-right hidden md:block"><p className="text-xs font-semibold text-gray-700">{new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p><p className="text-xs text-gray-400">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p></div>
            <button onClick={handleLogout} className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center hover:bg-amber-200 transition" title="Déconnexion">
              <span className="text-amber-700 font-bold text-xs">{currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CF'}</span>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
