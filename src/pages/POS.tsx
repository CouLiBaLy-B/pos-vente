import { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Smartphone, Banknote, FileText, X, Printer, Check, AlertCircle } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

import type { Sale, Product } from '../types';

function ReceiptModal({ sale, onClose }: ReceiptModalProps) {
  const { settings } = useStore();
  if (!sale) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-6" id="receipt">
          <div className="text-center border-b border-dashed pb-4 mb-4">
            <h2 className="text-xl font-bold">{settings.storeName}</h2>
            <p className="text-sm text-gray-500">{settings.address}</p>
            <p className="text-sm text-gray-500">Tél: {settings.phone}</p>
          </div>

          <div className="text-sm space-y-1 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">N° Ticket:</span>
              <span className="font-mono">{sale.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span>{new Date(sale.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Heure:</span>
              <span>{new Date(sale.createdAt).toLocaleTimeString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vendeur:</span>
              <span>{sale.sellerName}</span>
            </div>
            {sale.customerName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Client:</span>
                <span>{sale.customerName}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed pt-3 mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left pb-2">Article</th>
                  <th className="text-center pb-2">Qté</th>
                  <th className="text-right pb-2">Prix</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.product.id} className="border-t border-gray-100">
                    <td className="py-2 text-xs">{item.product.name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{item.unitPrice.toLocaleString('fr-FR')}</td>
                    <td className="py-2 text-right font-medium">{item.total.toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-dashed pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sous-total</span>
              <span>{sale.subtotal.toLocaleString('fr-FR')} {settings.currency}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Remise</span>
                <span>-{sale.discount.toLocaleString('fr-FR')} {settings.currency}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Taxe</span>
                <span>{sale.tax.toLocaleString('fr-FR')} {settings.currency}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>TOTAL</span>
              <span>{sale.total.toLocaleString('fr-FR')} {settings.currency}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Payé</span>
              <span>{sale.paid.toLocaleString('fr-FR')} {settings.currency}</span>
            </div>
            {sale.change > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Monnaie rendue</span>
                <span>{sale.change.toLocaleString('fr-FR')} {settings.currency}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Mode de paiement</span>
              <span className="capitalize">
                {sale.paymentMethod === 'cash' ? 'Espèces' : sale.paymentMethod === 'mobile' ? 'Mobile Money' : sale.paymentMethod === 'credit' ? 'Crédit' : 'Chèque'}
              </span>
            </div>
          </div>

          <div className="text-center mt-4 pt-3 border-t border-dashed">
            <p className="text-sm text-gray-500">{settings.receiptFooter}</p>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <Check className="w-4 h-4" />
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
}

export default function POS() {
  const { products, categories, cart, settings, customers, addToCart, removeFromCart, updateCartItem, clearCart, completeSale, searchProducts } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F8') { e.preventDefault(); setShowPayment(true); }
      if (e.key === 'Escape') { setShowPayment(false); setEditingPrice(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filteredProducts = searchQuery
    ? searchProducts(searchQuery)
    : selectedCategory === 'all'
      ? products
      : products.filter(p => p.category === selectedCategory);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartTax = cartSubtotal * settings.taxRate / 100;
  const cartTotal = cartSubtotal + cartTax;
  const paid = parseFloat(paidAmount) || 0;
  const change = paid - cartTotal;

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    const existing = cart.find(item => item.product.id === product.id);
    if (existing && existing.quantity >= product.stock) return;
    addToCart(product);
  };

  const handleEditPrice = (productId: string, currentPrice: number) => {
    setEditingPrice(productId);
    setTempPrice(currentPrice.toString());
  };

  const handleSavePrice = (productId: string) => {
    const newPrice = parseFloat(tempPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      updateCartItem(productId, { unitPrice: newPrice });
    }
    setEditingPrice(null);
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    if (paymentMethod !== 'credit' && paid < cartTotal) return;
    const sale = completeSale(paymentMethod, paymentMethod === 'credit' ? cartTotal : paid, selectedCustomerId || undefined);
    setCompletedSale(sale);
    setShowPayment(false);
    setPaidAmount('');
    setSelectedCustomerId('');
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Rechercher un produit... (F2)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 flex-shrink-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === 'all' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            Tout
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-1 ${
                selectedCategory === cat.id ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
              const inCart = cart.find(item => item.product.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className={`relative bg-white rounded-xl p-3 text-left border transition-all hover:shadow-md ${
                    product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-400 cursor-pointer'
                  } ${inCart ? 'ring-2 ring-amber-400 border-amber-400' : 'border-gray-200'}`}
                >
                  {inCart && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold z-10">
                      {inCart.quantity}
                    </span>
                  )}
                  {/* Product Image */}
                  {product.image ? (
                    <div className="w-full h-20 mb-2 rounded-lg overflow-hidden bg-gray-100">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-20 mb-2 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-3xl">{categories.find(c => c.id === product.category)?.icon || '📦'}</span>
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{product.unit}</p>
                  <div className="mt-2">
                    <p className="text-lg font-bold text-amber-600">{product.sellingPrice.toLocaleString('fr-FR')}</p>
                    <p className="text-xs text-gray-400">min: {product.minPrice.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      product.stock <= 5 ? 'bg-red-100 text-red-600' : product.stock <= 10 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                    }`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search className="w-12 h-12 mb-3" />
              <p>Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-96 bg-white rounded-xl shadow-lg border flex flex-col flex-shrink-0">
        <div className="p-4 border-b bg-amber-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-gray-800">Panier</h2>
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-red-400 hover:text-red-600 transition p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-3 opacity-30" />
              <p className="text-sm">Panier vide</p>
              <p className="text-xs mt-1">Cliquez sur un produit pour l'ajouter</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {item.product.image && (
                      <div className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0">
                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                    {editingPrice === item.product.id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={e => setTempPrice(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSavePrice(item.product.id)}
                          className="w-24 text-sm px-2 py-1 border rounded focus:ring-1 focus:ring-amber-400 outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePrice(item.product.id)}
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditPrice(item.product.id, item.unitPrice)}
                        className="text-xs text-amber-600 hover:underline mt-0.5"
                        title="Cliquer pour modifier le prix"
                      >
                        {item.unitPrice.toLocaleString('fr-FR')} FCFA ✏️
                      </button>
                    )}
                    {item.unitPrice < item.product.minPrice && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-500">{'Prix < min ('}{item.product.minPrice.toLocaleString('fr-FR')}{')'}</span>
                      </div>
                    )}
                    </div>{/* end flex-1 min-w-0 inner */}
                  </div>{/* end flex items-start gap-2 wrapper */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => item.quantity > 1 ? updateCartItem(item.product.id, { quantity: item.quantity - 1 }) : removeFromCart(item.product.id)}
                      className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={e => {
                        const q = parseInt(e.target.value) || 1;
                        if (q >= 1 && q <= item.product.stock) {
                          updateCartItem(item.product.id, { quantity: q });
                        }
                      }}
                      className="w-12 text-center text-sm border rounded-md py-1 focus:ring-1 focus:ring-amber-400 outline-none"
                    />
                    <button
                      onClick={() => item.quantity < item.product.stock && updateCartItem(item.product.id, { quantity: item.quantity + 1 })}
                      className="w-7 h-7 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">Rem%</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={e => updateCartItem(item.product.id, { discount: parseFloat(e.target.value) || 0 })}
                        className="w-12 text-center text-xs border rounded-md py-1 focus:ring-1 focus:ring-amber-400 outline-none"
                      />
                    </div>
                    <p className="text-sm font-bold text-gray-800 min-w-[80px] text-right">
                      {item.total.toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Payment */}
        <div className="border-t p-4 space-y-3 bg-gray-50 rounded-b-xl">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{cartSubtotal.toLocaleString('fr-FR')} FCFA</span>
            </div>
            {settings.taxRate > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Taxe ({settings.taxRate}%)</span>
                <span>{cartTax.toLocaleString('fr-FR')} FCFA</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
              <span>Total</span>
              <span className="text-amber-600">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          <button
            onClick={() => cart.length > 0 && setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            <CreditCard className="w-5 h-5" />
            Encaisser (F8)
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Paiement</h2>
                <button onClick={() => setShowPayment(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 text-center bg-amber-50 rounded-lg py-3">
                <p className="text-sm text-gray-500">Total à payer</p>
                <p className="text-3xl font-bold text-amber-600">{cartTotal.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client (optionnel)</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
                >
                  <option value="">-- Client anonyme --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${
                      paymentMethod === 'cash'
                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="text-sm font-medium">Espèces</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('mobile')}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${
                      paymentMethod === 'mobile'
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-sm font-medium">Mobile Money</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('credit')}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${
                      paymentMethod === 'credit'
                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Crédit</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cheque')}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${
                      paymentMethod === 'cheque'
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm font-medium">Chèque</span>
                  </button>
                </div>
              </div>

              {/* Amount paid */}
              {paymentMethod !== 'credit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant reçu</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    placeholder="Entrez le montant..."
                    className="w-full border rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-amber-400 outline-none"
                    autoFocus
                  />
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[cartTotal, Math.ceil(cartTotal / 500) * 500, Math.ceil(cartTotal / 1000) * 1000, Math.ceil(cartTotal / 5000) * 5000].filter((v, i, a) => a.indexOf(v) === i && v >= cartTotal).map(amount => (
                      <button
                        key={amount}
                        onClick={() => setPaidAmount(amount.toString())}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
                      >
                        {amount.toLocaleString('fr-FR')}
                      </button>
                    ))}
                    <button
                      onClick={() => setPaidAmount(cartTotal.toString())}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm font-medium transition"
                    >
                      Montant exact
                    </button>
                  </div>
                  {paid >= cartTotal && (
                    <div className="mt-2 bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-green-600">Monnaie à rendre</p>
                      <p className="text-2xl font-bold text-green-700">{change.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'credit' && selectedCustomerId === '' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <p className="text-sm text-amber-700">Sélectionnez un client pour le paiement à crédit</p>
                </div>
              )}

              <button
                onClick={handleCompleteSale}
                disabled={
                  cart.length === 0 ||
                  (paymentMethod !== 'credit' && paid < cartTotal) ||
                  (paymentMethod === 'credit' && !selectedCustomerId)
                }
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {paymentMethod === 'credit' ? 'Enregistrer la vente à crédit' : 'Valider le paiement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
    </div>
  );
}
