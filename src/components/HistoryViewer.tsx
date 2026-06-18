import React, { useState } from 'react';
import { Material, Supplier, PriceHistoryEntry } from '../types';
import { formatCurrency } from '../utils';
import { LineChart, Calendar, TrendingUp, TrendingDown, Plus, Trash2, Sliders, ListFilter } from 'lucide-react';

interface HistoryViewerProps {
  materials: Material[];
  suppliers: Supplier[];
  history: PriceHistoryEntry[];
  onAddHistoryEntry: (materialId: string, supplierId: string, price: number, date: string) => void;
  onDeleteHistoryEntry: (id: string) => void;
}

export default function HistoryViewer({
  materials,
  suppliers,
  history,
  onAddHistoryEntry,
  onDeleteHistoryEntry
}: HistoryViewerProps) {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || '');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');

  // Log simple manually updated history point state
  const [newPrice, setNewPrice] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  // Read filtered history entries
  const filteredHistory = history
    .filter(h => h.materialId === selectedMaterialId && h.supplierId === selectedSupplierId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleLogManualHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId || !selectedSupplierId) return;

    const priceVal = parseFloat(newPrice.replace(',', '.'));
    if (isNaN(priceVal) || priceVal <= 0) {
      alert("Por favor, insira um preço válido maior que zero.");
      return;
    }

    onAddHistoryEntry(selectedMaterialId, selectedSupplierId, priceVal, newDate);
    setNewPrice('');
  };

  // Determine pricing trends metrics
  const getTrendStats = () => {
    if (filteredHistory.length < 2) return null;
    const first = filteredHistory[0].price;
    const last = filteredHistory[filteredHistory.length - 1].price;
    const diff = last - first;
    const percentage = (diff / first) * 100;
    const isUp = diff > 0;

    return {
      diff,
      percentage,
      isUp,
      min: Math.min(...filteredHistory.map(h => h.price)),
      max: Math.max(...filteredHistory.map(h => h.price))
    };
  };

  const trendStats = getTrendStats();

  // Create SVG drawing dimensions for custom trend line chart
  const drawChart = () => {
    if (filteredHistory.length === 0) return null;

    const width = 500;
    const height = 180;
    const padding = 30;

    const prices = filteredHistory.map(h => h.price);
    const minPrice = Math.min(...prices) * 0.9; // give some bottom spacing
    const maxPrice = Math.max(...prices) * 1.1; // give some top spacing
    const priceRange = maxPrice - minPrice || 1;

    const points = filteredHistory.map((h, i) => {
      const x = padding + (i / (filteredHistory.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - ((h.price - minPrice) / priceRange) * (height - padding * 2);
      return { x, y, ...h };
    });

    // Build SVG polyline path
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : '';

    return { width, height, padding, points, pathD, areaD, minPrice, maxPrice };
  };

  const chartData = drawChart();
  const activeMaterial = materials.find(m => m.id === selectedMaterialId);
  const activeSupplier = suppliers.find(s => s.id === selectedSupplierId);

  return (
    <div className="space-y-4" id="history-viewer-module">
      {/* Filtering selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Escolha o Material de Construção
          </label>
          <select
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            className="w-full bg-slate-50 text-slate-850 font-semibold px-3 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 cursor-pointer"
            id="history-material-select"
          >
            {materials.map(mat => (
              <option key={mat.id} value={mat.id}>
                [{mat.category}] {mat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-2xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Selecione o Fornecedor / Loja
          </label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="w-full bg-slate-50 text-slate-850 font-semibold px-3 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 cursor-pointer"
            id="history-supplier-select"
          >
            {suppliers.map(sup => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Visual trend card */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-start pb-2 border-b border-slate-100">
            <div>
              <span className="block text-3xs font-bold text-slate-400 uppercase tracking-wider">Histórico Gráfico</span>
              <h4 className="font-bold text-slate-800 text-xs mt-0.5">
                Flutuação de Preço: {activeMaterial?.name} ({activeSupplier?.name})
              </h4>
            </div>

            {/* Micro trends tags status */}
            {trendStats && (
              <div className={`p-1 px-2.5 rounded-lg text-2xs font-bold flex items-center gap-1 leading-none ${
                trendStats.isUp 
                  ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}>
                {trendStats.isUp ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" /> Alta de +{trendStats.percentage.toFixed(1)}%
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" /> Baixa de {trendStats.percentage.toFixed(1)}%
                  </>
                )}
              </div>
            )}
          </div>

          {/* SVG Graphical drawing area */}
          {filteredHistory.length === 0 ? (
            <div className="h-48 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 flex flex-col justify-center items-center p-6 text-center">
              <LineChart className="w-10 h-10 text-slate-300 mb-1" />
              <p className="text-xs font-bold text-slate-500">Histórico de preços escasso</p>
              <p className="text-2xs text-slate-400 mt-1 max-w-xs">
                Não há registros históricos de preços cadastrados para este material neste fornecedor específico. Insira um preço na aba de orçamentos para iniciar sua linha do tempo automaticamente, ou adicione retroativamente no painel ao lado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Plot stats indexes */}
              {trendStats && (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center border border-slate-100">
                  <div>
                    <span className="block text-4xs uppercase text-slate-400 font-bold">Preço Inicial</span>
                    <span className="text-xs font-bold text-slate-700">{formatCurrency(filteredHistory[0].price)}</span>
                  </div>
                  <div>
                    <span className="block text-4xs uppercase text-slate-400 font-bold">Menor Valor</span>
                    <span className="text-xs font-bold text-emerald-600">{formatCurrency(trendStats.min)}</span>
                  </div>
                  <div>
                    <span className="block text-4xs uppercase text-slate-400 font-bold">Maior Valor</span>
                    <span className="text-xs font-bold text-rose-600">{formatCurrency(trendStats.max)}</span>
                  </div>
                </div>
              )}

              {/* Real SVG viewport drawing */}
              {chartData && (
                <div className="relative w-full overflow-hidden" id="svg-trendline-box">
                  <svg 
                    viewBox={`0 0 ${chartData.width} ${chartData.height}`} 
                    className="w-full h-auto text-amber-500 stroke-current font-semibold"
                  >
                    {/* Background Grid Lines guidelines */}
                    <line 
                      x1={chartData.padding} 
                      y1={chartData.height - chartData.padding} 
                      x2={chartData.width - chartData.padding} 
                      y2={chartData.height - chartData.padding} 
                      stroke="#e2e8f0" 
                      strokeWidth="1"
                    />
                    <line 
                      x1={chartData.padding} 
                      y1={chartData.padding} 
                      x2={chartData.width - chartData.padding} 
                      y2={chartData.padding} 
                      stroke="#f1f5f9" 
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />

                    {/* Shaded Area fill accent */}
                    {chartData.areaD && (
                      <path 
                        d={chartData.areaD} 
                        fill="url(#amber-grad)" 
                        stroke="none"
                      />
                    )}

                    {/* Gradient bounds definitions */}
                    <defs>
                      <linearGradient id="amber-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Connecting Stroke path line */}
                    <path 
                      d={chartData.pathD} 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                    />

                    {/* Dots representing data points */}
                    {chartData.points.map((p, i) => (
                      <g key={p.id}>
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="5" 
                          fill="#f59e0b" 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                        />
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          fill="#1e293b"
                          fontSize="9"
                          fontWeight="bold"
                          stroke="none"
                        >
                          R$ {p.price.toFixed(1)}
                        </text>
                        {/* Date under axes */}
                        <text
                          x={p.x}
                          y={chartData.height - 10}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="8"
                          fontWeight="medium"
                          stroke="none"
                        >
                          {p.date.split('-').slice(1).reverse().join('/')}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right timeline log list input panel */}
        <div className="space-y-3">
          {/* Manual Entry Form */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registrar Ponto Retroativo
            </h4>

            <form onSubmit={handleLogManualHistory} className="space-y-3">
              <div>
                <label className="block text-4xs font-bold text-slate-400 uppercase mb-1">Valor do Material (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 34,90"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  id="hist-manual-price"
                />
              </div>

              <div>
                <label className="block text-4xs font-bold text-slate-400 uppercase mb-1">Data da Cotação Anterior</label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden"
                  id="hist-manual-date"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                id="hist-manual-submit"
              >
                Salvar no Histórico
              </button>
            </form>
          </div>

          {/* Table representing all raw lists of histories */}
          {filteredHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="bg-slate-50/50 p-3 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registros de Cotação</span>
              </div>
              
              <div className="divide-y divide-slate-100 text-xs max-h-44 overflow-y-auto">
                {filteredHistory.slice().reverse().map(h => (
                  <div key={h.id} className="p-2.5 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{formatCurrency(h.price)}</span>
                        <span className="text-3xs text-slate-400 font-mono">
                          {h.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteHistoryEntry(h.id)}
                      className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
