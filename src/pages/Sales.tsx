import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Calendar, Filter, Eye, X, Receipt, TrendingUp, ShoppingCart } from 'lucide-react';
import type { Sale } from '../types';

export default function Sales() {
  const { sales } = useStore();
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filtered = sales
    .filter(s => {
      const matchSearch = s.id.toLowerCase().includes(search.toLowerCase()) || s.customerName?.toLowerCase().includes(search.toLowerCase());
      const saleDate = s.createdAt.split('T')[0];
      const matchFrom = !dateFrom || saleDate >= dateFrom;
      const matchTo = !dateTo || saleDate <= dateTo;
      const matchMethod = methodFilter === 'all' || s.paymentMethod === methodFilter;
      return matchSearch && matchFrom && matchTo && matchMethod;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);
  const totalItems = filtered.reduce((sum, s) => sum + s.items.length, 0);
  const avgBasket = filtered.length > 0 ? totalRevenue / filtered.length : 0;

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
          <h1 className="text-2xl font-bold text-gray-800">Historique des ventes</h1>
          <p className="text-gray-500 text-sm">{sales.length} ventes enregistrées</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenu total</p>
              <p className="text-lg font-bold text-gray-800">{totalRevenue.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Articles vendus</p>
              <p className="text-lg font-bold text-gray-800">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Panier moyen</p>
              <p className="text-lg font-bold text-gray-800">{avgBasket.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par N° ou client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="bg-white border rounded-xl px-3 py-2.5 shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
          />
          <span className="text-gray-400">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="bg-white border rounded-xl px-3 py-2.5 shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="bg-white border rounded-xl px-3 py-2.5 shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
          >
            <option value="all">Tous les paiements</option>
            <option value="cash">Espèces</option>
            <option value="mobile">Mobile Money</option>
            <option value="credit">Crédit</option>
            <option value="cheque">Chèque</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Vente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date & Heure</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Articles</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paiement</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-medium text-blue-600">{sale.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{new Date(sale.createdAt).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleTimeString('fr-FR')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{sale.customerName || 'Anonyme'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-600">{sale.items.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      sale.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                      sale.paymentMethod === 'mobile' ? 'bg-blue-100 text-blue-700' :
                      sale.paymentMethod === 'credit' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {getMethodLabel(sale.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-gray-800">{sale.total.toLocaleString('fr-FR')} FCFA</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucune vente trouvée</p>
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Détail de la vente</h2>
              <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-400">N° Vente</p>
                  <p className="font-medium">{selectedSale.id}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="font-medium">{new Date(selectedSale.createdAt).toLocaleDateString('fr-FR')} {new Date(selectedSale.createdAt).toLocaleTimeString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-gray-400">Client</p>
                  <p className="font-medium">{selectedSale.customerName || 'Anonyme'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Paiement</p>
                  <p className="font-medium">{getMethodLabel(selectedSale.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Vendeur</p>
                  <p className="font-medium">{selectedSale.sellerName}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Articles</h3>
                <div className="space-y-2">
                  {selectedSale.items.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} × {item.unitPrice.toLocaleString('fr-FR')} FCFA
                          {item.discount > 0 && ` (-${item.discount}%)`}
                        </p>
                      </div>
                      <p className="text-sm font-bold">{item.total.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t mt-4 pt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span>{selectedSale.subtotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {selectedSale.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Taxe</span>
                    <span>{selectedSale.tax.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-amber-600">{selectedSale.total.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payé</span>
                  <span className="text-green-600">{selectedSale.paid.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {selectedSale.change > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monnaie rendue</span>
                    <span>{selectedSale.change.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
