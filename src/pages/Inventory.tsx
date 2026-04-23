import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Edit3, Trash2, X, Package, Filter } from 'lucide-react';
import type { Product } from '../types';
import ImageUpload from '../components/ImageUpload';

export default function Inventory() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', category: '1', purchasePrice: '', sellingPrice: '', minPrice: '', stock: '', unit: 'pièce', description: '', barcode: '', image: '',
  });

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalValue = products.reduce((sum, p) => sum + p.purchasePrice * p.stock, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  const resetForm = () => {
    setForm({ name: '', category: '1', purchasePrice: '', sellingPrice: '', minPrice: '', stock: '', unit: 'pièce', description: '', barcode: '', image: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      category: product.category,
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      minPrice: product.minPrice.toString(),
      stock: product.stock.toString(),
      unit: product.unit,
      description: product.description || '',
      barcode: product.barcode || '',
      image: product.image || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      category: form.category,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      minPrice: parseFloat(form.minPrice) || 0,
      stock: parseInt(form.stock) || 0,
      unit: form.unit,
      description: form.description || undefined,
      barcode: form.barcode || undefined,
      image: form.image || undefined,
    };
    if (editingId) {
      updateProduct(editingId, data);
    } else {
      addProduct(data);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion du Stock</h1>
          <p className="text-gray-500 text-sm">{products.length} produits • {totalStock} unités en stock • Valeur: {totalValue.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl hover:bg-amber-600 transition shadow-md"
        >
          <Plus className="w-5 h-5" />
          Ajouter un produit
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="bg-white border rounded-xl px-3 py-2.5 shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
          >
            <option value="all">Toutes catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Catégorie</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Prix achat</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Prix vente</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Prix min</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Marge</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(product => {
                const cat = categories.find(c => c.id === product.category);
                const margin = ((product.sellingPrice - product.purchasePrice) / product.sellingPrice * 100).toFixed(1);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.unit} {product.barcode && `• ${product.barcode}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{cat?.icon} {cat?.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{product.purchasePrice.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-amber-600">{product.sellingPrice.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-sm text-red-500">{product.minPrice.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                        product.stock <= 5 ? 'bg-red-100 text-red-700' :
                        product.stock <= 10 ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">{margin}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun produit trouvé</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div className="flex items-start gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo du produit</label>
                  <ImageUpload
                    value={form.image || undefined}
                    onChange={(base64) => setForm({ ...form, image: base64 })}
                    onRemove={() => setForm({ ...form, image: '' })}
                    size="lg"
                  />
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG (max 5 Mo)</p>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="Ex: Marteau 500g"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  >
                    {['pièce', 'kg', 'mètre', 'litre', 'boîte', 'sac', 'bidon', 'lot', 'rouleau', 'paquet'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={form.purchasePrice}
                    onChange={e => setForm({ ...form, purchasePrice: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix de vente (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={form.sellingPrice}
                    onChange={e => setForm({ ...form, sellingPrice: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix minimum (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={form.minPrice}
                    onChange={e => setForm({ ...form, minPrice: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Prix en dessous duquel on ne vend pas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial *</label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code-barres</label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={e => setForm({ ...form, barcode: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="Optionnel"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                    rows={2}
                    placeholder="Description optionnelle"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 border rounded-xl text-gray-600 hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition font-medium">
                  {editingId ? 'Mettre à jour' : 'Ajouter le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmer la suppression</h3>
            <p className="text-gray-500 text-sm mb-6">Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border rounded-xl text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
