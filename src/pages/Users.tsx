import { useState } from 'react';
import { useStore, ROLE_LABELS, ROLE_COLORS, ROLE_PERMISSIONS } from '../context/StoreContext';
import { Plus, Search, Edit3, Trash2, X, User as UserIcon, Shield, ShieldCheck, ShieldAlert, Clock, Power, PowerOff } from 'lucide-react';
import type { UserRole, User } from '../types';

export default function Users() {
  const { users, currentUser, addUser, updateUser, deleteUser, sales } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: '', name: '', role: 'cashier' as UserRole, password: '', phone: '', active: true,
  });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ username: '', name: '', role: 'cashier', password: '', phone: '', active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (user: User) => {
    setForm({
      username: user.username,
      name: user.name,
      role: user.role,
      password: '',
      phone: user.phone || '',
      active: user.active,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updates: Partial<User> = {
        username: form.username,
        name: form.name,
        role: form.role,
        active: form.active,
        phone: form.phone || undefined,
      };
      if (form.password.trim()) {
        updates.password = form.password;
      }
      updateUser(editingId, updates);
    } else {
      addUser({
        username: form.username,
        name: form.name,
        role: form.role,
        password: form.password,
        phone: form.phone || undefined,
        active: form.active,
      });
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteUser(id);
    setDeleteConfirm(null);
  };

  const toggleActive = (user: User) => {
    updateUser(user.id, { active: !user.active });
  };

  const getUserSalesCount = (userId: string) =>
    sales.filter(s => s.sellerId === userId).length;

  const getUserSalesRevenue = (userId: string) =>
    sales.filter(s => s.sellerId === userId).reduce((sum, s) => sum + s.total, 0);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'manager': return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case 'cashier': return <Shield className="w-5 h-5 text-green-500" />;
    }
  };

  const getPermissionLabel = (perm: string) => {
    const labels: Record<string, string> = {
      dashboard: 'Tableau de bord',
      pos: 'Caisse (ventes)',
      inventory: 'Stock',
      sales: 'Historique',
      customers: 'Clients',
      reports: 'Rapports',
      settings: 'Paramètres',
      users: 'Utilisateurs',
    };
    return labels[perm] || perm;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <p className="text-gray-500 text-sm">{users.length} utilisateurs • {users.filter(u => u.active).length} actifs</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl hover:bg-amber-600 transition shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Roles explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Administrateur</h3>
              <p className="text-xs text-gray-400">Accès complet</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {ROLE_PERMISSIONS.admin.map(p => (
              <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getPermissionLabel(p)}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Manager</h3>
              <p className="text-xs text-gray-400">Gestion avancée</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {ROLE_PERMISSIONS.manager.map(p => (
              <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getPermissionLabel(p)}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Caissier</h3>
              <p className="text-xs text-gray-400">Ventes uniquement</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {ROLE_PERMISSIONS.cashier.map(p => (
              <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getPermissionLabel(p)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl shadow-sm focus:ring-2 focus:ring-amber-400 outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Identifiant</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ventes</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">CA</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Dernière connexion</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 transition ${!user.active ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-red-100' : user.role === 'manager' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <UserIcon className={`w-5 h-5 ${
                          user.role === 'admin' ? 'text-red-600' : user.role === 'manager' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Vous</span>
                          )}
                        </p>
                        {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 font-mono">{user.username}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
                      {getRoleIcon(user.role)} {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(user)}
                      disabled={user.id === currentUser?.id}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition ${
                        user.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      } ${user.id === currentUser?.id ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      {user.active ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                      {user.active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-600">{getUserSalesCount(user.id)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-gray-800">{getUserSalesRevenue(user.id).toLocaleString('fr-FR')} FCFA</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.lastLogin ? (
                      <div>
                        <p className="text-xs text-gray-600">{new Date(user.lastLogin).toLocaleDateString('fr-FR')}</p>
                        <p className="text-xs text-gray-400">{new Date(user.lastLogin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Jamais</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(user)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        disabled={user.id === currentUser?.id}
                        className={`p-2 text-red-500 hover:bg-red-50 rounded-lg transition ${user.id === currentUser?.id ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Activity log */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          Dernières connexions
        </h3>
        <div className="space-y-2">
          {users
            .filter(u => u.lastLogin)
            .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
            .slice(0, 5)
            .map(user => (
              <div key={user.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    user.role === 'admin' ? 'bg-red-100' : user.role === 'manager' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <UserIcon className={`w-4 h-4 ${
                      user.role === 'admin' ? 'text-red-600' : user.role === 'manager' ? 'text-blue-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400">{ROLE_LABELS[user.role]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{new Date(user.lastLogin!).toLocaleDateString('fr-FR')}</p>
                  <p className="text-xs text-gray-400">{new Date(user.lastLogin!).toLocaleTimeString('fr-FR')}</p>
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
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
                  placeholder="Ex: Jean Kamga"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur *</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="Ex: jkamga"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe {editingId ? '(laisser vide pour ne pas changer)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder={editingId ? '••••••••' : 'Minimum 6 caractères'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'manager', 'cashier'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setForm({ ...form, role })}
                      className={`p-3 rounded-lg border-2 text-center transition ${
                        form.role === role
                          ? role === 'admin'
                            ? 'border-red-500 bg-red-50'
                            : role === 'manager'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        {role === 'admin' ? <ShieldAlert className="w-5 h-5 text-red-500" /> :
                         role === 'manager' ? <ShieldCheck className="w-5 h-5 text-blue-500" /> :
                         <Shield className="w-5 h-5 text-green-500" />}
                      </div>
                      <p className="text-xs font-medium">{ROLE_LABELS[role]}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none"
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
              {editingId && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={e => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">Utilisateur actif</label>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 border rounded-xl text-gray-600 hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition font-medium">
                  {editingId ? 'Mettre à jour' : 'Créer l\'utilisateur'}
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
            <p className="text-gray-500 text-sm mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Ses ventes enregistrées seront conservées.
            </p>
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
