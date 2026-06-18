import React, { useState } from 'react';
import { Material, Supplier, Quote, Category, MATERIAL_CATEGORIES } from '../types';
import { formatCurrency, getCheapestQuote } from '../utils';
import { Search, Plus, SlidersHorizontal, Store, DollarSign, Edit3, Trash2, Calendar, FileText } from 'lucide-react';

interface PriceMatrixProps {
  materials: Material[];
  suppliers: Supplier[];
  quotes: Quote[];
  onUpdateQuote: (materialId: string, supplierId: string, price: number) => void;
  onAddMaterial: () => void;
  onAddSupplier: () => void;
}

export default function PriceMatrix({
  materials,
  suppliers,
  quotes,
  onUpdateQuote,
  onAddMaterial,
  onAddSupplier
}: PriceMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const [activeEditCell, setActiveEditCell] = useState<{ materialId: string; supplierId: string } | null>(null);
  const [tempPrice, setTempPrice] = useState('');

  // Filtering materials
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (material.notes && material.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle price update submission
  const handleSubmitPrice = () => {
    if (activeEditCell) {
      const priceVal = parseFloat(tempPrice.replace(',', '.'));
      if (!isNaN(priceVal) && priceVal >= 0) {
        onUpdateQuote(activeEditCell.materialId, activeEditCell.supplierId, priceVal);
      } else if (tempPrice.trim() === '') {
        // Clear price state if empty
        onUpdateQuote(activeEditCell.materialId, activeEditCell.supplierId, 0);
      }
      setActiveEditCell(null);
      setTempPrice('');
    }
  };

  const startEditing = (materialId: string, supplierId: string, currentPrice?: number) => {
    setActiveEditCell({ materialId, supplierId });
    setTempPrice(currentPrice && currentPrice > 0 ? currentPrice.toString() : '');
  };

  return (
    <div className="space-y-4" id="price-matrix-container">
      {/* Search and Quick Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar material (ex: cimento, tubo...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"
            id="search-materials-input"
          />
        </div>

        {/* Categories Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer ${
              selectedCategory === 'Todos'
                ? 'bg-amber-500 text-slate-900 border border-amber-500'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
            id="cat-all"
          >
            Todos ({materials.length})
          </button>
          {MATERIAL_CATEGORIES.map((cat) => {
            const count = materials.filter(m => m.category === cat).length;
            if (count === 0) return null; // Only show categories with items in list
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-900 border border-amber-500'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
                id={`cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {suppliers.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-slate-100 p-6 shadow-xs">
          <Store className="mx-auto w-12 h-12 text-slate-300 mb-2" />
          <h3 className="font-medium text-slate-800">Nenhum fornecedor cadastrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Cadastre pelo menos uma loja ou depósito para começar a comparar preços.
          </p>
          <button
            onClick={onAddSupplier}
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-900 text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Cadastrar Loja
          </button>
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-slate-100 p-6 shadow-xs">
          <FileText className="mx-auto w-12 h-12 text-slate-300 mb-2" />
          <h3 className="font-medium text-slate-800">Nenhum material cadastrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Adicione os materiais que deseja pesquisar e comparar preços em sua obra.
          </p>
          <button
            onClick={onAddMaterial}
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-900 text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Cadastrar Material
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
          {/* Card view for mobile, table for desktop */}
          <div className="block lg:hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Comparativo de Materiais</span>
              <span className="text-2xs text-slate-400">Toque em cada preço para editar</span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {filteredMaterials.map(material => {
                const cheapest = getCheapestQuote(material.id, quotes);

                return (
                  <div key={material.id} className="p-4 space-y-3" id={`mobile-card-${material.id}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 text-[10px] uppercase font-bold mb-1">
                          {material.category}
                        </span>
                        <h4 className="font-medium text-slate-800 text-sm">{material.name}</h4>
                        <p className="text-xs text-slate-400">Unidade: {material.unit}</p>
                      </div>
                    </div>

                    {/* Stores prices grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                      {suppliers.map(supplier => {
                        const quote = quotes.find(q => q.materialId === material.id && q.supplierId === supplier.id);
                        const isCheapest = cheapest && quote && quote.id === cheapest.id && quote.price > 0;
                        const hasPrice = quote && quote.price > 0;

                        return (
                          <div
                            key={supplier.id}
                            onClick={() => startEditing(material.id, supplier.id, quote?.price)}
                            className={`p-2.5 rounded-lg border text-left transition-all active:scale-[98%] cursor-pointer flex justify-between items-center sm:block ${
                              isCheapest
                                ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/10'
                                : hasPrice
                                ? 'bg-slate-50 border-slate-100 hover:border-slate-200'
                                : 'bg-slate-50/40 border-dashed border-slate-200 text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="text-[10px] font-medium text-slate-400 uppercase truncate">
                                {supplier.name}
                              </span>
                              <span className={`text-xs font-bold ${isCheapest ? 'text-emerald-700' : hasPrice ? 'text-slate-700' : 'text-slate-400'}`}>
                                {hasPrice ? formatCurrency(quote!.price) : 'Sem valor'}
                              </span>
                            </div>
                            
                            {isCheapest ? (
                              <span className="px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-bold uppercase text-[9px] sm:mt-1 inline-block">
                                - barato
                              </span>
                            ) : !hasPrice ? (
                              <span className="text-[10px] text-amber-500 underline flex items-center gap-0.5 font-medium">
                                <Plus className="w-3.5 h-3.5 inline" /> Cotar
                              </span>
                            ) : (
                              <Edit3 className="w-3.5 h-3.5 text-slate-300 sm:hidden" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {filteredMaterials.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Nenhum material encontrado com os filtros atuais.
                </div>
              )}
            </div>
          </div>

          {/* Desktop Spreadsheet view */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-1/3">Material</th>
                  <th className="py-3.5 px-3 w-32 text-center">Unidade</th>
                  {suppliers.map(supplier => (
                    <th key={supplier.id} className="py-3.5 px-4 text-center border-l border-slate-100">
                      <div className="flex flex-col items-center">
                        <span className="text-slate-700 truncate max-w-40">{supplier.name}</span>
                        {supplier.phone && <span className="text-[10px] text-slate-400 font-normal">{supplier.phone}</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredMaterials.map(material => {
                  const cheapest = getCheapestQuote(material.id, quotes);

                  return (
                    <tr key={material.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{material.name}</span>
                          <span className="text-[11px] text-slate-400">{material.category}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-500 font-medium">
                        {material.unit}
                      </td>
                      {suppliers.map(supplier => {
                        const quote = quotes.find(q => q.materialId === material.id && q.supplierId === supplier.id);
                        const isCheapest = cheapest && quote && quote.id === cheapest.id && quote.price > 0;
                        const hasPrice = quote && quote.price > 0;

                        return (
                          <td
                            key={supplier.id}
                            onClick={() => startEditing(material.id, supplier.id, quote?.price)}
                            className={`py-3.5 px-4 text-center border-l border-slate-100 cursor-pointer select-none transition-colors relative group ${
                              isCheapest ? 'bg-emerald-50/70 hover:bg-emerald-50' : 'hover:bg-slate-100/60'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center">
                              {hasPrice ? (
                                <span className={`font-bold transition-all ${
                                  isCheapest ? 'text-emerald-700 text-base scale-[102%]' : 'text-slate-700 group-hover:text-amber-600'
                                }`}>
                                  {formatCurrency(quote!.price)}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs italic group-hover:text-amber-500 font-medium flex items-center gap-0.5">
                                  <Plus className="w-3.5 h-3.5" /> Adicionar
                                </span>
                              )}
                              {isCheapest && (
                                <span className="mt-0.5 px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                                  Melhor Preço
                                </span>
                              )}
                            </div>
                            {/* Hover Edit Icon indicator */}
                            {hasPrice && (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan={suppliers.length + 2} className="py-8 text-center text-slate-400 italic">
                      Nenhum material cadastrado para esta categoria ou termo de busca.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inline mobile Quote Modal/Slick Drawer */}
      {activeEditCell && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="edit-price-modal">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-100 overflow-hidden transform transition-all scale-100">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Inserir ou Editar Preço</span>
              <h3 className="font-bold text-slate-800 mt-1">
                {materials.find(m => m.id === activeEditCell.materialId)?.name}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 inline text-slate-400" />
                Loja: {suppliers.find(s => s.id === activeEditCell.supplierId)?.name}
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                  Preço em Reais (R$)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</div>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoFocus
                    placeholder="0,00"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitPrice();
                      if (e.key === 'Escape') setActiveEditCell(null);
                    }}
                    className="w-full bg-slate-50 text-slate-800 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-bold text-lg text-right"
                    id="edit-price-input"
                  />
                </div>
                <p className="text-2xs text-slate-400 mt-1.5 leading-relaxed">
                  Insira o preço atualizado para esta embalagem/unidade. Deixe em branco para apagar a cotação.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setActiveEditCell(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitPrice}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" /> Salvar Preço
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
