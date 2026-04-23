import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Search, Trash2, X, Receipt, TrendingDown, Calendar, Filter } from 'lucide-react';

export default function Expenses() {
  const { expenses, expenseCategories, addExpense, deleteExpense, exportCSV } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'Autres', description: '', amount: '', paidBy: '', receiptNumber: '' });

  const filtered = expenses.filter(e => {
    const ms = e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === 'all' || e.category === catFilter;
    return ms && mc;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(e => e.date === today);
  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const monthTotal = expenses.filter(e => { const d = new Date(e.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).reduce((s, e) => s + e.amount, 0);
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({ date: form.date, category: form.category, description: form.description, amount: parseFloat(form.amount) || 0, paidBy: form.paidBy, receiptNumber: form.receiptNumber || undefined });
    setForm({ date: new Date().toISOString().split('T')[0], category: 'Autres', description: '', amount: '', paidBy: '', receiptNumber: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des dépenses</h1>
          <p className="text-gray-500 text-sm">{expenses.length} dépenses enregistrées</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(filtered.map(e => ({ Date: e.date, Catégorie: e.category, Description: e.description, Montant: e.amount, 'Payé par': e.paidBy, 'N° Reçu': e.receiptNumber || '' })), 'depenses')}
            className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">
            <Receipt className="w-4 h-4" /> Exporter CSV
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition shadow-md">
            <Plus className="w-4 h-4" /> Nouvelle dépense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><TrendingDown className="w-5 h-5 text-red-600" /></div><div><p className="text-sm text-gray-500">Aujourd'hui</p><p className="text-lg font-bold text-gray-800">{fmt(todayTotal)}</p></div></div></div>
        <div className="bg-white rounded-xl shadow-sm p-4 border"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-amber-600" /></div><div><p className="text-sm text-gray-500">Ce mois</p><p className="text-lg font-bold text-gray-800">{fmt(monthTotal)}</p></div></div></div>
        <div className="bg-white rounded-xl shadow-sm p-4 border"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><TrendingDown className="w-5 h-5 text-gray-600" /></div><div><p className="text-sm text-gray-500">Total</p><p className="text-lg font-bold text-gray-800">{fmt(total)}</p></div></div></div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl shadow-sm focus:ring-2 focus:ring-amber-400 outline-none" /></div>
        <div className="flex items-center gap-2"><Filter className="w-5 h-5 text-gray-400" /><select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-white border rounded-xl px-3 py-2.5 shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"><option value="all">Toutes catégories</option>{expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Catégorie</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payé par</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(exp => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{new Date(exp.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{exp.category}</span></td>
                  <td className="px-4 py-3 text-sm">{exp.description}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{fmt(exp.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{exp.paidBy}</td>
                  <td className="px-4 py-3 text-center"><button onClick={() => deleteExpense(exp.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center py-12 text-gray-400">Aucune dépense trouvée</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-bold">Nouvelle dépense</h2><button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label><select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none">{expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label><input type="text" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none" placeholder="Ex: Facture électrique" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label><input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none" placeholder="0" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Payé par *</label><input type="text" required value={form.paidBy} onChange={e => setForm({ ...form, paidBy: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none" placeholder="Ex: Amadou" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">N° Reçu</label><input type="text" value={form.receiptNumber} onChange={e => setForm({ ...form, receiptNumber: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none" placeholder="Optionnel" /></div>
              <div className="flex gap-3 pt-4 border-t"><button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border rounded-xl text-gray-600 hover:bg-gray-50">Annuler</button><button type="submit" className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium">Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
