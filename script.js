/**
 * script.js - Almoxarifado Pro
 * Pure JavaScript version of the Inventory System
 */

// --- Initial Data & Types ---
const INITIAL_CATEGORIES = [
  { id: '1', name: 'Escritório' },
  { id: '2', name: 'Limpeza' },
  { id: '3', name: 'Construção' },
  { id: '4', name: 'Audiovisual' },
];

const INITIAL_ITEMS = [
  { id: '1', name: 'Caneta Azul', categoryId: '1', type: 'Material', quantity: 50, unit: 'un', description: 'Caneta esferográfica azul', minStock: 10 },
  { id: '2', name: 'Papel A4', categoryId: '1', type: 'Material', quantity: 20, unit: 'resma', description: 'Papel sulfite 75g', minStock: 5 },
  { id: '3', name: 'Chave de Fenda Philips', categoryId: '3', type: 'Ferramenta', quantity: 5, unit: 'un', description: 'Chave de fenda 1/4x4', minStock: 2 },
  { id: '4', name: 'Projetor Epson', categoryId: '4', type: 'Ferramenta', quantity: 2, unit: 'un', description: 'Projetor Full HD 3000 lumens', minStock: 1 },
];

// --- State Management ---
const state = {
  currentUser: JSON.parse(localStorage.getItem('almoxarifado_user')) || null,
  items: JSON.parse(localStorage.getItem('almoxarifado_items')) || INITIAL_ITEMS,
  categories: JSON.parse(localStorage.getItem('almoxarifado_categories')) || INITIAL_CATEGORIES,
  transactions: JSON.parse(localStorage.getItem('almoxarifado_transactions')) || [],
  activeTab: 'dashboard',
  searchTerm: '',
  filterType: 'All',
  filterCategory: 'All',
  modal: {
    isOpen: false,
    type: 'add', // 'add', 'edit', 'transaction'
    selectedItemId: null
  },
  authMode: 'login' // 'login', 'signup'
};

// Save state to localStorage
function saveToLocalStorage() {
  localStorage.setItem('almoxarifado_items', JSON.stringify(state.items));
  localStorage.setItem('almoxarifado_categories', JSON.stringify(state.categories));
  localStorage.setItem('almoxarifado_transactions', JSON.stringify(state.transactions));
  if (state.currentUser) {
    localStorage.setItem('almoxarifado_user', JSON.stringify(state.currentUser));
  } else {
    localStorage.removeItem('almoxarifado_user');
  }
}

// --- View Helpers ---
const views = {
  login: () => `
    <div class="min-h-screen bg-black text-zinc-100 font-sans flex items-center justify-center p-6 fade-in">
      <div class="w-full max-w-sm space-y-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/40">
            <i data-lucide="package" class="text-white w-8 h-8"></i>
          </div>
          <h1 class="text-3xl font-black tracking-tight">Almoxarifado</h1>
          <p class="text-zinc-500 mt-2 text-sm">Controle de estoque inteligente</p>
        </div>

        <div id="auth-container">
          ${state.authMode === 'login' ? components.loginForm() : components.signupForm()}
        </div>
      </div>
    </div>
  `,

  app: () => `
    <div class="min-h-screen bg-black text-zinc-100 font-sans flex flex-col pb-20 fade-in">
      <!-- Mobile Top Bar -->
      <header class="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i data-lucide="package" class="text-white w-4 h-4"></i>
          </div>
          <h1 class="text-lg font-bold tracking-tight truncate max-w-[180px]">
            ${state.currentUser.schoolName || 'Almoxarifado'}
          </h1>
        </div>
        <button onclick="actions.openModal('add')" class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform">
          <i data-lucide="plus" class="w-5 h-5"></i>
        </button>
      </header>

      <!-- Main Content -->
      <main id="main-content" class="flex-1 overflow-x-hidden">
        ${views[state.activeTab] ? views[state.activeTab]() : views.dashboard()}
      </main>

      <!-- Bottom Nav -->
      <nav class="fixed bottom-0 left-0 right-0 h-20 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around px-4 z-40 pb-4">
        ${components.navButton('dashboard', 'layout-dashboard', 'Início')}
        ${components.navButton('inventory', 'package', 'Estoque')}
        ${components.navButton('history', 'history', 'Histórico')}
        ${components.navButton('settings', 'settings', 'Ajustes')}
      </nav>

      <!-- Modal Container -->
      <div id="modal-wrapper"></div>
    </div>
  `,

  dashboard: () => {
    const totalItems = state.items.length;
    const lowStockCount = state.items.filter(i => i.minStock && i.quantity <= i.minStock).length;
    const materialsCount = state.items.filter(i => i.type === 'Material').length;
    const toolsCount = state.items.filter(i => i.type === 'Ferramenta').length;

    return `
      <div class="p-5 space-y-6">
        <h2 class="text-2xl font-bold text-zinc-100">Visão Geral</h2>
        
        <div class="grid grid-cols-2 gap-3">
          ${components.statCard('Total Itens', totalItems, 'package', false, 'text-blue-400')}
          ${components.statCard('Estoque Baixo', lowStockCount, 'alert-triangle', lowStockCount > 0, lowStockCount > 0 ? 'text-amber-500' : 'text-zinc-400')}
          ${components.statCard('Materiais', materialsCount, 'package', false, 'text-zinc-400')}
          ${components.statCard('Ferramentas', toolsCount, 'wrench', false, 'text-zinc-400')}
        </div>

        <div class="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div class="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 class="font-semibold text-zinc-200">Últimas Atividades</h3>
            <button onclick="actions.changeTab('history')" class="text-xs text-blue-400 font-medium">Ver tudo</button>
          </div>
          <div class="divide-y divide-zinc-800">
            ${state.transactions.length > 0 ? 
              state.transactions.slice(0, 4).map(t => components.transactionItem(t)).join('') : 
              '<div class="p-8 text-center text-zinc-500 text-sm italic">Nenhuma movimentação.</div>'
            }
          </div>
        </div>
      </div>
    `;
  },

  inventory: () => {
    const filteredItems = state.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
                            item.description.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesType = state.filterType === 'All' || item.type === state.filterType;
      const matchesCategory = state.filterCategory === 'All' || item.categoryId === state.filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });

    return `
      <div class="p-5 space-y-4">
        <h2 class="text-2xl font-bold text-zinc-100">Estoque</h2>
        
        <div class="space-y-3">
          <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4"></i>
            <input 
              type="text" 
              placeholder="Buscar no estoque..."
              class="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 transition-all"
              value="${state.searchTerm}"
              oninput="actions.search(this.value)"
            />
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            ${components.filterChip('All', 'Todos')}
            ${components.filterChip('Material', 'Materiais')}
            ${components.filterChip('Ferramenta', 'Ferramentas')}
          </div>
        </div>

        <div class="space-y-3">
          ${filteredItems.length > 0 ? 
            filteredItems.map(item => components.itemCard(item)).join('') : 
            `<div class="py-20 text-center space-y-3">
              <i data-lucide="package" class="mx-auto text-zinc-800 w-12 h-12"></i>
              <p class="text-zinc-500 text-sm">Nenhum item encontrado.</p>
            </div>`
          }
        </div>
      </div>
    `;
  },

  history: () => `
    <div class="p-5 space-y-4">
      <h2 class="text-2xl font-bold text-zinc-100">Histórico</h2>
      <div class="space-y-3">
        ${state.transactions.length > 0 ? 
          state.transactions.map(t => components.transactionCard(t)).join('') : 
          '<div class="py-20 text-center text-zinc-500">Histórico vazio.</div>'
        }
      </div>
    </div>
  `,

  settings: () => `
    <div class="p-5 space-y-6">
      <h2 class="text-2xl font-bold text-zinc-100">Ajustes</h2>
      
      <div class="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">
        <div class="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-4">
          <div class="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
            <i data-lucide="user" class="text-zinc-400 w-6 h-6"></i>
          </div>
          <div>
            <p class="font-bold text-zinc-100">${state.currentUser.name}</p>
            <p class="text-[10px] text-blue-500 font-bold uppercase tracking-widest">${state.currentUser.schoolName}</p>
            <p class="text-xs text-zinc-500">${state.currentUser.email}</p>
          </div>
        </div>

        <h3 class="text-sm font-bold uppercase tracking-widest text-zinc-500">Categorias</h3>
        <div class="flex gap-2">
          <input 
            id="new-category-input"
            type="text" 
            placeholder="Nova categoria..."
            class="flex-1 bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm"
          />
          <button 
            onclick="actions.addCategory()"
            class="bg-blue-600 text-white px-4 rounded-xl active:scale-95 transition-transform"
          >
            <i data-lucide="plus" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="flex flex-wrap gap-2 pt-2">
          ${state.categories.map(cat => `
            <div class="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-700">
              <span class="text-xs font-medium">${cat.name}</span>
              <button onclick="actions.deleteCategory('${cat.id}')" class="text-zinc-500">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-widest text-zinc-500">Dados</h3>
        <button 
          onclick="actions.exportData()"
          class="w-full bg-zinc-800 text-zinc-300 py-4 rounded-xl font-bold text-sm active:bg-zinc-700 transition-colors"
        >
          Exportar Backup JSON
        </button>
        <button 
          onclick="actions.logout()"
          class="w-full bg-rose-500/10 text-rose-500 py-4 rounded-xl font-bold text-sm active:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <i data-lucide="log-out" class="w-4 h-4"></i>
          Sair da Conta
        </button>
      </div>
    </div>
  `
};

// --- Components ---
const components = {
  loginForm: () => `
    <form onsubmit="actions.login(event)" class="space-y-4">
      <div class="space-y-4">
        <div class="relative">
          <i data-lucide="mail" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5"></i>
          <input required type="email" id="login-email" placeholder="E-mail" class="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
        </div>
        <div class="relative">
          <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5"></i>
          <input required type="password" id="login-password" placeholder="Senha" class="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
        </div>
      </div>
      <div id="login-error" class="hidden text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20"></div>
      <button type="submit" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        <i data-lucide="log-in" class="w-5 h-5"></i> Entrar
      </button>
      <p class="text-center text-zinc-500 text-sm mt-6">
        Novo por aqui? <button onclick="actions.setAuthMode('signup')" class="text-blue-500 font-bold hover:underline underline-offset-4">Criar conta</button>
      </p>
    </form>
  `,

  signupForm: () => `
    <form onsubmit="actions.signup(event)" class="space-y-4">
      <div class="space-y-4">
        <div class="relative">
          <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5"></i>
          <input required type="text" id="signup-name" placeholder="Nome completo" class="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
        </div>
        <div class="relative">
          <i data-lucide="school" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5"></i>
          <input required type="text" id="signup-school" placeholder="Nome da Escola" class="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
        </div>
        <div class="relative">
          <i data-lucide="mail" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5"></i>
          <input required type="email" id="signup-email" placeholder="E-mail" class="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
        </div>
        <div class="relative">
          <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4.5 h-4.5"></i>
          <input required type="password" id="signup-password" placeholder="Sua senha" class="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
        </div>
      </div>
      <div id="signup-error" class="hidden text-rose-500 text-xs font-bold text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20"></div>
      <button type="submit" class="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        <i data-lucide="user-plus" class="w-5 h-5"></i> Criar Conta
      </button>
      <p class="text-center text-zinc-500 text-sm mt-6">
        Já possui conta? <button onclick="actions.setAuthMode('login')" class="text-blue-500 font-bold hover:underline underline-offset-4">Fazer login</button>
      </p>
    </form>
  `,

  navButton: (id, icon, label) => `
    <button onclick="actions.changeTab('${id}')" class="flex flex-col items-center gap-1 transition-all ${state.activeTab === id ? 'text-blue-500 scale-110' : 'text-zinc-600'}">
      <i data-lucide="${icon}" class="w-6 h-6"></i>
      <span class="text-[10px] font-bold uppercase tracking-tighter">${label}</span>
    </button>
  `,

  statCard: (label, value, icon, highlight, iconColor) => `
    <div class="bg-zinc-900 p-4 rounded-2xl border ${highlight ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800'}">
      <div class="flex items-center gap-2 mb-2">
        <div class="p-1.5 rounded-lg ${highlight ? 'bg-amber-500/10' : 'bg-zinc-800'}">
          <i data-lucide="${icon}" class="${iconColor} w-4.5 h-4.5"></i>
        </div>
        <p class="text-zinc-500 text-[10px] font-bold uppercase truncate">${label}</p>
      </div>
      <p class="text-2xl font-black ${highlight ? 'text-amber-500' : 'text-zinc-100'}">${value}</p>
    </div>
  `,

  transactionItem: (t) => {
    const item = state.items.find(i => i.id === t.itemId);
    return `
      <div class="p-4 flex items-center justify-between active:bg-zinc-800 transition-colors">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg ${t.type === 'Entrada' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}">
            <i data-lucide="${t.type === 'Entrada' ? 'arrow-down-left' : 'arrow-up-right'}" class="w-4 h-4"></i>
          </div>
          <div>
            <p class="text-sm font-medium text-zinc-200 truncate max-w-[120px]">${item ? item.name : 'Removido'}</p>
            <p class="text-[10px] text-zinc-500 uppercase tracking-wider">${new Date(t.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold ${t.type === 'Entrada' ? 'text-emerald-500' : 'text-rose-500'}">
            ${t.type === 'Entrada' ? '+' : '-'}${t.quantity}
          </p>
          <p class="text-[10px] text-zinc-500">${item ? item.unit : ''}</p>
        </div>
      </div>
    `;
  },

  itemCard: (item) => {
    const isLow = item.minStock && item.quantity <= item.minStock;
    const category = state.categories.find(c => c.id === item.categoryId);
    return `
      <div class="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 active:scale-[0.98] transition-transform">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-zinc-100">${item.name}</h4>
              ${isLow ? '<i data-lucide="alert-triangle" class="text-amber-500 w-3.5 h-3.5"></i>' : ''}
            </div>
            <p class="text-xs text-zinc-500 mt-0.5">${item.description}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-black ${isLow ? 'text-amber-500' : 'text-blue-500'}">
              ${item.quantity} <span class="text-[10px] font-medium uppercase text-zinc-500">${item.unit}</span>
            </p>
          </div>
        </div>
        
        <div class="flex items-center justify-between pt-3 border-t border-zinc-800/50">
          <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            ${category ? category.name : 'Geral'}
          </span>
          <div class="flex gap-1">
            <button onclick="actions.openModal('transaction', '${item.id}')" class="p-2.5 rounded-xl active:scale-90 transition-transform bg-blue-500/10 text-blue-500">
              <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
            </button>
            <button onclick="actions.openModal('edit', '${item.id}')" class="p-2.5 rounded-xl active:scale-90 transition-transform bg-zinc-800 text-zinc-400">
              <i data-lucide="edit-2" class="w-4 h-4"></i>
            </button>
            <button onclick="actions.deleteItem('${item.id}')" class="p-2.5 rounded-xl active:scale-90 transition-transform bg-rose-500/10 text-rose-500">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  transactionCard: (t) => {
    const item = state.items.find(i => i.id === t.itemId);
    return `
      <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full ${t.type === 'Entrada' ? 'bg-emerald-500' : 'bg-rose-500'}"></div>
            <span class="text-xs font-bold uppercase text-zinc-400">${t.type}</span>
          </div>
          <span class="text-[10px] text-zinc-600 font-mono">${new Date(t.date).toLocaleString('pt-BR')}</span>
        </div>
        <div class="flex justify-between items-end">
          <div>
            <p class="font-bold text-zinc-200">${item ? item.name : 'Item Removido'}</p>
            <p class="text-xs text-zinc-500 italic mt-1 font-inter">${t.notes || 'Sem observações'}</p>
          </div>
          <p class="text-lg font-black ${t.type === 'Entrada' ? 'text-emerald-500' : 'text-rose-500'}">
            ${t.type === 'Entrada' ? '+' : '-'}${t.quantity}
          </p>
        </div>
      </div>
    `;
  },

  filterChip: (id, label) => `
    <button onclick="actions.filterType('${id}')" class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${state.filterType === id ? 'bg-blue-600 text-white shadow-md' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}">
      ${label}
    </button>
  `,

  modal: () => {
    if (!state.modal.isOpen) return '';
    const item = state.modal.selectedItemId ? state.items.find(i => i.id === state.modal.selectedItemId) : null;

    return `
      <div id="modal-container" class="fixed inset-0 z-50 flex items-end justify-center">
        <div onclick="actions.closeModal()" class="absolute inset-0 bg-black/80 backdrop-blur-sm fade-in"></div>
        <div class="relative w-full max-h-[90vh] bg-zinc-900 rounded-t-[32px] border-t border-zinc-800 shadow-2xl overflow-y-auto no-scrollbar slide-up">
          <div class="sticky top-0 bg-zinc-900 p-6 border-b border-zinc-800 flex items-center justify-between z-10">
            <h3 class="text-xl font-black">
              ${state.modal.type === 'add' ? 'Novo Item' : 
                state.modal.type === 'edit' ? 'Editar Item' : 'Movimentação'}
            </h3>
            <button onclick="actions.closeModal()" class="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div class="p-6 pb-12">
            ${state.modal.type === 'transaction' ? components.transactionForm(item) : components.itemForm(item)}
          </div>
        </div>
      </div>
    `;
  },

  itemForm: (item) => `
    <form id="item-form" onsubmit="actions.saveItem(event)" class="space-y-5">
      <div class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nome do Item</label>
          <input required type="text" id="item-name" value="${item ? item.name : ''}" class="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm font-inter" />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Tipo</label>
            <select id="item-type" class="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm font-inter">
              <option value="Material" ${item && item.type === 'Material' ? 'selected' : ''}>Material</option>
              <option value="Ferramenta" ${item && item.type === 'Ferramenta' ? 'selected' : ''}>Ferramenta</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Categoria</label>
            <select id="item-category" class="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm font-inter">
              ${state.categories.map(c => `
                <option value="${c.id}" ${item && item.categoryId === c.id ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Quantidade</label>
            <input type="number" id="item-quantity" value="${item ? item.quantity : 0}" class="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm font-inter" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Unidade</label>
            <input type="text" id="item-unit" value="${item ? item.unit : 'un'}" placeholder="un, kg..." class="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm font-inter" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Estoque Mínimo</label>
          <input type="number" id="item-minStock" value="${item ? item.minStock : 0}" class="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm font-inter" />
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Descrição</label>
          <textarea id="item-description" rows="2" class="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm font-inter">${item ? item.description : ''}</textarea>
        </div>
      </div>
      
      <button type="submit" class="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all mt-4">
        ${item ? 'Atualizar Item' : 'Salvar no Estoque'}
      </button>
    </form>
  `,

  transactionForm: (item) => `
    <div class="space-y-6">
      <div class="bg-zinc-800/50 p-5 rounded-[24px] border border-zinc-800">
        <p class="text-[10px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Item</p>
        <p class="text-xl font-black text-zinc-100">${item.name}</p>
        <div class="flex items-center gap-2 mt-2">
          <div class="px-2 py-1 bg-blue-500/10 rounded-md">
            <p id="current-stock" class="text-xs font-bold text-blue-400">${item.quantity} ${item.unit} em estoque</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3" id="transaction-type-btns">
        <button onclick="actions.setTransactionType('Entrada')" id="btn-entrada" class="flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all bg-emerald-500 text-white shadow-lg shadow-emerald-900/40">
          <i data-lucide="plus" class="w-5 h-5"></i> Entrada
        </button>
        <button onclick="actions.setTransactionType('Saída')" id="btn-saida" class="flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all bg-zinc-800 text-zinc-500">
          <i data-lucide="minus" class="w-5 h-5"></i> Saída
        </button>
      </div>

      <div class="space-y-5">
        <div class="space-y-1.5">
          <label class="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Quantidade</label>
          <div class="flex items-center gap-4">
            <button onclick="actions.adjustQty(-1)" class="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-100 active:scale-90">
              <i data-lucide="minus" class="w-6 h-6"></i>
            </button>
            <input type="number" id="trans-qty" value="1" min="1" class="flex-1 bg-zinc-800 border-none rounded-2xl px-4 py-4 text-2xl font-black text-center" />
            <button onclick="actions.adjustQty(1)" class="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-100 active:scale-90">
              <i data-lucide="plus" class="w-6 h-6"></i>
            </button>
          </div>
        </div>
        
        <div class="space-y-1.5">
          <label class="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Observações</label>
          <textarea id="trans-notes" rows="3" placeholder="Motivo da movimentação..." class="w-full bg-zinc-800 border-none rounded-2xl px-5 py-4 text-sm"></textarea>
        </div>
      </div>

      <button onclick="actions.confirmTransaction()" id="confirm-trans-btn" class="w-full py-5 rounded-3xl font-black text-lg shadow-xl transition-all active:scale-95 bg-emerald-600 text-white shadow-emerald-900/40">
        Confirmar Entrada
      </button>
    </div>
  `
};

// --- Actions & Controllers ---
let currentTransType = 'Entrada';

window.actions = {
  render: () => {
    const root = document.getElementById('app');
    if (!state.currentUser) {
      root.innerHTML = views.login();
    } else {
      root.innerHTML = views.app();
    }
    lucide.createIcons();
    // Re-bind events if needed or handle via delegation
  },

  setAuthMode: (mode) => {
    state.authMode = mode;
    actions.render();
  },

  login: (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const users = JSON.parse(localStorage.getItem('almoxarifado_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...safeUser } = user;
      state.currentUser = safeUser;
      saveToLocalStorage();
      actions.render();
    } else {
      const err = document.getElementById('login-error');
      err.textContent = 'E-mail ou senha incorretos.';
      err.classList.remove('hidden');
    }
  },

  signup: (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const schoolName = document.getElementById('signup-school').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    const users = JSON.parse(localStorage.getItem('almoxarifado_users') || '[]');
    if (users.find(u => u.email === email)) {
      const err = document.getElementById('signup-error');
      err.textContent = 'Este e-mail já está em uso.';
      err.classList.remove('hidden');
      return;
    }

    const newUser = { id: Date.now().toString(), name, schoolName, email, password };
    users.push(newUser);
    localStorage.setItem('almoxarifado_users', JSON.stringify(users));
    
    alert('Conta criada com sucesso! Faça login.');
    state.authMode = 'login';
    actions.render();
  },

  logout: () => {
    state.currentUser = null;
    state.activeTab = 'dashboard';
    saveToLocalStorage();
    actions.render();
  },

  changeTab: (tab) => {
    state.activeTab = tab;
    actions.render();
  },

  search: (val) => {
    state.searchTerm = val;
    // Debounce or just re-render small part? Re-rendering whole app for simplicity.
    const main = document.getElementById('main-content');
    if (state.activeTab === 'inventory') {
      main.innerHTML = views.inventory();
      lucide.createIcons();
    }
  },

  filterType: (type) => {
    state.filterType = type;
    actions.render();
  },

  openModal: (type, id = null) => {
    state.modal = { isOpen: true, type, selectedItemId: id };
    currentTransType = 'Entrada';
    actions.render();
  },

  closeModal: () => {
    state.modal.isOpen = false;
    actions.render();
  },

  saveItem: (e) => {
    e.preventDefault();
    const itemData = {
      name: document.getElementById('item-name').value,
      type: document.getElementById('item-type').value,
      categoryId: document.getElementById('item-category').value,
      quantity: Number(document.getElementById('item-quantity').value),
      unit: document.getElementById('item-unit').value,
      minStock: Number(document.getElementById('item-minStock').value),
      description: document.getElementById('item-description').value,
    };

    if (state.modal.type === 'add') {
      state.items.push({ ...itemData, id: Date.now().toString() });
    } else if (state.modal.type === 'edit') {
      const index = state.items.findIndex(i => i.id === state.modal.selectedItemId);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...itemData };
      }
    }

    state.modal.isOpen = false;
    saveToLocalStorage();
    actions.render();
  },

  deleteItem: (id) => {
    if (confirm('Excluir este item?')) {
      state.items = state.items.filter(i => i.id !== id);
      state.transactions = state.transactions.filter(t => t.itemId !== id);
      saveToLocalStorage();
      actions.render();
    }
  },

  setTransactionType: (type) => {
    currentTransType = type;
    const btnEntrada = document.getElementById('btn-entrada');
    const btnSaida = document.getElementById('btn-saida');
    const confirmBtn = document.getElementById('confirm-trans-btn');

    if (type === 'Entrada') {
      btnEntrada.className = 'flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all bg-emerald-500 text-white shadow-lg shadow-emerald-900/40';
      btnSaida.className = 'flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all bg-zinc-800 text-zinc-500';
      confirmBtn.className = 'w-full py-5 rounded-3xl font-black text-lg shadow-xl transition-all active:scale-95 bg-emerald-600 text-white shadow-emerald-900/40';
      confirmBtn.textContent = 'Confirmar Entrada';
    } else {
      btnEntrada.className = 'flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all bg-zinc-800 text-zinc-500';
      btnSaida.className = 'flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all bg-rose-500 text-white shadow-lg shadow-rose-900/40';
      confirmBtn.className = 'w-full py-5 rounded-3xl font-black text-lg shadow-xl transition-all active:scale-95 bg-rose-600 text-white shadow-rose-900/40';
      confirmBtn.textContent = 'Confirmar Saída';
    }
  },

  adjustQty: (amt) => {
    const input = document.getElementById('trans-qty');
    input.value = Math.max(1, Number(input.value) + amt);
  },

  confirmTransaction: () => {
    const qty = Number(document.getElementById('trans-qty').value);
    const notes = document.getElementById('trans-notes').value;
    const itemId = state.modal.selectedItemId;
    
    const transaction = {
      id: Date.now().toString(),
      itemId,
      type: currentTransType,
      quantity: qty,
      date: new Date().toISOString(),
      notes
    };

    state.transactions.push(transaction);
    const item = state.items.find(i => i.id === itemId);
    if (item) {
      const change = currentTransType === 'Entrada' ? qty : -qty;
      item.quantity = Math.max(0, item.quantity + change);
    }

    state.modal.isOpen = false;
    saveToLocalStorage();
    actions.render();
  },

  addCategory: () => {
    const input = document.getElementById('new-category-input');
    if (input.value) {
      state.categories.push({ id: Date.now().toString(), name: input.value });
      input.value = '';
      saveToLocalStorage();
      actions.render();
    }
  },

  deleteCategory: (id) => {
    state.categories = state.categories.filter(c => c.id !== id);
    saveToLocalStorage();
    actions.render();
  },

  exportData: () => {
    const data = { items: state.items, categories: state.categories, transactions: state.transactions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `almoxarifado-backup.json`;
    a.click();
  }
};

// Start the APP
document.addEventListener('DOMContentLoaded', () => {
  actions.render();
});
