import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Calendar } from 'lucide-react';

export default function Reports() {
  const { sales, products, categories } = useStore();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const now = new Date();
  const filterByPeriod = (dateStr: string) => {
    const d = new Date(dateStr);
    switch (period) {
      case 'today':
        return d.toDateString() === now.toDateString();
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      }
      case 'month':
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case 'all':
        return true;
    }
  };

  const periodSales = sales.filter(s => filterByPeriod(s.createdAt));
  const totalRevenue = periodSales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = periodSales.reduce((sum, s) =>
    sum + s.items.reduce((itemSum, item) => itemSum + item.product.purchasePrice * item.quantity, 0), 0
  );
  const profit = totalRevenue - totalCost;
  const avgBasket = periodSales.length > 0 ? totalRevenue / periodSales.length : 0;

  // Payment methods breakdown
  const paymentBreakdown = periodSales.reduce((acc, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
    return acc;
  }, {} as Record<string, number>);

  // Top selling products
  const productSales = periodSales.flatMap(s => s.items).reduce((acc, item) => {
    const name = item.product.name;
    if (!acc[name]) acc[name] = { quantity: 0, revenue: 0 };
    acc[name].quantity += item.quantity;
    acc[name].revenue += item.total;
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number }>);

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10);

  // Category sales
  const categorySales = periodSales.flatMap(s => s.items).reduce((acc, item) => {
    const cat = categories.find(c => c.id === item.product.category);
    const name = cat ? cat.name : 'Autre';
    if (!acc[name]) acc[name] = { quantity: 0, revenue: 0 };
    acc[name].quantity += item.quantity;
    acc[name].revenue += item.total;
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number }>);

  const topCategories = Object.entries(categorySales).sort((a, b) => b[1].revenue - a[1].revenue);

  // Daily breakdown for the period
  const dailySales = periodSales.reduce((acc, s) => {
    const day = new Date(s.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    if (!acc[day]) acc[day] = { count: 0, revenue: 0 };
    acc[day].count++;
    acc[day].revenue += s.total;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const maxDailyRevenue = Math.max(...Object.values(dailySales).map(d => d.revenue), 1);

  const formatMoney = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';
  const getMethodLabel = (m: string) => {
    switch (m) {
      case 'cash': return 'Espèces';
      case 'mobile': return 'Mobile Money';
      case 'credit': return 'Crédit';
      case 'cheque': return 'Chèque';
      default: return m;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rapports & Statistiques</h1>
          <p className="text-gray-500 text-sm">Analyse détaillée de vos ventes</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          {(['today', 'week', 'month', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                period === p ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              {p === 'today' ? "Aujourd'hui" : p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatMoney(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{periodSales.length} ventes</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bénéfice estimé</p>
              <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatMoney(profit)}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {profit >= 0 ? <TrendingUp className="w-6 h-6 text-green-600" /> : <TrendingDown className="w-6 h-6 text-red-600" />}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Marge: {totalRevenue > 0 ? (profit / totalRevenue * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Panier moyen</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatMoney(avgBasket)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Par transaction</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Articles vendus</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {periodSales.reduce((sum, s) => sum + s.items.reduce((is, i) => is + i.quantity, 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Unités vendues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily chart */}
        <div className="bg-white rounded-xl shadow-sm p-5 border">
          <h3 className="font-semibold text-gray-800 mb-4">Ventes par jour</h3>
          <div className="flex items-end gap-1 h-48">
            {Object.entries(dailySales).map(([day, data]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{(data.revenue / 1000).toFixed(0)}k</span>
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md min-h-[4px]"
                  style={{ height: `${Math.max((data.revenue / maxDailyRevenue) * 140, 4)}px` }}
                />
                <span className="text-xs text-gray-400 text-center leading-tight">{day}</span>
              </div>
            ))}
          </div>
          {Object.keys(dailySales).length === 0 && (
            <p className="text-center text-gray-400 py-8">Aucune donnée pour cette période</p>
          )}
        </div>

        {/* Payment breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-5 border">
          <h3 className="font-semibold text-gray-800 mb-4">Modes de paiement</h3>
          <div className="space-y-3">
            {Object.entries(paymentBreakdown).map(([method, amount]) => {
              const pct = totalRevenue > 0 ? (amount / totalRevenue * 100) : 0;
              const colors: Record<string, string> = {
                cash: 'bg-green-500', mobile: 'bg-blue-500', credit: 'bg-orange-500', cheque: 'bg-purple-500',
              };
              return (
                <div key={method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{getMethodLabel(method)}</span>
                    <span className="font-medium">{formatMoney(amount)} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`h-3 rounded-full ${colors[method] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(paymentBreakdown).length === 0 && (
              <p className="text-center text-gray-400 py-8">Aucune donnée</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-5 border">
          <h3 className="font-semibold text-gray-800 mb-4">🏆 Meilleures ventes</h3>
          <div className="space-y-2">
            {topProducts.map(([name, data], i) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-600">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400">{data.quantity} vendu(s)</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-800">{formatMoney(data.revenue)}</span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center text-gray-400 py-8">Aucune vente</p>
            )}
          </div>
        </div>

        {/* Category Sales */}
        <div className="bg-white rounded-xl shadow-sm p-5 border">
          <h3 className="font-semibold text-gray-800 mb-4">📊 Ventes par catégorie</h3>
          <div className="space-y-2">
            {topCategories.map(([name, data]) => {
              const pct = totalRevenue > 0 ? (data.revenue / totalRevenue * 100) : 0;
              return (
                <div key={name} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800">{name}</span>
                    <span className="text-sm font-bold text-gray-800">{formatMoney(data.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{data.quantity} articles • {pct.toFixed(1)}%</p>
                </div>
              );
            })}
            {topCategories.length === 0 && (
              <p className="text-center text-gray-400 py-8">Aucune vente</p>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-white rounded-xl shadow-sm p-5 border">
        <h3 className="font-semibold text-gray-800 mb-4">📦 Résumé du stock</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{products.length}</p>
            <p className="text-sm text-gray-500">Produits</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{products.reduce((s, p) => s + p.stock, 0)}</p>
            <p className="text-sm text-gray-500">Unités en stock</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{products.filter(p => p.stock <= 10).length}</p>
            <p className="text-sm text-gray-500">Stock faible</p>
          </div>
        </div>
      </div>
    </div>
  );
}
