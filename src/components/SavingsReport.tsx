import React, { useState } from 'react';
import { Material, Supplier, Quote, ShoppingList } from '../types';
import { formatCurrency, getCheapestQuote } from '../utils';
import { Share2, Copy, Send, HelpCircle, ArrowUpRight, Check, Award, Percent, Building2, ShoppingBag } from 'lucide-react';

interface SavingsReportProps {
  materials: Material[];
  suppliers: Supplier[];
  quotes: Quote[];
  shoppingLists: ShoppingList[];
  activeListId: string;
  onChangeActiveList: (id: string) => void;
}

export default function SavingsReport({
  materials,
  suppliers,
  quotes,
  shoppingLists,
  activeListId,
  onChangeActiveList
}: SavingsReportProps) {
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);

  const activeList = shoppingLists.find(l => l.id === activeListId) || shoppingLists[0];

  if (!activeList) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-slate-100 p-6 shadow-xs">
        <ShoppingBag className="mx-auto w-12 h-12 text-slate-300 mb-2" />
        <h3 className="font-semibold text-slate-700">Nenhuma Lista de Compras Secionada</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Crie ou selecione uma lista de compras para gerar o relatório estratégico de melhores preços.
        </p>
      </div>
    );
  }

  // Helper inside report to map quotes easily
  const getMaterialPrice = (materialId: string, supplierId: string): number => {
    const q = quotes.find(quote => quote.materialId === materialId && quote.supplierId === supplierId);
    return q && q.price > 0 ? q.price : 0;
  };

  // Calculations for Each Store (Buying EVERYTHING at one single store)
  const storeTotals = suppliers.map(supplier => {
    let total = 0;
    let itemsFoundCount = 0;
    let missingItemsCount = 0;

    activeList.items.forEach(item => {
      const price = getMaterialPrice(item.materialId, supplier.id);
      if (price > 0) {
        total += price * item.quantity;
        itemsFoundCount++;
      } else {
        missingItemsCount++;
      }
    });

    return {
      supplier,
      total,
      itemsFoundCount,
      missingItemsCount,
      isFullyQuoted: missingItemsCount === 0
    };
  });

  // Calculate optimized split buying strategy (Buying each item where it's absolute cheapest)
  let optimizedTotal = 0;
  const optimizedAssignments: { 
    supplierId: string; 
    supplierName: string;
    materialId: string; 
    materialName: string; 
    quantity: number; 
    unit: string;
    price: number; 
    itemTotal: number;
  }[] = [];

  const unquotedItems: { materialId: string; materialName: string }[] = [];

  activeList.items.forEach(item => {
    const material = materials.find(m => m.id === item.materialId);
    if (!material) return;

    const cheapest = getCheapestQuote(item.materialId, quotes);

    if (cheapest && cheapest.price > 0) {
      const supplier = suppliers.find(s => s.id === cheapest.supplierId);
      const itemTotal = cheapest.price * item.quantity;
      optimizedTotal += itemTotal;

      optimizedAssignments.push({
        supplierId: cheapest.supplierId,
        supplierName: supplier?.name || 'Desconhecido',
        materialId: item.materialId,
        materialName: material.name,
        quantity: item.quantity,
        unit: material.unit,
        price: cheapest.price,
        itemTotal
      });
    } else {
      unquotedItems.push({
        materialId: item.materialId,
        materialName: material.name
      });
    }
  });

  // Calculate potential savings (buying optimized vs the most expensive full store)
  const validFullStores = storeTotals.filter(s => s.itemsFoundCount > 0);
  const highestTotalStore = validFullStores.length > 0 
    ? validFullStores.reduce((prev, curr) => prev.total > curr.total ? prev : curr)
    : null;

  const lowestSingleStore = validFullStores.length > 0
    ? validFullStores.reduce((prev, curr) => (prev.total > 0 && prev.total < curr.total) ? prev : curr)
    : null;

  const maxSavingsAmount = highestTotalStore && optimizedTotal > 0
    ? highestTotalStore.total - optimizedTotal
    : 0;

  // Group assignments by supplier
  const assignmentsBySupplier = suppliers.map(supplier => {
    const itemsGroup = optimizedAssignments.filter(a => a.supplierId === supplier.id);
    const groupTotal = itemsGroup.reduce((sum, item) => sum + item.itemTotal, 0);

    return {
      supplier,
      items: itemsGroup,
      total: groupTotal
    };
  }).filter(group => group.items.length > 0);

  // Copy customized shopping message to clipboards (WhatsApp)
  const handleCopyStoreList = (supplier: Supplier, items: typeof optimizedAssignments, total: number) => {
    let text = `*Orçamento de Compra - ${supplier.name}*\n`;
    text += `_Gerado via CotaObra em ${new Date().toLocaleDateString('pt-BR')}_\n\n`;
    text += `Olá! Gostaria de verificar a disponibilidade e encomendar os seguintes materiais:\n\n`;

    items.forEach((item, index) => {
      text += `${index + 1}. *${item.materialName}* \n`;
      text += `   Qtd: ${item.quantity} ${item.unit} | Preço acordado ref: ${formatCurrency(item.price)} (Subtotal: ${formatCurrency(item.itemTotal)})\n`;
    });

    text += `\n*Valor Total de Referência:* ${formatCurrency(total)}\n`;
    text += `\nPor favor, confirmem as condições para entrega no meu endereço. Obrigado!`;

    navigator.clipboard.writeText(text);
    setCopiedStoreId(supplier.id);
    setTimeout(() => setCopiedStoreId(null), 3000);
  };

  return (
    <div className="space-y-5" id="savings-report-view">
      {/* List Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest">
            Análise para o Projeto / Etapa
          </label>
          <h3 className="font-bold text-slate-800 text-sm mt-0.5">Relatório Estratégico de Compra</h3>
        </div>

        <select
          value={activeListId}
          onChange={(e) => onChangeActiveList(e.target.value)}
          className="bg-slate-50 text-slate-800 font-semibold px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 cursor-pointer"
          id="select-active-list-report"
        >
          {shoppingLists.map(list => (
            <option key={list.id} value={list.id}>
              {list.name} ({list.items.length} itens)
            </option>
          ))}
        </select>
      </div>

      {activeList.items.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-100 p-6 shadow-xs">
          <p className="text-slate-500 text-sm font-medium">Sua lista selecionada está vazia atualmente.</p>
          <p className="text-xs text-slate-400 mt-1">Adicione itens nas abas de Lista de Compras para ver o relatório.</p>
        </div>
      ) : (
        <>
          {/* Main Saving KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Optimized Total Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-3 -translate-y-3">
                <Award className="w-28 h-28" />
              </div>
              <span className="text-2xs font-bold uppercase tracking-widest text-emerald-100 inline-block px-2 py-0.5 rounded-sm bg-emerald-600/30 mb-2">
                Compra Inteligente
              </span>
              <h4 className="text-2xs font-medium text-emerald-100 block">Total Otimizado Dividido</h4>
              <p className="text-2xl font-black mt-1">
                {formatCurrency(optimizedTotal)}
              </p>
              <span className="text-[10px] text-emerald-100/90 mt-1 block">
                Comprando cada item na loja mais barata
              </span>
            </div>

            {/* single cheapest store Total Card */}
            <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute right-2 top-2 opacity-5 text-slate-200">
                <Building2 className="w-20 h-20" />
              </div>
              <span className="text-2xs font-bold uppercase tracking-widest text-slate-300 inline-block px-2 py-0.5 rounded-sm bg-slate-700 mb-2">
                Compra Única Recomendada
              </span>
              <h4 className="text-2xs font-medium text-slate-300 block">
                {lowestSingleStore ? `${lowestSingleStore.supplier.name}` : 'Melhor Loja Única'}
              </h4>
              <p className="text-2xl font-black mt-1 text-amber-400">
                {lowestSingleStore ? formatCurrency(lowestSingleStore.total) : 'R$ 0,00'}
              </p>
              <span className="text-[10px] text-slate-300/90 mt-1 block">
                {lowestSingleStore && lowestSingleStore.missingItemsCount > 0 
                  ? `Faltam preços de ${lowestSingleStore.missingItemsCount} itens` 
                  : 'Preços de todos os materiais catalogados'}
              </span>
            </div>

            {/* Smart Savings Card */}
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl shadow-xs relative overflow-hidden">
              <span className="text-2xs font-bold uppercase tracking-widest text-orange-700 bg-orange-100 px-2 py-0.5 rounded-sm inline-block mb-2">
                Sua Economia Real
              </span>
              <h4 className="text-2xs font-medium text-slate-500 block">Diferença Potencial Máxima</h4>
              <p className="text-2xl font-black text-orange-600 mt-1">
                {formatCurrency(maxSavingsAmount)}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 inline text-orange-500" />
                Economia de {highestTotalStore && highestTotalStore.total > 0 
                  ? ((maxSavingsAmount / highestTotalStore.total) * 100).toFixed(1) 
                  : 0}% comparado à pior opção.
              </span>
            </div>
          </div>

          {/* Quick Informational Tip */}
          {unquotedItems.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-lg flex items-start gap-2">
              <span className="mt-0.5 font-bold">⚠️ Atenção:</span>
              <div>
                <span className="font-semibold block">Materiais sem cotação ({unquotedItems.length})</span>
                <p className="text-2xs text-amber-700 leading-relaxed mt-0.5">
                  Os seguintes itens não possuem preço válido e foram desconsiderados nos totais: <br/>
                  <span className="font-medium underline">
                    {unquotedItems.map(i => i.materialName).join(', ')}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Graphical Comparison Bar Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Simulador: Custo Total de Compra por Fornecedor (Tudo em uma Loja) vs Dividido
            </h4>

            <div className="space-y-3.5">
              {/* Split item (Optimized) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-emerald-700">
                  <span className="flex items-center gap-1">✨ Compra Inteligente Divina (Lojas Combinadas)</span>
                  <span>{formatCurrency(optimizedTotal)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-500 rounded-full h-3 transition-all" style={{ width: '100%' }}></div>
                </div>
                <span className="text-4xs text-slate-400 block tracking-wide">COMPRAR CADA ITEM NO SEU RESPECTIVO FORNECEDOR MAIS BARATO</span>
              </div>

              {/* Suppliers totals list */}
              {storeTotals.filter(st => st.total > 0).map(st => {
                const percentageOfOptimized = optimizedTotal > 0 ? (optimizedTotal / st.total) * 100 : 0;
                // Bar represents absolute visual cost index (Optimized width is 100%, others are wider because they cost more)
                // Let's compute inverse scale: width = (OptimizedTotal / SupplierTotal) * 100 (which will be <= 100) or
                // calculate max store total and plot relative to it.
                const maxStoreTotal = Math.max(optimizedTotal, ...storeTotals.map(s => s.total));
                const visualWidth = maxStoreTotal > 0 ? (st.total / maxStoreTotal) * 100 : 0;
                const optimizedVisualWidth = maxStoreTotal > 0 ? (optimizedTotal / maxStoreTotal) * 100 : 0;

                return (
                  <div key={st.supplier.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span className="truncate max-w-xs">{st.supplier.name}</span>
                      <span className="font-semibold">{formatCurrency(st.total)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div 
                        className="bg-slate-400 rounded-full h-3 transition-all" 
                        style={{ width: `${visualWidth}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{st.itemsFoundCount} de {activeList.items.length} itens cotados</span>
                      {st.total > optimizedTotal && (
                        <span className="text-orange-500 font-medium">+{formatCurrency(st.total - optimizedTotal)} mais caro</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Procurement Action Plan (Where to buy each material) */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Plano de Ação: Onde Comprar Cada Material
            </h3>

            {assignmentsBySupplier.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Preencha preços nas abas anteriores para visualizar as listas de distribuição por fornecedor.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {assignmentsBySupplier.map(({ supplier, items, total }) => (
                  <div key={supplier.id} className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden" id={`procure-${supplier.id}`}>
                    {/* Supplier Header */}
                    <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-amber-500" />
                          {supplier.name}
                        </h4>
                        <div className="text-[11px] text-slate-400 space-x-2 mt-0.5">
                          {supplier.phone && <span>Tel: {supplier.phone}</span>}
                          {supplier.address && <span>| End: {supplier.address}</span>}
                        </div>
                      </div>

                      {/* Export Actions for Store */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleCopyStoreList(supplier, items, total)}
                          className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg text-2xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            copiedStoreId === supplier.id
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {copiedStoreId === supplier.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copiar Pedido
                            </>
                          )}
                        </button>

                        {/* WhatsApp Web Link if Supplier has phone */}
                        {supplier.phone && (
                          <a
                            href={`https://api.whatsapp.com/send?phone=${supplier.phone.replace(/\D/g, '')}&text=${encodeURIComponent(
                              `Olá! Gostaria de fazer o orçamento/pedido dos seguintes materiais da minha obra:\n\n` +
                              items.map((i, idx) => `${idx + 1}. ${i.materialName} - Qtd: ${i.quantity} ${i.unit}`).join('\n') +
                              `\n\nPor favor, confirmem se têm em estoque e o valor de entrega.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-lg text-2xs flex items-center justify-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5 fill-current" /> Enviar Whats
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Assigned Materials List */}
                    <div className="divide-y divide-slate-100">
                      {items.map(item => (
                        <div key={item.materialId} className="p-3.5 flex justify-between items-center text-xs">
                          <div className="space-y-0.5 pr-2">
                            <span className="font-semibold text-slate-700 block">{item.materialName}</span>
                            <span className="text-slate-400 text-2xs font-medium">
                              Quantidade: {item.quantity} {item.unit} × {formatCurrency(item.price)}
                            </span>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span className="font-bold text-slate-800 text-sm">{formatCurrency(item.itemTotal)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Group Total bar footer */}
                    <div className="bg-slate-50/50 p-3.5 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal nesta loja:</span>
                      <span className="font-black text-slate-800 text-base">{formatCurrency(total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
