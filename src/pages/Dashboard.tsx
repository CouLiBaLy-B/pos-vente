import { useStore } from '../context/StoreContext';
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react';

export default function Dashboard() {
  const { products, sales, customers, getTodaySales, getTodayRevenue, getLowStockProducts } = useStore();

  const todaySales = getTodaySales();
  const todayRevenue = getTodayRevenue();
  const lowStock = getLowStockProducts();
  const totalProducts = products.length;
  const totalCustomers = customers.length;

  const weekRevenue = sales
    .filter(s => {
      const d = new Date(s.createdAt);
      const now = new Date();
      return d >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    })
    .reduce((sum, s) => sum + s.total, 0);

  const monthRevenue = sales
    .filter(s => {
      const d = new Date(s.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, s) => sum + s.total, 0);

  const formatMoney = (amount: number) => amount.toLocaleString('fr-FR') + ' FCFA';

  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  const topProducts = [...products]
    .sort((a, b) => (b.sellingPrice - b.purchasePrice) / b.sellingPrice - (a.sellingPrice - a.purchasePrice) / a.sellingPrice)
    .slice(0, 5);

  // Daily sales for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const daySales = sales.filter(s => s.createdAt.split('T')[0] === dateStr);
    const revenue = daySales.reduce((sum, s) => sum + s.total, 0);
    return { date: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), revenue, count: daySales.length };
  });

  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-500 text-sm">Vue d'ensemble de votre activité</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ventes du jour</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatMoney(todayRevenue)}</p>
              <p className="text-xs text-green-500 mt-1">{todaySales.length} transactions</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenu hebdomadaire</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatMoney(weekRevenue)}</p>
              <p className="text-xs text-blue-500 mt-1">7 derniers jours</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Produits en stock</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalProducts}</p>
              <p className="text-xs text-purple-500 mt-1">{lowStock.length} en stock faible</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clients</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalCustomers}</p>
              <p className="text-xs text-orange-500 mt-1">Base clients</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue chart & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Ventes des 7 derniers jours</h3>
          <div className="flex items-end gap-2 h-48">
            {last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">
                  {day.revenue > 0 ? (day.revenue / 1000).toFixed(0) + 'k' : '0'}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-md transition-all duration-500 min-h-[4px]"
                  style={{ height: `${Math.max((day.revenue / maxRevenue) * 140, 4)}px` }}
                />
                <span className="text-xs text-gray-400">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Statistiques</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-700">Total ventes</span>
              </div>
              <span className="font-bold text-gray-800">{sales.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700">Revenu mensuel</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">{formatMoney(monthRevenue)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-gray-700">Stock faible</span>
              </div>
              <span className="font-bold text-amber-600">{lowStock.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-700">Panier moyen</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">
                {sales.length > 0 ? formatMoney(sales.reduce((s, x) => s + x.total, 0) / sales.length) : '0 FCFA'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Ventes récentes</h3>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          {recentSales.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune vente enregistrée</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-auto">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{sale.id}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(sale.createdAt).toLocaleDateString('fr-FR')} {new Date(sale.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{formatMoney(sale.total)}</p>
                    <p className="text-xs text-gray-400">{sale.items.length} article(s)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Alerte stock faible</h3>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          {lowStock.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Tous les stocks sont suffisants ✓</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-auto">
              {lowStock.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-amber-600'}`}>
                      {product.stock} restant(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Meilleures marges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topProducts.map((p, i) => {
            const margin = ((p.sellingPrice - p.purchasePrice) / p.sellingPrice * 100).toFixed(0);
            return (
              <div key={p.id} className="bg-gray-50 rounded-lg p-3 text-center">
                {p.image ? (
                  <div className="w-12 h-12 mx-auto rounded-lg overflow-hidden mb-1">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-amber-500">#{i + 1}</span>
                )}
                <p className="text-sm font-medium text-gray-700 mt-1 truncate">{p.name}</p>
                <p className="text-xs text-green-600 font-semibold">{margin}% marge</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
