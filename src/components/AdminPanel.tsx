import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, X, DollarSign, Edit3, Plus, Trash2, Check, AlertCircle, Globe, Languages } from 'lucide-react';
import { RoutePrice, getPrices, savePrices, resetPrices, updateRoute, deleteRoute, addRoute, initializeDefaultData } from '../utils/firebaseStorage';
import { Language } from '../utils/types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [prices, setPrices] = useState<RoutePrice[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<RoutePrice | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('sr');
  const [newRoute, setNewRoute] = useState({
    id: '',
    price: '',
    icon: '🚗',
    priceDescription: 'po vozilu (do 3 osobe + 1500 po osobi)',
    names: {
      sr: '',
      en: '',
      ru: ''
    },
    whatsappMessages: {
      sr: '',
      en: '',
      ru: ''
    }
  });

  // Complex password: Tr@nsf3rk0_2024!
  const ADMIN_PASSWORD = 'Tr@nsf3rk0_2024!';

  const languages = [
    { code: 'sr' as Language, name: 'Srpski', flag: '🇷🇸' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' }
  ];

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadPrices();
    }
  }, [isOpen, isAuthenticated]);

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadPrices = async () => {
    setLoading(true);
    try {
      await initializeDefaultData();
      const loadedPrices = await getPrices();
      setPrices(loadedPrices);
    } catch (error) {
      showNotification('error', 'Greška pri učitavanju cena iz baze!');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      showNotification('success', 'Uspešno ste se prijavili!');
    } else {
      setLoginError('Neispravni podaci za prijavu');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const success = await savePrices(prices);
    if (success) {
      window.dispatchEvent(new Event('pricesUpdated'));
      showNotification('success', 'Cene su uspešno sačuvane u Firebase bazu!');
    } else {
      showNotification('error', 'Greška pri čuvanju cena u bazu!');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (confirm('Da li ste sigurni da želite da resetujete sve cene na početne vrednosti?')) {
      setLoading(true);
      const success = await resetPrices();
      if (success) {
        await loadPrices();
        window.dispatchEvent(new Event('pricesUpdated'));
        showNotification('success', 'Cene su resetovane na početne vrednosti!');
      } else {
        showNotification('error', 'Greška pri resetovanju cena!');
      }
      setLoading(false);
    }
  };

  const startEditing = (route: RoutePrice) => {
    setEditingId(route.id);
    setEditingData({ ...route });
  };

  const saveEdit = async () => {
    if (editingId && editingData) {
      setLoading(true);
      const success = await updateRoute(editingId, editingData);
      if (success) {
        await loadPrices();
        setEditingId(null);
        setEditingData(null);
        window.dispatchEvent(new Event('pricesUpdated'));
        showNotification('success', 'Transfer je uspešno ažuriran u bazi!');
      } else {
        showNotification('error', 'Greška pri ažuriranju transfera!');
      }
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleAddRoute = async () => {
    if (newRoute.id && newRoute.price && newRoute.names.sr) {
      // Check if ID already exists
      if (prices.some(p => p.id === newRoute.id)) {
        showNotification('error', 'Transfer sa ovim ID već postoji!');
        return;
      }

      setLoading(true);
      const success = await addRoute(newRoute as RoutePrice);
      if (success) {
        await loadPrices();
        
        // Reset form
        setNewRoute({
          id: '',
          price: '',
          icon: '🚗',
          priceDescription: 'po vozilu (do 3 osobe + 1500 po osobi)',
          names: {
            sr: '',
            en: '',
            ru: ''
          },
          whatsappMessages: {
            sr: '',
            en: '',
            ru: ''
          }
        });
        setShowAddForm(false);
        
        window.dispatchEvent(new Event('pricesUpdated'));
        showNotification('success', 'Novi transfer je uspešno dodat u bazu!');
      } else {
        showNotification('error', 'Greška pri dodavanju novog transfera!');
      }
      setLoading(false);
    } else {
      showNotification('error', 'Molimo unesite sve obavezne podatke (ID, cena, naziv na srpskom)');
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj transfer iz baze?')) {
      setLoading(true);
      const success = await deleteRoute(routeId);
      if (success) {
        await loadPrices();
        window.dispatchEvent(new Event('pricesUpdated'));
        showNotification('success', 'Transfer je uspešno obrisan iz baze!');
      } else {
        showNotification('error', 'Greška pri brisanju transfera!');
      }
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-60 p-4 rounded-xl shadow-lg flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {notification.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-lime-500" />
            <h2 className="text-2xl font-bold text-slate-800">Admin Panel - Firebase Upravljanje</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-8">
            <form onSubmit={handleLogin} className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Prijavite se za Firebase pristup</h3>
              
              {loginError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {loginError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Korisničko ime
                  </label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Lozinka
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-lime-400 text-slate-800 py-3 px-6 rounded-xl font-bold hover:bg-lime-300 transition-colors"
                >
                  Prijavite se
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-slate-800">Firebase Upravljanje Cenama</h3>
                {loading && (
                  <div className="flex items-center gap-2 text-lime-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lime-600"></div>
                    <span className="text-sm font-medium">Sinhronizacija...</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-slate-800 text-lime-400 px-4 py-2 rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                  Dodaj Transfer
                </button>
                <button
                  onClick={handleSave}
                  className="bg-lime-400 text-slate-800 px-4 py-2 rounded-xl font-bold hover:bg-lime-300 transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  <Save className="h-4 w-4" />
                  Sačuvaj u Firebase
                </button>
                <button
                  onClick={handleReset}
                  className="bg-slate-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  <RotateCcw className="h-4 w-4" />
                  Resetuj
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="mb-6 bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Languages className="h-5 w-5 text-slate-600" />
                <span className="font-bold text-slate-800">Izaberite jezik za pregled:</span>
              </div>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                      selectedLanguage === lang.code
                        ? 'bg-lime-400 text-slate-800'
                        : 'bg-white text-slate-600 hover:bg-lime-100'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add New Route Form */}
            {showAddForm && (
              <div className="bg-lime-50 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Dodaj Novi Transfer (Svi jezici)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ID (jedinstveni identifikator) *
                    </label>
                    <input
                      type="text"
                      value={newRoute.id}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                      placeholder="npr. novi-sad-pariz"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cena (RSD) *
                    </label>
                    <input
                      type="text"
                      value={newRoute.price}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                      placeholder="npr. 45.000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ikona
                    </label>
                    <input
                      type="text"
                      value={newRoute.icon}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                      placeholder="🚗"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Opis cene
                    </label>
                    <input
                      type="text"
                      value={newRoute.priceDescription}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, priceDescription: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                      placeholder="po vozilu (do 3 osobe + 1500 po osobi)"
                    />
                  </div>
                </div>

                {/* Multi-language names */}
                <div className="mb-6">
                  <h5 className="font-bold text-slate-800 mb-3">Nazivi transfera:</h5>
                  <div className="grid grid-cols-1 gap-4">
                    {languages.map((lang) => (
                      <div key={lang.code}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {lang.flag} {lang.name} {lang.code === 'sr' && '*'}
                        </label>
                        <input
                          type="text"
                          value={newRoute.names[lang.code]}
                          onChange={(e) => setNewRoute(prev => ({
                            ...prev,
                            names: { ...prev.names, [lang.code]: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                          placeholder={
                            lang.code === 'sr' ? 'Novi Sad ⇄ Pariz Aerodrom' :
                            lang.code === 'en' ? 'Novi Sad ⇄ Paris Airport' :
                            'Нови Сад ⇄ Аэропорт Париж'
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multi-language WhatsApp messages */}
                <div className="mb-6">
                  <h5 className="font-bold text-slate-800 mb-3">WhatsApp poruke:</h5>
                  <div className="grid grid-cols-1 gap-4">
                    {languages.map((lang) => (
                      <div key={lang.code}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {lang.flag} {lang.name}
                        </label>
                        <textarea
                          value={newRoute.whatsappMessages[lang.code]}
                          onChange={(e) => setNewRoute(prev => ({
                            ...prev,
                            whatsappMessages: { ...prev.whatsappMessages, [lang.code]: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                          rows={2}
                          placeholder={
                            lang.code === 'sr' ? 'Zdravo! Zainteresovan/a sam za transfer...' :
                            lang.code === 'en' ? 'Hello! I am interested in transfer...' :
                            'Здравствуйте! Меня интересует трансфер...'
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAddRoute}
                    className="bg-lime-400 text-slate-800 px-4 py-2 rounded-lg font-bold hover:bg-lime-300 transition-colors"
                    disabled={loading}
                  >
                    Dodaj Transfer
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Otkaži
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prices.map((route) => (
                <div key={route.id} className="bg-slate-50 rounded-2xl p-6 relative">
                  <button
                    onClick={() => handleDeleteRoute(route.id)}
                    className="absolute top-3 right-3 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    title="Obriši transfer"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{route.icon}</span>
                    <h4 className="font-bold text-slate-800 text-sm pr-8">
                      {route.names[selectedLanguage] || route.id}
                    </h4>
                  </div>
                  
                  {editingId === route.id && editingData ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">ID</label>
                        <input
                          type="text"
                          value={editingData.id}
                          onChange={(e) => setEditingData(prev => prev ? { ...prev, id: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Cena</label>
                        <input
                          type="text"
                          value={editingData.price}
                          onChange={(e) => setEditingData(prev => prev ? { ...prev, price: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Ikona</label>
                        <input
                          type="text"
                          value={editingData.icon}
                          onChange={(e) => setEditingData(prev => prev ? { ...prev, icon: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Naziv ({selectedLanguage})</label>
                        <input
                          type="text"
                          value={editingData.names[selectedLanguage]}
                          onChange={(e) => setEditingData(prev => prev ? { 
                            ...prev, 
                            names: { ...prev.names, [selectedLanguage]: e.target.value }
                          } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="bg-lime-400 text-slate-800 px-3 py-2 rounded-lg hover:bg-lime-300 transition-colors text-sm font-bold"
                          disabled={loading}
                        >
                          Sačuvaj
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 text-white px-3 py-2 rounded-lg hover:bg-gray-500 transition-colors text-sm"
                        >
                          Otkaži
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-slate-600 mr-1" />
                          <span className="text-2xl font-bold text-slate-800">{route.price}</span>
                          <span className="text-slate-600 font-medium ml-2">RSD</span>
                        </div>
                        <button
                          onClick={() => startEditing(route)}
                          className="bg-slate-800 text-lime-400 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                          disabled={loading}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-600 font-medium mb-2">
                        ID: {route.id}
                      </div>
                      <div className="text-xs text-slate-600 font-medium mb-2">
                        {route.priceDescription || 'po vozilu (do 3 osobe + 1500 po osobi)'}
                      </div>
                      <div className="text-xs text-slate-500 italic">
                        WhatsApp: {route.whatsappMessages[selectedLanguage]?.substring(0, 50)}...
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-lime-50 rounded-xl">
              <h4 className="font-bold text-slate-800 mb-2">Firebase Napomene:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Svi podaci se čuvaju u Firebase Realtime Database</li>
                <li>• Izmene su globalne i vidljive svim korisnicima odmah</li>
                <li>• Podržani su svi jezici (srpski, engleski, ruski)</li>
                <li>• Možete editovati nazive za svaki jezik posebno</li>
                <li>• WhatsApp poruke se automatski generišu na odgovarajućem jeziku</li>
                <li>• Backup se čuva i lokalno u browseru</li>
                <li>• Kliknite "Sačuvaj u Firebase" da primenite sve izmene</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;