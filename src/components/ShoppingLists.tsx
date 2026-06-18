import React, { useState } from 'react';
import { Material, Supplier, Quote, ShoppingList, ShoppingListItem } from '../types';
import { formatCurrency, getCheapestQuote } from '../utils';
import { Plus, Minus, Trash2, Tag, Layers, FolderPlus, ListChecks, DollarSign } from 'lucide-react';

interface ShoppingListsProps {
  materials: Material[];
  quotes: Quote[];
  shoppingLists: ShoppingList[];
  activeListId: string;
  onSetShoppingLists: (lists: ShoppingList[]) => void;
  onSetActiveListId: (id: string) => void;
}

export default function ShoppingLists({
  materials,
  quotes,
  shoppingLists,
  activeListId,
  onSetShoppingLists,
  onSetActiveListId
}: ShoppingListsProps) {
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [selectedMaterialToAdd, setSelectedMaterialToAdd] = useState('');
  const [tempQty, setTempQty] = useState('10');

  const activeList = shoppingLists.find(l => l.id === activeListId) || shoppingLists[0];

  // Create a new empty list/project
  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const newList: ShoppingList = {
      id: 'list_' + Date.now(),
      name: newListName.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      items: []
    };

    const updated = [...shoppingLists, newList];
    onSetShoppingLists(updated);
    onSetActiveListId(newList.id);
    setNewListName('');
    setIsAddingList(false);
  };

  // Delete matching active list
  const handleDeleteActiveList = () => {
    if (shoppingLists.length <= 1) {
      alert("Você deve manter pelo menos uma Lista de Compras ativa.");
      return;
    }
    if (confirm(`Tem certeza que deseja apagar a lista "${activeList?.name}"? Isso apagará todos os quantitativos salva nela.`)) {
      const remaining = shoppingLists.filter(l => l.id !== activeList.id);
      onSetShoppingLists(remaining);
      onSetActiveListId(remaining[0].id);
    }
  };

  // Add material to active list
  const handleAddMaterialToList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialToAdd || !activeList) return;

    const qty = parseInt(tempQty);
    if (isNaN(qty) || qty <= 0) return;

    const existingItemIdx = activeList.items.findIndex(item => item.materialId === selectedMaterialToAdd);
    let updatedItems = [...activeList.items];

    if (existingItemIdx >= 0) {
      // Update quantity
      updatedItems[existingItemIdx] = {
        ...updatedItems[existingItemIdx],
        quantity: updatedItems[existingItemIdx].quantity + qty
      };
    } else {
      // Add new
      updatedItems.push({
        materialId: selectedMaterialToAdd,
        quantity: qty
      });
    }

    const updatedLists = shoppingLists.map(list => {
      if (list.id === activeList.id) {
        return { ...list, items: updatedItems };
      }
      return list;
    });

    onSetShoppingLists(updatedLists);
    setSelectedMaterialToAdd('');
    setTempQty('10');
  };

  // Update item quantity directly
  const handleUpdateItemQty = (materialId: string, delta: number) => {
    if (!activeList) return;

    const updatedItems = activeList.items.map(item => {
      if (item.materialId === materialId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    });

    const updatedLists = shoppingLists.map(list => {
      if (list.id === activeList.id) {
        return { ...list, items: updatedItems };
      }
      return list;
    });

    onSetShoppingLists(updatedLists);
  };

  // Remove material from list completely
  const handleRemoveItem = (materialId: string) => {
    if (!activeList) return;

    const updatedItems = activeList.items.filter(item => item.materialId !== materialId);
    
    const updatedLists = shoppingLists.map(list => {
      if (list.id === activeList.id) {
        return { ...list, items: updatedItems };
      }
      return list;
    });

    onSetShoppingLists(updatedLists);
  };

  // Calculate estimated costs
  const getCheapestInfo = (materialId: string) => {
    return getCheapestQuote(materialId, quotes);
  };

  // Available materials not already in the active list (for select dropdown helper)
  const materialsNotAdded = materials.filter(
    mat => !activeList?.items.some(item => item.materialId === mat.id)
  );

  return (
    <div className="space-y-4" id="shopping-lists-module">
      {/* List choosing and management */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest">
            Lista de Compras Selecionada
          </label>
          <span className="text-2xs text-slate-400 font-mono">
            Criada em: {activeList?.createdAt}
          </span>
        </div>

        <div className="flex gap-2.5">
          <select
            value={activeListId}
            onChange={(e) => onSetActiveListId(e.target.value)}
            className="flex-1 bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            id="shopping-list-dropdown"
          >
            {shoppingLists.map(list => (
              <option key={list.id} value={list.id}>
                {list.name} ({list.items.length} materiais)
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddingList(!isAddingList)}
            className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            id="btn-add-new-list-toggle"
          >
            <FolderPlus className="w-4 h-4" /> Nova Lista
          </button>
        </div>

        {/* Create List form inline */}
        {isAddingList && (
          <form onSubmit={handleCreateList} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Criar Nova Etapa/Projeto</h4>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Ex: Reforma Banheiro, Fundação Casa..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="flex-1 bg-white text-xs text-slate-800 py-2 px-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500"
                id="new-list-name-input"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>

      {activeList && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main items panel */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 space-y-4 md:col-span-2">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-amber-500" />
                Materiais na Lista: {activeList.name}
              </h3>

              <button
                onClick={handleDeleteActiveList}
                className="p-1 px-2.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md text-2xs text-red-600 font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Excluir Lista
              </button>
            </div>

            {/* Form to insert material into current active list */}
            {materialsNotAdded.length > 0 ? (
              <form onSubmit={handleAddMaterialToList} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Adicionar Material</label>
                  <select
                    value={selectedMaterialToAdd}
                    onChange={(e) => setSelectedMaterialToAdd(e.target.value)}
                    required
                    className="w-full bg-white text-slate-800 text-xs rounded-lg border border-slate-200 p-2 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                    id="add-to-list-material-select"
                  >
                    <option value="">Selecione um material...</option>
                    {materialsNotAdded.map(mat => (
                      <option key={mat.id} value={mat.id}>
                        [{mat.category}] {mat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={tempQty}
                    onChange={(e) => setTempQty(e.target.value)}
                    className="w-full bg-white text-slate-800 text-xs rounded-lg border border-slate-200 p-2 focus:outline-hidden focus:border-amber-500"
                    id="add-to-list-qty-input"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    id="btn-add-material-to-list-submit"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </form>
            ) : materials.length > 0 ? (
              <p className="text-2xs text-slate-400 py-1 border-dashed border border-slate-200 text-center rounded-lg leading-relaxed">
                🎉 Todos os materiais cadastrados já foram adicionados a esta lista!
              </p>
            ) : null}

            {/* List items render */}
            {activeList.items.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-500 italic">Sua lista está vazia.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Utilize o formulário acima para adicionar materiais e quantitativos.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeList.items.map(listItem => {
                  const material = materials.find(m => m.id === listItem.materialId);
                  if (!material) return null;

                  const cheapestInfo = getCheapestInfo(material.id);
                  const hasCheapest = cheapestInfo !== null;

                  return (
                    <div key={listItem.materialId} className="py-3 flex justify-between items-center gap-3" id={`listitem-${material.id}`}>
                      {/* Name & metadata */}
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-500 text-[9px] uppercase font-semibold mb-0.5">
                          {material.category}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-xs truncate">{material.name}</h4>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Melhor preço ref: </span>
                          <span className={`font-medium ${hasCheapest ? 'text-emerald-600' : 'text-slate-400 italic'}`}>
                            {hasCheapest ? `${formatCurrency(cheapestInfo!.price)}` : 'Sem cotação'}
                          </span>
                        </div>
                      </div>

                      {/* Quantity adjusting controls */}
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleUpdateItemQty(listItem.materialId, -1)}
                          className="w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-full flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="flex flex-col items-center min-w-10">
                          <span className="text-xs font-black text-slate-800">{listItem.quantity}</span>
                          <span className="text-[9px] text-slate-400 text-center lowercase leading-none">{material.unit}</span>
                        </div>

                        <button
                          onClick={() => handleUpdateItemQty(listItem.materialId, 1)}
                          className="w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-full flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleRemoveItem(listItem.materialId)}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Aggregate cost calculator panel widget */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 space-y-4 h-fit">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              Resumo Estimado da Lista
            </h3>

            {/* Calculate different strategies */}
            {(() => {
              let totalEst = 0;
              let quotedCount = 0;

              activeList.items.forEach(item => {
                const cheap = getCheapestInfo(item.materialId);
                if (cheap) {
                  totalEst += cheap.price * item.quantity;
                  quotedCount++;
                }
              });

              return (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Custo Otimizado Mínimo
                    </span>
                    <span className="text-2xl font-black text-emerald-600 block">
                      {formatCurrency(totalEst)}
                    </span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Considera o orçamento mais em conta de cada material cadastrado.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span>Total de materiais na lista:</span>
                      <span className="font-bold text-slate-800">{activeList.items.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span>Materiais com cotações:</span>
                      <span className="font-bold text-emerald-600">{quotedCount} de {activeList.items.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span>Sem nenhuma cotação:</span>
                      <span className="font-bold text-amber-600">{activeList.items.length - quotedCount}</span>
                    </div>
                  </div>

                  {quotedCount > 0 && (
                    <div className="pt-2">
                      <p className="text-2xs text-slate-400 leading-relaxed italic text-center">
                        💡 Vá para a aba "Relatório" para ver qual loja tem melhor custo em lote e copiar as mensagens organizadas para exportar por WhatsApp!
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
