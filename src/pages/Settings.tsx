import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Save, Store, Plus, Trash2, X } from 'lucide-react';

export default function Settings() {
  const { settings, categories, updateSettings, addCategory, deleteCategory } = useStore();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: '📦', color: '#3B82F6' });

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddCategory = () => {
    if (newCat.name.trim()) {
      addCategory(newCat);
      setNewCat({ name: '', icon: '📦', color: '#3B82F6' });
      setShowCatForm(false);
    }
  };

  const emojis = ['🔧', '⚡', '🎨', '🔩', '🪚', '🌿', '📦', '🏗️', '🔩', '🛢️', '🧰', '⚙️', '🔨', '🪛', '🧱', '💧', '🔥', '💡', '🔌', '🚿'];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
        <p className="text-gray-500 text-sm">Configuration de votre magasin</p>
      </div>

      {/* Store Settings */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Informations du magasin</h2>
            <p className="text-sm text-gray-500">Détails de votre quincaillerie</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du magasin</label>
            <input
              type="text"
              value={form.storeName}
              onChange={e => setForm({ ...form, storeName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
            <select
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="FCFA">FCFA (Franc CFA)</option>
              <option value="FCFA-B">FCFA (BCEAO)</option>
              <option value="CDF">CDF (Franc congolais)</option>
              <option value="GNF">GNF (Franc guinéen)</option>
              <option value="MGA">MGA (Ariary malgache)</option>
              <option value="KES">KES (Shilling kenyan)</option>
              <option value="NGN">NGN (Naira nigérian)</option>
              <option value="GHS">GHS (Cedi ghanéen)</option>
              <option value="XOF">XOF (Franc CFA UEMOA)</option>
              <option value="XAF">XAF (Franc CFA CEMAC)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taux de taxe (%)</label>
            <input
              type="number"
              value={form.taxRate}
              onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
              className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du vendeur</label>
            <input
              type="text"
              value={form.sellerName}
              onChange={e => setForm({ ...form, sellerName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message sur le ticket</label>
            <input
              type="text"
              value={form.receiptFooter}
              onChange={e => setForm({ ...form, receiptFooter: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`mt-6 flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
            saved ? 'bg-green-500 text-white' : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          <Save className="w-5 h-5" />
          {saved ? 'Enregistré ✓' : 'Enregistrer les modifications'}
        </button>
      </div>

      {/* Categories Management */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Catégories de produits</h2>
            <p className="text-sm text-gray-500">{categories.length} catégories</p>
          </div>
          <button
            onClick={() => setShowCatForm(true)}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-medium text-gray-700">{cat.name}</span>
              </div>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Category Form Modal */}
      {showCatForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Nouvelle catégorie</h3>
              <button onClick={() => setShowCatForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={newCat.name}
                  onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Nom de la catégorie"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                <div className="flex flex-wrap gap-2">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setNewCat({ ...newCat, icon: emoji })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${
                        newCat.icon === emoji ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                <input
                  type="color"
                  value={newCat.color}
                  onChange={e => setNewCat({ ...newCat, color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button onClick={() => setShowCatForm(false)} className="flex-1 px-4 py-2.5 border rounded-xl text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={handleAddCategory} className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600">
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Gestion des données</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Réinitialiser les données</p>
              <p className="text-sm text-gray-500">Supprimer toutes les ventes et remettre le stock à zéro</p>
            </div>
            <button
              onClick={() => {
                if (confirm('⚠️ Êtes-vous sûr ? Toutes les données seront perdues !')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
            >
              Réinitialiser
            </button>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Conseil :</strong> Les données sont sauvegardées automatiquement dans le navigateur. 
              Pour une meilleure sécurité, envisagez d'exporter régulièrement vos données.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
