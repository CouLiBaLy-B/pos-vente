import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Edit3, Trash2, X, User, Phone, MapPin } from 'lucide-react';
import type { Customer } from '../types';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, sales } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '', balance: '0' });

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const totalCredit = customers.reduce((sum, c) => sum + c.balance, 0);

  const resetForm = () => {
    setForm({ name: '', phone: '', address: '', email: '', balance: '0' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (customer: Customer) => {
    setForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
      email: customer.email || '',
      balance: customer.balance.toString(),
    });
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      phone: form.phone,
      address: form.address || undefined,
      email: form.email || undefined,
      balance: parseFloat(form.balance) || 0,
    };
    if (editingId) {
      updateCustomer(editingId, data);
    } else {
      addCustomer(data);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    setDeleteConfirm(null);
  };

  const getCustomerPurchases = (customerId: string) =>
    sales.filter(s => s.customerId === customerId).reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des clients</h1>
          <p className="text-gray-500 text-sm">{customers.length} clients • Crédits totaux: {totalCredit.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl hover:bg-amber-600 transition shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(customer => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Phone className="w-3 h-3" />
                    {customer.phone}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(customer)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(customer.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {customer.address && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                <MapPin className="w-3 h-3" />
                {customer.address}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Achats</p>
                <p className="text-sm font-bold text-green-600">{getCustomerPurchases(customer.id).toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className={`rounded-lg p-2 text-center ${customer.balance > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <p className="text-xs text-gray-500">Solde dû</p>
                <p className={`text-sm font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {customer.balance.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 mt-2">Client depuis {new Date(customer.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <User className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p>Aucun client trouvé</p>
          <p className="text-sm mt-1">Ajoutez votre premier client</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Nom du client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Adresse"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="email@exemple.com"
                />
              </div>
              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solde dû (FCFA)</label>
                  <input
                    type="number"
                    value={form.balance}
                    onChange={e => setForm({ ...form, balance: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 border rounded-xl text-gray-600 hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition font-medium">
                  {editingId ? 'Mettre à jour' : 'Ajouter le client'}
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
            <p className="text-gray-500 text-sm mb-6">Êtes-vous sûr de vouloir supprimer ce client ?</p>
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
