import React, { useState } from 'react';
import { Material, Supplier, Quote, Category, MATERIAL_CATEGORIES, MATERIAL_UNITS } from '../types';
import { Plus, Trash2, Building2, HardHat, FileText, Phone, MapPin, Tag, Search } from 'lucide-react';

interface RegistrationManagerProps {
  materials: Material[];
  suppliers: Supplier[];
  quotes: Quote[];
  onSetMaterials: (materials: Material[]) => void;
  onSetSuppliers: (suppliers: Supplier[]) => void;
  onSetQuotes: (quotes: Quote[]) => void;
  onSetShoppingLists: (lists: any[]) => void;
  shoppingLists: any[];
}

export default function RegistrationManager({
  materials,
  suppliers,
  quotes,
  onSetMaterials,
  onSetSuppliers,
  onSetQuotes,
  onSetShoppingLists,
  shoppingLists
}: RegistrationManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'materials' | 'suppliers'>('materials');

  // Materials Form State
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<Category>('Básico e Alvenaria');
  const [itemUnit, setItemUnit] = useState('un');
  const [itemNotes, setItemNotes] = useState('');
  const [matSearch, setMatSearch] = useState('');

  // Suppliers Form State
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supSearch, setSupSearch] = useState('');

  // Handle material creation
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newMaterial: Material = {
      id: 'm_' + Date.now(),
      name: itemName.trim(),
      category: itemCategory,
      unit: itemUnit,
      notes: itemNotes.trim() || undefined
    };

    onSetMaterials([newMaterial, ...materials]);
    
    // Clear form
    setItemName('');
    setItemNotes('');
  };

  // Handle supplier creation
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    const newSupplier: Supplier = {
      id: 's_' + Date.now(),
      name: supName.trim(),
      phone: supPhone.trim() || undefined,
      address: supAddress.trim() || undefined
    };

    onSetSuppliers([newSupplier, ...suppliers]);

    // Clear form
    setSupName('');
    setSupPhone('');
    setSupAddress('');
  };

  // Delete material (and clean quotes/shoppinglists)
  const handleDeleteMaterial = (id: string, name: string) => {
    if (confirm(`Excluir o material "${name}" removerá também todas as cotações dele registradas e removerá o item de suas listas de compras. Confirma?`)) {
      onSetMaterials(materials.filter(m => m.id !== id));
      onSetQuotes(quotes.filter(q => q.materialId !== id));

      // Clean shopping lists
      const updatedLists = shoppingLists.map(list => ({
        ...list,
        items: list.items.filter((item: any) => item.materialId !== id)
      }));
      onSetShoppingLists(updatedLists);
    }
  };

  // Delete supplier (and clean quotes)
  const handleDeleteSupplier = (id: string, name: string) => {
    if (confirm(`Excluir o fornecedor "${name}" removerá também todos os preços cotados nesta loja. Confirma?`)) {
      onSetSuppliers(suppliers.filter(s => s.id !== id));
      onSetQuotes(quotes.filter(q => q.supplierId !== id));
    }
  };

  // Filtering materials list for view table
  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(matSearch.toLowerCase()) || m.category.toLowerCase().includes(matSearch.toLowerCase())
  );

  // Filtering suppliers list for view table
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(supSearch.toLowerCase()) || 
    (s.address && s.address.toLowerCase().includes(supSearch.toLowerCase()))
  );

  return (
    <div className="space-y-4" id="registrations-module">
      {/* Sub tabs switches */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
        <button
          onClick={() => setActiveSubTab('materials')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'materials'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="btn-subtab-materials"
        >
          <HardHat className="w-4 h-4 text-amber-500" /> Cadastrar Materiais
        </button>
        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'suppliers'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          id="btn-subtab-suppliers"
        >
          <Building2 className="w-4 h-4 text-amber-500" /> Cadastrar Lojas
        </button>
      </div>

      {activeSubTab === 'materials' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="subview-materials">
          {/* Add material card form panel */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs h-fit">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">
              Novo Material de Construção
            </h3>

            <form onSubmit={handleAddMaterial} className="space-y-3">
              <div>
                <label className="block text-4xs uppercase tracking-widest font-bold text-slate-400 mb-1">Nome do Material</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cimento CP-III 50kg"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-850 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  id="reg-material-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-4xs uppercase tracking-widest font-bold text-slate-400 mb-1">Categoria</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as Category)}
                    className="w-full bg-slate-50 text-slate-850 text-xs px-2 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                    id="reg-material-cat"
                  >
                    {MATERIAL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-4xs uppercase tracking-widest font-bold text-slate-400 mb-1">Unidade</label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full bg-slate-50 text-slate-850 text-xs px-2 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                    id="reg-material-unit"
                  >
                    {MATERIAL_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-4xs uppercase tracking-widest font-bold text-slate-400 mb-1">Observações (Opcional)</label>
                <textarea
                  placeholder="Especificação, marca preferencial..."
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full bg-slate-50 text-slate-850 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500 h-16 resize-none"
                  id="reg-material-notes"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                id="reg-material-submit"
              >
                <Plus className="w-4 h-4" /> Salvar Material
              </button>
            </form>
          </div>

          {/* List and manage materials panel */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs md:col-span-2 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Catálogo de Materiais Cadastrados ({materials.length})
              </h3>

              <div className="relative w-40 sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={matSearch}
                  onChange={(e) => setMatSearch(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-2xs pl-8 pr-2 py-1.5 rounded-md border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  id="reg-material-search"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {filteredMaterials.map(mat => (
                <div key={mat.id} className="py-2.5 flex justify-between items-center text-xs gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-1.5 py-0.2 rounded-xs bg-slate-100 text-[9px] uppercase font-bold text-slate-500">
                      {mat.category}
                    </span>
                    <h4 className="font-bold text-slate-800 mt-0.5">{mat.name}</h4>
                    <p className="text-[10px] text-slate-400">Unidade de compra: <span className="font-medium text-slate-600 font-mono uppercase">{mat.unit}</span></p>
                    {mat.notes && <p className="text-2xs italic text-slate-400 mt-0.5">{mat.notes}</p>}
                  </div>

                  <button
                    onClick={() => handleDeleteMaterial(mat.id, mat.name)}
                    className="p-1 px-2.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-md text-red-600 text-2xs font-bold transition-all hover:scale-102 cursor-pointer whitespace-nowrap"
                    id={`btn-del-mat-${mat.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {filteredMaterials.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic">
                  Nenhum material cadastrado correspondente à pesquisa.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="subview-suppliers">
          {/* Add supplier card form panel */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs h-fit">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">
              Nova Loja ou Fornecedor
            </h3>

            <form onSubmit={handleAddSupplier} className="space-y-3">
              <div>
                <label className="block text-4xs uppercase tracking-widest font-bold text-slate-400 mb-1">Nome da Loja</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Comercial Hidráulica Silva"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  id="reg-supplier-name"
                />
              </div>

              <div>
                <label className="block text-4xs uppercase tracking-widest font-bold text-slate-400 mb-1">Telefone (Opcional)</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    type="tel"
                    placeholder="Ex: (11) 98765-4321"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500"
                    id="reg-supplier-phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-4xs uppercase tracking-widest font-bold text-slate-400 mb-1">Endereço (Opcional)</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 text-slate-400 w-3.5 h-3.5" />
                  <input
                    placeholder="Ex: Rua das Cores, 120"
                    value={supAddress}
                    onChange={(e) => setSupAddress(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500"
                    id="reg-supplier-address"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                id="reg-supplier-submit"
              >
                <Plus className="w-4 h-4" /> Salvar Loja
              </button>
            </form>
          </div>

          {/* List and manage suppliers panel */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs md:col-span-2 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Fornecedores Cadastrados ({suppliers.length})
              </h3>

              <div className="relative w-40 sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={supSearch}
                  onChange={(e) => setSupSearch(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-2xs pl-8 pr-2 py-1.5 rounded-md border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  id="reg-supplier-search"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {filteredSuppliers.map(sup => (
                <div key={sup.id} className="py-2.5 flex justify-between items-center text-xs gap-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="font-bold text-slate-800">{sup.name}</h4>
                    {sup.phone && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {sup.phone}
                      </p>
                    )}
                    {sup.address && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {sup.address}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                    className="p-1 px-2.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-md text-red-600 text-2xs font-bold transition-all hover:scale-102 cursor-pointer whitespace-nowrap"
                    id={`btn-del-sup-${sup.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {filteredSuppliers.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic">
                  Nenhum fornecedor cadastrado correspondente à pesquisa.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
