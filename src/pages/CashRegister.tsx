import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Wallet, Lock, Unlock, Clock } from 'lucide-react';

export default function CashRegister() {
  const { activeRegister, registerSessions, expenses, openRegister, closeRegister, sales } = useStore();
  const [openAmount, setOpenAmount] = useState('');
  const [closeAmount, setCloseAmount] = useState('');
  const [closeNote, setCloseNote] = useState('');
  const [openNote, setOpenNote] = useState('');
  const [showClose, setShowClose] = useState(false);

  const isOpen = activeRegister?.status === 'open';
  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(e => e.date.split('T')[0] === today).reduce((s, e) => s + e.amount, 0);
  const todaySales = sales.filter(s => s.createdAt.split('T')[0] === today);
  const cashSales = todaySales.filter(s => s.paymentMethod === 'cash').reduce((s, x) => s + x.total, 0);

  const expectedBalance = activeRegister ? activeRegister.openingBalance + cashSales - todayExpenses : 0;
  const closingBal = parseFloat(closeAmount) || 0;
  const difference = closingBal - expectedBalance;

  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion de Caisse</h1>
          <p className="text-gray-500 text-sm">Ouverture, fermeture et rapprochement</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
          isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isOpen ? <><Unlock className="w-4 h-4" /> Caisse ouverte</> : <><Lock className="w-4 h-4" /> Caisse fermée</>}
        </div>
      </div>

      {/* Open Register */}
      {!isOpen && !showClose && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Ouvrir la caisse</h2>
              <p className="text-sm text-gray-500">Entrez le montant initial dans la caisse</p>
            </div>
          </div>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fond de caisse (FCFA) *</label>
              <input type="number" value={openAmount} onChange={e => setOpenAmount(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 text-xl font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="0" />
              <div className="flex gap-2 mt-2">
                {[5000, 10000, 25000, 50000, 100000].map(a => (
                  <button key={a} onClick={() => setOpenAmount(a.toString())}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
                    {a.toLocaleString('fr-FR')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optionnel)</label>
              <input type="text" value={openNote} onChange={e => setOpenNote(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="Ex: Caisse du matin" />
            </div>
            <button onClick={() => { openRegister(parseFloat(openAmount) || 0, openNote || undefined); setOpenAmount(''); setOpenNote(''); }}
              disabled={!openAmount}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <Unlock className="w-5 h-5" /> Ouvrir la caisse
            </button>
          </div>
        </div>
      )}

      {/* Active Register Summary */}
      {isOpen && activeRegister && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Session ouverte par {activeRegister.openerName}</span>
              </div>
              <span className="text-xs text-green-600">{new Date(activeRegister.openedAt).toLocaleString('fr-FR')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Fond de caisse</p>
                <p className="text-lg font-bold text-gray-800">{fmt(activeRegister.openingBalance)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Ventes</p>
                <p className="text-lg font-bold text-green-600">{activeRegister.salesCount}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Total ventes</p>
                <p className="text-lg font-bold text-blue-600">{fmt(activeRegister.salesTotal)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Dépenses</p>
                <p className="text-lg font-bold text-red-600">{fmt(todayExpenses)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Répartition des paiements</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-green-50 rounded-lg"><span className="text-sm">Espèces</span><span className="font-bold text-sm">{fmt(activeRegister.cashPayments)}</span></div>
                <div className="flex justify-between p-2 bg-blue-50 rounded-lg"><span className="text-sm">Mobile Money</span><span className="font-bold text-sm">{fmt(activeRegister.mobilePayments)}</span></div>
                <div className="flex justify-between p-2 bg-purple-50 rounded-lg"><span className="text-sm">Autres</span><span className="font-bold text-sm">{fmt(activeRegister.otherPayments)}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between">
                <span className="font-semibold">Solde attendu</span>
                <span className="font-bold text-amber-600">{fmt(expectedBalance)}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Fermer la caisse</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant compté en caisse</label>
                  <input type="number" value={closeAmount} onChange={e => setCloseAmount(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 text-lg font-bold focus:ring-2 focus:ring-amber-400 outline-none" placeholder="0" />
                </div>
                {closeAmount && (
                  <div className={`p-3 rounded-lg ${Math.abs(difference) < 1 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{difference >= 0 ? 'Excédent' : 'Déficit'}</span>
                      <span className={`text-lg font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(Math.abs(difference))}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Note</label>
                  <input type="text" value={closeNote} onChange={e => setCloseNote(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none" placeholder="Observations..." />
                </div>
                <button onClick={() => { closeRegister(closingBal, closeNote || undefined); setCloseAmount(''); setCloseNote(''); setShowClose(false); }}
                  disabled={!closeAmount}
                  className="w-full bg-red-500 text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Fermer la caisse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-400" /> Historique des sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ouvert par</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ouverture</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Fond</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ventes</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Attendu</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Compté</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Écart</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...registerSessions].reverse().map(session => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{session.openerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(session.openedAt).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-right text-sm">{fmt(session.openingBalance)}</td>
                  <td className="px-4 py-3 text-right text-sm">{session.salesCount} ({fmt(session.salesTotal)})</td>
                  <td className="px-4 py-3 text-right text-sm">{session.expectedBalance ? fmt(session.expectedBalance) : '—'}</td>
                  <td className="px-4 py-3 text-right text-sm">{session.closingBalance ? fmt(session.closingBalance) : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {session.difference !== undefined ? (
                      <span className={`text-sm font-bold ${Math.abs(session.difference) < 1 ? 'text-green-600' : 'text-red-600'}`}>
                        {session.difference >= 0 ? '+' : ''}{fmt(session.difference)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${session.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {session.status === 'open' ? 'Ouverte' : 'Fermée'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {registerSessions.length === 0 && <p className="text-center text-gray-400 py-8">Aucune session enregistrée</p>}
      </div>
    </div>
  );
}
