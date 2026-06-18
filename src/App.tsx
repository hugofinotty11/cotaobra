import React, { useState, useEffect } from 'react';
import { Material, Supplier, Quote, ShoppingList, PriceHistoryEntry } from './types';
import { 
  loadMaterials, saveMaterials, 
  loadSuppliers, saveSuppliers, 
  loadQuotes, saveQuotes, 
  loadShoppingLists, saveShoppingLists, 
  loadPriceHistory, savePriceHistory,
  formatCurrency, getCheapestQuote
} from './utils';

// Import subcomponents
import PriceMatrix from './components/PriceMatrix';
import SavingsReport from './components/SavingsReport';
import ShoppingLists from './components/ShoppingLists';
import RegistrationManager from './components/RegistrationManager';
import HistoryViewer from './components/HistoryViewer';

// Icons
import { 
  Calculator, FileText, Info, HardHat, Building2, TrendingUp, 
  Settings, Download, Upload, RefreshCw, Smartphone, Check, Heart, ShieldAlert 
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'matrix' | 'lists' | 'report' | 'history' | 'register'>('matrix');

  // Core database states
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [activeListId, setActiveListId] = useState<string>('');

  // Settings Drawer and export status
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize data from LocalStorage upon component mount
  useEffect(() => {
    const loadedMats = loadMaterials();
    const loadedSups = loadSuppliers();
    const loadedQuotes = loadQuotes();
    const loadedLists = loadShoppingLists();
    const loadedHist = loadPriceHistory();

    setMaterials(loadedMats);
    setSuppliers(loadedSups);
    setQuotes(loadedQuotes);
    setShoppingLists(loadedLists);
    setHistory(loadedHist);

    if (loadedLists.length > 0) {
      setActiveListId(loadedLists[0].id);
    }
  }, []);

  // Sync methods to save to localStorage when React state updates
  const handleSetMaterials = (newMats: Material[]) => {
    setMaterials(newMats);
    saveMaterials(newMats);
  };

  const handleSetSuppliers = (newSups: Supplier[]) => {
    setSuppliers(newSups);
    saveSuppliers(newSups);
  };

  const handleSetQuotes = (newQuotes: Quote[]) => {
    setQuotes(newQuotes);
    saveQuotes(newQuotes);
  };

  const handleSetShoppingLists = (newLists: ShoppingList[]) => {
    setShoppingLists(newLists);
    saveShoppingLists(newLists);
  };

  const handleSetHistory = (newHist: PriceHistoryEntry[]) => {
    setHistory(newHist);
    savePriceHistory(newHist);
  };

  // Adding/updating a quote from matrix component
  const handleUpdateQuote = (materialId: string, supplierId: string, price: number) => {
    const existingIdx = quotes.findIndex(q => q.materialId === materialId && q.supplierId === supplierId);
    let updatedQuotes = [...quotes];
    const timestamp = new Date().toISOString().split('T')[0];

    // Log this point inside Price History graph tracking
    if (price > 0) {
      const newHistoryEntry: PriceHistoryEntry = {
        id: 'h_' + Date.now(),
        materialId,
        supplierId,
        price,
        date: timestamp
      };
      
      // Keep list small or prevent duplicates on exact same day
      const previousHistoryOnSameDayIdx = history.findIndex(h => 
        h.materialId === materialId && h.supplierId === supplierId && h.date === timestamp
      );

      let updatedHistory = [...history];
      if (previousHistoryOnSameDayIdx >= 0) {
        updatedHistory[previousHistoryOnSameDayIdx].price = price;
      } else {
        updatedHistory.push(newHistoryEntry);
      }
      handleSetHistory(updatedHistory);
    }

    if (existingIdx >= 0) {
      if (price === 0) {
        // Delete if price cleared
        updatedQuotes.splice(existingIdx, 1);
      } else {
        // Edit price
        updatedQuotes[existingIdx] = {
          ...updatedQuotes[existingIdx],
          price,
          updatedAt: timestamp
        };
      }
    } else {
      if (price > 0) {
        // Insert new quote record
        updatedQuotes.push({
          id: 'q_' + Date.now(),
          materialId,
          supplierId,
          price,
          updatedAt: timestamp
        });
      }
    }

    handleSetQuotes(updatedQuotes);
  };

  // Manual history functions
  const handleAddHistoryEntry = (materialId: string, supplierId: string, price: number, date: string) => {
    const entry: PriceHistoryEntry = {
      id: 'h_' + Date.now(),
      materialId,
      supplierId,
      price,
      date
    };
    handleSetHistory([...history, entry]);
  };

  const handleDeleteHistoryEntry = (id: string) => {
    if (confirm("Deseja apagar esse ponto histórico permanentemente?")) {
      handleSetHistory(history.filter(h => h.id !== id));
    }
  };

  // Export JSON Backup file to local downloader
  const handleExportBackup = () => {
    const dataBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      materials,
      suppliers,
      quotes,
      shoppingLists,
      history
    };

    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataBackup, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `cotaobra_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setBackupMessage({ type: 'success', text: 'Backup exportado com sucesso!' });
      setTimeout(() => setBackupMessage(null), 3000);
    } catch (e) {
      setBackupMessage({ type: 'error', text: 'Falha ao exportar backup.' });
    }
  };

  // Import JSON Backup from file attachment input
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.materials && parsed.suppliers && parsed.quotes) {
          handleSetMaterials(parsed.materials);
          handleSetSuppliers(parsed.suppliers);
          handleSetQuotes(parsed.quotes);
          
          if (parsed.shoppingLists) handleSetShoppingLists(parsed.shoppingLists);
          if (parsed.history) handleSetHistory(parsed.history);

          if (parsed.shoppingLists && parsed.shoppingLists.length > 0) {
            setActiveListId(parsed.shoppingLists[0].id);
          }

          setBackupMessage({ type: 'success', text: 'Backup importado com sucesso!' });
          setTimeout(() => setBackupMessage(null), 3000);
          setIsSettingsOpen(false);
        } else {
          setBackupMessage({ type: 'error', text: 'Formato de arquivo inválido.' });
        }
      } catch (err) {
        setBackupMessage({ type: 'error', text: 'Erro ao interpretar JSON de backup.' });
      }
    };
    fileReader.readAsText(file);
  };

  // Reset all values to start fresh
  const handleResetData = () => {
    if (confirm("⚠️ ATENÇÃO: Isso apagará TODOS os seus materiais, fornecedores, preços e históricos. Esta ação NÃO pode ser desfeita. Deseja prosseguir?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Core optimized KPI calculation values
  const getOverallGlobalSavingsStats = () => {
    const activeList = shoppingLists.find(l => l.id === activeListId);
    if (!activeList || activeList.items.length === 0) return null;

    let optimizedTotal = 0;
    let worstSingleStoreTotal = 0;
    
    // Calculate for maximum price
    const storeTotals = suppliers.map(supplier => {
      let total = 0;
      activeList.items.forEach(item => {
        const q = quotes.find(quote => quote.materialId === item.materialId && quote.supplierId === supplier.id);
        if (q && q.price > 0) total += q.price * item.quantity;
      });
      return total;
    }).filter(t => t > 0);

    const worstTotal = storeTotals.length > 0 ? Math.max(...storeTotals) : 0;

    activeList.items.forEach(item => {
      const cheapest = getCheapestQuote(item.materialId, quotes);
      if (cheapest && cheapest.price > 0) {
        optimizedTotal += cheapest.price * item.quantity;
      }
    });

    const saved = worstTotal > 0 ? worstTotal - optimizedTotal : 0;
    return {
      optimizedTotal,
      worstTotal,
      saved
    };
  };

  const globalSavings = getOverallGlobalSavingsStats();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-6 font-sans antialiased" id="cota-obra-root">
      {/* Visual Header bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-1 px-1.5 bg-amber-500 rounded-lg text-slate-900 font-extrabold flex items-center justify-center transform hover:rotate-6 transition-transform">
              <HardHat className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight uppercase">CotaObra</h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-widest hidden sm:inline-block">
                  PWA Mobile
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Filtro de Material de Construção</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global savings badge widget */}
            {globalSavings && globalSavings.saved > 0 && (
              <div className="hidden sm:flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-xl animate-pulse">
                <span>Economia estimada: {formatCurrency(globalSavings.saved)}</span>
              </div>
            )}

            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Configurações e Backup"
              id="btn-settings-toggle"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        
        {/* Top Active summary stats cards banner */}
        {globalSavings && globalSavings.saved > 0 && activeTab === 'matrix' && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in shadow-3xs">
            <div className="space-y-0.5">
              <span className="text-[10px] bg-amber-500 text-slate-900 font-black uppercase tracking-wider px-2 py-0.5 rounded-sm">
                Aviso de Otimização
              </span>
              <h3 className="text-xs font-bold text-slate-800 mt-1">
                Você pode economizar até <span className="text-emerald-700 font-black">{formatCurrency(globalSavings.saved)}</span> nesta etapa!
              </h3>
              <p className="text-2xs text-slate-600 leading-normal">
                Comprando os materiais nos depósitos/fornecedores corretos de acordo com a lista ativa.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('report')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-500 text-2xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              id="kpi-banner-action"
            >
              Ver divisão por Loja
            </button>
          </div>
        )}

        {/* Global Settings / Backup Dialog Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="settings-backup-modal">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-sm uppercase">Configurações & Backup</h3>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-white text-md font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-5">
                {backupMessage && (
                  <div className={`p-3 rounded-lg text-xs font-bold text-center ${
                    backupMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {backupMessage.text}
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Armazenamento Local</h4>
                  <p className="text-2xs text-slate-500 leading-relaxed">
                    Seus dados estão sendo guardados com segurança de forma 100% offline no seu navegador (localStorage).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleExportBackup}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                    id="btn-export-backup"
                  >
                    <Download className="w-5 h-5 text-amber-600" />
                    <span>Exportar Backup (.json)</span>
                  </button>

                  <label 
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <Upload className="w-5 h-5 text-amber-600" />
                    <span>Importar Backup (.json)</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleImportBackup} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div className="space-y-0.5 text-left">
                      <span className="text-2xs font-extrabold text-red-850 uppercase block">Área de Limpeza Total</span>
                      <p className="text-[10px] text-red-700 leading-normal">
                        Deseja reiniciar a aplicação apagando toda a base histórica e de materiais de demonstração?
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleResetData}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    id="btn-reset-app-data"
                  >
                    <RefreshCw className="w-4 h-4" /> Redefinir Toda a Aplicação
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selection Capsule Header (Desktop view) */}
        <div className="hidden md:flex bg-white p-1 rounded-xl border border-slate-100 shadow-3xs" id="nav-desktop-container">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex-1 py-3 text-xs font-black transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'matrix' ? 'bg-slate-900 text-amber-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-4 h-4" /> COMPARAR PREÇOS
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`flex-1 py-3 text-xs font-black transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'lists' ? 'bg-slate-900 text-amber-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" /> LISTA DE COMPRAS
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-3 text-xs font-black transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'report' ? 'bg-slate-900 text-amber-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4" /> RELATÓRIO DE ECONOMIA
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs font-black transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'history' ? 'bg-slate-900 text-amber-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> HISTÓRICO DE PREÇOS
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-xs font-black transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'register' ? 'bg-slate-900 text-amber-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" /> CADASTROS GERAIS
          </button>
        </div>

        {/* ACTIVE TAB VIEWS ROUTING */}
        <div className="pb-12 md:pb-0" id="current-tab-view-box">
          {activeTab === 'matrix' && (
            <PriceMatrix
              materials={materials}
              suppliers={suppliers}
              quotes={quotes}
              onUpdateQuote={handleUpdateQuote}
              onAddMaterial={() => setActiveTab('register')}
              onAddSupplier={() => setActiveTab('register')}
            />
          )}

          {activeTab === 'lists' && (
            <ShoppingLists
              materials={materials}
              quotes={quotes}
              shoppingLists={shoppingLists}
              activeListId={activeListId}
              onSetShoppingLists={handleSetShoppingLists}
              onSetActiveListId={setActiveListId}
            />
          )}

          {activeTab === 'report' && (
            <SavingsReport
              materials={materials}
              suppliers={suppliers}
              quotes={quotes}
              shoppingLists={shoppingLists}
              activeListId={activeListId}
              onChangeActiveList={setActiveListId}
            />
          )}

          {activeTab === 'history' && (
            <HistoryViewer
              materials={materials}
              suppliers={suppliers}
              history={history}
              onAddHistoryEntry={handleAddHistoryEntry}
              onDeleteHistoryEntry={handleDeleteHistoryEntry}
            />
          )}

          {activeTab === 'register' && (
            <RegistrationManager
              materials={materials}
              suppliers={suppliers}
              quotes={quotes}
              onSetMaterials={handleSetMaterials}
              onSetSuppliers={handleSetSuppliers}
              onSetQuotes={handleSetQuotes}
              onSetShoppingLists={handleSetShoppingLists}
              shoppingLists={shoppingLists}
            />
          )}
        </div>
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR TAB (Specially Optimized for Mobile PWA) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 py-2.5 px-3 flex justify-around items-center z-45 shadow-lg select-none" id="nav-mobile-bottom-bar">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'matrix' ? 'text-amber-500 font-extrabold' : 'text-slate-400'
          }`}
          id="btn-tab-matrix"
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Comparador</span>
        </button>

        <button
          onClick={() => setActiveTab('lists')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'lists' ? 'text-amber-500 font-extrabold' : 'text-slate-400'
          }`}
          id="btn-tab-lists"
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Quantidades</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'report' ? 'text-amber-500 font-extrabold' : 'text-slate-400'
          }`}
          id="btn-tab-report"
        >
          <Smartphone className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] tracking-tight">Relatório %</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'history' ? 'text-amber-500 font-extrabold' : 'text-slate-400'
          }`}
          id="btn-tab-history"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Histórico</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'register' ? 'text-amber-500 font-extrabold' : 'text-slate-400'
          }`}
          id="btn-tab-register"
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Cadastro</span>
        </button>
      </nav>

      {/* Sticky Bottom Footer (Desktop only) */}
      <footer className="hidden md:block py-6 bg-slate-900 text-slate-500 text-xs text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400">CotaObra — Ferramenta Digital de Orçamento & Comparação de Preços Industriais</p>
          <p className="text-3xs text-slate-600">Aplicação Progressive Web App offline-first. Licença Apache 2.0.</p>
        </div>
      </footer>
    </div>
  );
}
