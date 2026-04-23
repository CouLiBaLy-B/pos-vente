import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Store, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export default function Login() {
  const { login, isOnline } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(username, password);
    if (!success) {
      setError('Nom d\'utilisateur ou mot de passe incorrect');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-gray-900 to-amber-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-500/20 rounded-2xl mb-4 border-2 border-amber-500/30 shadow-lg shadow-amber-500/10">
            <Store className="w-12 h-12 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Coulibaly & Frères</h1>
          <p className="text-amber-300/80 mt-1 text-sm font-medium">Quincaillerie & Fournitures Générales</p>
          <p className="text-gray-400 text-sm mt-1">🇨🇮 Abidjan, Côte d'Ivoire</p>
          
          {/* Online/Offline indicator */}
          <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs ${
            isOnline ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Connecté à la base de données' : 'Mode hors ligne (local)'}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Connexion</h2>
            <p className="text-gray-400 text-sm mt-1">Entrez vos identifiants pour accéder au système</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nom d'utilisateur</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                  placeholder="Entrez votre identifiant"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition disabled:opacity-70 shadow-lg shadow-amber-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        {/* Default credentials hint */}
        <div className="mt-6 bg-white/5 rounded-xl border border-white/10 p-4">
          <p className="text-xs text-gray-400 text-center mb-3">Identifiants par défaut :</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-red-500/10 rounded-lg p-2">
              <p className="text-xs text-red-300 font-semibold">Admin</p>
              <p className="text-xs text-gray-500 mt-0.5">admin</p>
              <p className="text-xs text-gray-500">admin123</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-2">
              <p className="text-xs text-blue-300 font-semibold">Manager</p>
              <p className="text-xs text-gray-500 mt-0.5">manager</p>
              <p className="text-xs text-gray-500">manager123</p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-2">
              <p className="text-xs text-green-300 font-semibold">Caissier</p>
              <p className="text-xs text-gray-500 mt-0.5">caissier1</p>
              <p className="text-xs text-gray-500">caissier123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
