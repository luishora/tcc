import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Package, 
  Wrench, 
  Plus, 
  Minus, 
  History, 
  LayoutDashboard, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft,
  Settings,
  Trash2,
  Edit2,
  X,
  ChevronRight,
  AlertTriangle,
  Menu,
  MoreVertical,
  LogIn,
  UserPlus,
  LogOut,
  Mail,
  Lock,
  User as UserIcon,
  School
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Item, Category, Transaction, ItemType, User } from './types';

// Initial Mock Data
const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Escritório' },
  { id: '2', name: 'Limpeza' },
  { id: '3', name: 'Construção' },
  { id: '4', name: 'Audiovisual' },
];

const INITIAL_ITEMS: Item[] = [
  { id: '1', name: 'Caneta Azul', categoryId: '1', type: 'Material', quantity: 50, unit: 'un', description: 'Caneta esferográfica azul', minStock: 10 },
  { id: '2', name: 'Papel A4', categoryId: '1', type: 'Material', quantity: 20, unit: 'resma', description: 'Papel sulfite 75g', minStock: 5 },
  { id: '3', name: 'Chave de Fenda Philips', categoryId: '3', type: 'Ferramenta', quantity: 5, unit: 'un', description: 'Chave de fenda 1/4x4', minStock: 2 },
  { id: '4', name: 'Projetor Epson', categoryId: '4', type: 'Ferramenta', quantity: 2, unit: 'un', description: 'Projetor Full HD 3000 lumens', minStock: 1 },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('almoxarifado_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('almoxarifado_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('almoxarifado_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('almoxarifado_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'history' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ItemType | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'transaction'>('add');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Persistence
  useEffect(() => {
    localStorage.setItem('almoxarifado_items', JSON.stringify(items));
    localStorage.setItem('almoxarifado_categories', JSON.stringify(categories));
    localStorage.setItem('almoxarifado_transactions', JSON.stringify(transactions));
    if (currentUser) {
      localStorage.setItem('almoxarifado_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('almoxarifado_user');
    }
  }, [items, categories, transactions, currentUser]);

  // Derived Stats
  const stats = useMemo(() => {
    const totalItems = items.length;
    const lowStock = items.filter(i => i.minStock && i.quantity <= i.minStock).length;
    const totalMaterials = items.filter(i => i.type === 'Material').length;
    const totalTools = items.filter(i => i.type === 'Ferramenta').length;
    return { totalItems, lowStock, totalMaterials, totalTools };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || item.type === filterType;
      const matchesCategory = filterCategory === 'All' || item.categoryId === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [items, searchTerm, filterType, filterCategory]);

  const handleAddTransaction = (itemId: string, type: 'Entrada' | 'Saída', quantity: number, notes: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      itemId,
      type,
      quantity,
      date: new Date().toISOString(),
      notes
    };

    setTransactions([newTransaction, ...transactions]);
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = type === 'Entrada' ? item.quantity + quantity : item.quantity - quantity;
        return { ...item, quantity: Math.max(0, newQty) };
      }
      return item;
    }));
    setIsModalOpen(false);
  };

  const handleSaveItem = (itemData: Partial<Item>) => {
    if (modalType === 'add') {
      const newItem: Item = {
        id: Date.now().toString(),
        name: itemData.name || '',
        categoryId: itemData.categoryId || '',
        type: itemData.type || 'Material',
        quantity: itemData.quantity || 0,
        unit: itemData.unit || 'un',
        description: itemData.description || '',
        minStock: itemData.minStock || 0
      };
      setItems([...items, newItem]);
    } else if (modalType === 'edit' && selectedItem) {
      setItems(items.map(i => i.id === selectedItem.id ? { ...i, ...itemData } : i));
    }
    setIsModalOpen(false);
  };

  const deleteItem = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      setItems(items.filter(i => i.id !== id));
      setTransactions(transactions.filter(t => t.itemId !== id));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 font-sans flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/40">
              <Package className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Almoxarifado</h1>
            <p className="text-zinc-500 mt-2 text-sm">Controle de estoque inteligente</p>
          </div>

          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LoginForm onLogin={setCurrentUser} />
                <p className="text-center text-zinc-500 text-sm mt-6">
                  Novo por aqui?{' '}
                  <button 
                    onClick={() => setAuthMode('signup')}
                    className="text-blue-500 font-bold hover:underline underline-offset-4"
                  >
                    Criar conta
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SignupForm onSignup={(user) => { setCurrentUser(user); setAuthMode('login'); }} />
                <p className="text-center text-zinc-500 text-sm mt-6">
                  Já possui conta?{' '}
                  <button 
                    onClick={() => setAuthMode('login')}
                    className="text-blue-500 font-bold hover:underline underline-offset-4"
                  >
                    Fazer login
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex flex-col pb-20">
      {/* Mobile Top Bar */}
      <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="text-white" size={18} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            {currentUser?.schoolName ? `${currentUser.schoolName}` : 'Almoxarifado'}
          </h1>
        </div>
        <button 
          onClick={() => {
            setModalType('add');
            setSelectedItem(null);
            setIsModalOpen(true);
          }}
          className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <div className="p-5 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-zinc-100">Visão Geral</h2>
              
              {/* Mobile Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total Itens" value={stats.totalItems} icon={<Package size={18} className="text-blue-400" />} />
                <StatCard 
                  label="Estoque Baixo" 
                  value={stats.lowStock} 
                  icon={<AlertTriangle size={18} className={stats.lowStock > 0 ? "text-amber-500" : "text-zinc-400"} />} 
                  highlight={stats.lowStock > 0}
                />
                <StatCard label="Materiais" value={stats.totalMaterials} icon={<Package size={18} className="text-zinc-400" />} />
                <StatCard label="Ferramentas" value={stats.totalTools} icon={<Wrench size={18} className="text-zinc-400" />} />
              </div>

              {/* Recent Transactions List */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-200">Últimas Atividades</h3>
                  <button onClick={() => setActiveTab('history')} className="text-xs text-blue-400 font-medium">Ver tudo</button>
                </div>
                <div className="divide-y divide-zinc-800">
                  {transactions.slice(0, 4).map(t => {
                    const item = items.find(i => i.id === t.itemId);
                    return (
                      <div key={t.id} className="p-4 flex items-center justify-between active:bg-zinc-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${t.type === 'Entrada' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {t.type === 'Entrada' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200 truncate max-w-[120px]">{item?.name || 'Removido'}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{new Date(t.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${t.type === 'Entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {t.type === 'Entrada' ? '+' : '-'}{t.quantity}
                          </p>
                          <p className="text-[10px] text-zinc-500">{item?.unit}</p>
                        </div>
                      </div>
                    );
                  })}
                  {transactions.length === 0 && (
                    <div className="p-8 text-center text-zinc-500 text-sm italic">Nenhuma movimentação.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-100">Estoque</h2>
              
              {/* Search & Filter Bar */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Buscar no estoque..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <FilterChip active={filterType === 'All'} onClick={() => setFilterType('All')} label="Todos" />
                  <FilterChip active={filterType === 'Material'} onClick={() => setFilterType('Material')} label="Materiais" />
                  <FilterChip active={filterType === 'Ferramenta'} onClick={() => setFilterType('Ferramenta')} label="Ferramentas" />
                </div>
              </div>

              {/* Mobile Item Cards */}
              <div className="space-y-3">
                {filteredItems.map(item => {
                  const isLow = item.minStock && item.quantity <= item.minStock;
                  return (
                    <motion.div 
                      layout
                      key={item.id} 
                      className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 active:scale-[0.98] transition-transform"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-zinc-100">{item.name}</h4>
                            {isLow && <AlertTriangle size={14} className="text-amber-500" />}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-black ${isLow ? 'text-amber-500' : 'text-blue-500'}`}>
                            {item.quantity} <span className="text-[10px] font-medium uppercase text-zinc-500">{item.unit}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                          {categories.find(c => c.id === item.categoryId)?.name || 'Geral'}
                        </span>
                        <div className="flex gap-1">
                          <ActionButton 
                            onClick={() => { setSelectedItem(item); setModalType('transaction'); setIsModalOpen(true); }}
                            icon={<ArrowUpRight size={16} />}
                            color="blue"
                          />
                          <ActionButton 
                            onClick={() => { setSelectedItem(item); setModalType('edit'); setIsModalOpen(true); }}
                            icon={<Edit2 size={16} />}
                            color="zinc"
                          />
                          <ActionButton 
                            onClick={() => deleteItem(item.id)}
                            icon={<Trash2 size={16} />}
                            color="rose"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {filteredItems.length === 0 && (
                  <div className="py-20 text-center space-y-3">
                    <Package size={48} className="mx-auto text-zinc-800" />
                    <p className="text-zinc-500 text-sm">Nenhum item encontrado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-zinc-100">Histórico</h2>
              <div className="space-y-3">
                {transactions.map(t => {
                  const item = items.find(i => i.id === t.itemId);
                  return (
                    <div key={t.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${t.type === 'Entrada' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="text-xs font-bold uppercase text-zinc-400">{t.type}</span>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-mono">{new Date(t.date).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="font-bold text-zinc-200">{item?.name || 'Item Removido'}</p>
                          <p className="text-xs text-zinc-500 italic mt-1">{t.notes || 'Sem observações'}</p>
                        </div>
                        <p className={`text-lg font-black ${t.type === 'Entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {t.type === 'Entrada' ? '+' : '-'}{t.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <div className="py-20 text-center text-zinc-500">Histórico vazio.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-zinc-100">Ajustes</h2>
              
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">
                <div className="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                    <UserIcon size={24} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-100">{currentUser.name}</p>
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{currentUser.schoolName}</p>
                    <p className="text-xs text-zinc-500">{currentUser.email}</p>
                  </div>
                </div>

                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Categorias</h3>
                <div className="flex gap-2">
                  <input 
                    id="new-category-mobile"
                    type="text" 
                    placeholder="Nova categoria..."
                    className="flex-1 bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm"
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('new-category-mobile') as HTMLInputElement;
                      if (input.value) {
                        setCategories([...categories, { id: Date.now().toString(), name: input.value }]);
                        input.value = '';
                      }
                    }}
                    className="bg-blue-600 text-white px-4 rounded-xl active:scale-95 transition-transform"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-700">
                      <span className="text-xs font-medium">{cat.name}</span>
                      <button onClick={() => setCategories(categories.filter(c => c.id !== cat.id))} className="text-zinc-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Dados</h3>
                <button 
                  onClick={() => {
                    const data = { items, categories, transactions };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `almoxarifado-mobile-backup.json`;
                    a.click();
                  }}
                  className="w-full bg-zinc-800 text-zinc-300 py-4 rounded-xl font-bold text-sm active:bg-zinc-700 transition-colors"
                >
                  Exportar Backup JSON
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-rose-500/10 text-rose-500 py-4 rounded-xl font-bold text-sm active:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Sair da Conta
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around px-4 z-40 pb-4">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} label="Início" />
        <NavButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={24} />} label="Estoque" />
        <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={24} />} label="Histórico" />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={24} />} label="Ajustes" />
      </nav>

      {/* Mobile Modal (Bottom Sheet Style) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-h-[90vh] bg-zinc-900 rounded-t-[32px] border-t border-zinc-800 shadow-2xl overflow-y-auto no-scrollbar"
            >
              <div className="sticky top-0 bg-zinc-900 p-6 border-b border-zinc-800 flex items-center justify-between z-10">
                <h3 className="text-xl font-black">
                  {modalType === 'add' ? 'Novo Item' : 
                   modalType === 'edit' ? 'Editar Item' : 'Movimentação'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 pb-12">
                {modalType === 'transaction' && selectedItem ? (
                  <TransactionFormMobile 
                    item={selectedItem} 
                    onSubmit={handleAddTransaction} 
                  />
                ) : (
                  <ItemFormMobile 
                    initialData={selectedItem || undefined} 
                    categories={categories}
                    onSubmit={handleSaveItem}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('almoxarifado_users') || '[]');
    const user = users.find((u: User) => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...safeUser } = user;
      onLogin(safeUser);
    } else {
      setError('E-mail ou senha incorretos.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            required
            type="email" 
            placeholder="E-mail"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            required
            type="password" 
            placeholder="Senha"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
          {error}
        </p>
      )}

      <button 
        type="submit"
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <LogIn size={20} /> Entrar
      </button>
    </form>
  );
}

function SignupForm({ onSignup }: { onSignup: (user: User) => void }) {
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('almoxarifado_users') || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      setError('Este e-mail já está em uso.');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      schoolName,
      email,
      password
    };

    localStorage.setItem('almoxarifado_users', JSON.stringify([...users, newUser]));
    const { password: _, ...safeUser } = newUser;
    onSignup(safeUser);
    alert('Conta criada com sucesso! Faça login para continuar.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="relative">
          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            required
            type="text" 
            placeholder="Nome completo"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="relative">
          <School className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            required
            type="text" 
            placeholder="Nome da Escola"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            required
            type="email" 
            placeholder="E-mail"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            required
            type="password" 
            placeholder="Sua senha"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
          {error}
        </p>
      )}

      <button 
        type="submit"
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <UserPlus size={20} /> Criar Conta
      </button>
    </form>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-500 scale-110' : 'text-zinc-600'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function StatCard({ label, value, icon, highlight = false }: { label: string, value: number, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`bg-zinc-900 p-4 rounded-2xl border ${highlight ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${highlight ? 'bg-amber-500/10' : 'bg-zinc-800'}`}>
          {icon}
        </div>
        <p className="text-zinc-500 text-[10px] font-bold uppercase truncate">{label}</p>
      </div>
      <p className={`text-2xl font-black ${highlight ? 'text-amber-500' : 'text-zinc-100'}`}>{value}</p>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
        active ? 'bg-blue-600 text-white shadow-md' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
      }`}
    >
      {label}
    </button>
  );
}

function ActionButton({ onClick, icon, color }: { onClick: () => void, icon: React.ReactNode, color: 'blue' | 'rose' | 'zinc' }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500',
    rose: 'bg-rose-500/10 text-rose-500',
    zinc: 'bg-zinc-800 text-zinc-400'
  };
  return (
    <button onClick={onClick} className={`p-2.5 rounded-xl active:scale-90 transition-transform ${colors[color]}`}>
      {icon}
    </button>
  );
}

function ItemFormMobile({ initialData, categories, onSubmit }: { initialData?: Item, categories: Category[], onSubmit: (data: Partial<Item>) => void }) {
  const [formData, setFormData] = useState<Partial<Item>>(initialData || {
    name: '',
    categoryId: categories[0]?.id || '',
    type: 'Material',
    quantity: 0,
    unit: 'un',
    description: '',
    minStock: 0
  });

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nome do Item</label>
          <input 
            required
            type="text" 
            className="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Tipo</label>
            <select 
              className="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as ItemType })}
            >
              <option value="Material">Material</option>
              <option value="Ferramenta">Ferramenta</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Categoria</label>
            <select 
              className="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600"
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Quantidade</label>
            <input 
              type="number" 
              className="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Unidade</label>
            <input 
              type="text" 
              placeholder="un, kg..."
              className="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600"
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Estoque Mínimo</label>
          <input 
            type="number" 
            className="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600"
            value={formData.minStock}
            onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Descrição</label>
          <textarea 
            rows={2}
            className="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>
      
      <button 
        type="submit"
        className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all mt-4"
      >
        {initialData ? 'Atualizar Item' : 'Salvar no Estoque'}
      </button>
    </form>
  );
}

function TransactionFormMobile({ item, onSubmit }: { item: Item, onSubmit: (id: string, type: 'Entrada' | 'Saída', qty: number, notes: string) => void }) {
  const [type, setType] = useState<'Entrada' | 'Saída'>('Entrada');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-zinc-800/50 p-5 rounded-[24px] border border-zinc-800">
        <p className="text-[10px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Item</p>
        <p className="text-xl font-black text-zinc-100">{item.name}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="px-2 py-1 bg-blue-500/10 rounded-md">
            <p className="text-xs font-bold text-blue-400">{item.quantity} {item.unit} em estoque</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => setType('Entrada')}
          className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
            type === 'Entrada' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40' : 'bg-zinc-800 text-zinc-500'
          }`}
        >
          <Plus size={20} /> Entrada
        </button>
        <button 
          onClick={() => setType('Saída')}
          className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
            type === 'Saída' ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40' : 'bg-zinc-800 text-zinc-500'
          }`}
        >
          <Minus size={20} /> Saída
        </button>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Quantidade</label>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-100 active:scale-90"
            >
              <Minus size={24} />
            </button>
            <input 
              type="number" 
              min="1"
              className="flex-1 bg-zinc-800 border-none rounded-2xl px-4 py-4 text-2xl font-black text-center focus:ring-2 focus:ring-blue-600"
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
            />
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-100 active:scale-90"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Observações</label>
          <textarea 
            rows={3}
            placeholder="Motivo da movimentação..."
            className="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      <button 
        onClick={() => onSubmit(item.id, type, quantity, notes)}
        className={`w-full py-5 rounded-3xl font-black text-lg shadow-xl transition-all active:scale-95 ${
          type === 'Entrada' ? 'bg-emerald-600 text-white shadow-emerald-900/40' : 'bg-rose-600 text-white shadow-rose-900/40'
        }`}
      >
        Confirmar {type}
      </button>
    </div>
  );
}
