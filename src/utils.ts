import { Material, Supplier, Quote, ShoppingList, PriceHistoryEntry } from './types';

// Pre-populate some realistic construction materials
const DEFAULT_MATERIALS: Material[] = [
  { id: 'm1', name: 'Cimento Votoran CP II 50kg', unit: 'saco', category: 'Básico e Alvenaria', notes: 'Utilizado para fundação e reboco' },
  { id: 'm2', name: 'Areia Lavada Média (Saco 20kg)', unit: 'saco', category: 'Básico e Alvenaria', notes: 'Areia média para massa de assentamento' },
  { id: 'm3', name: 'Tijolo Cerâmico Baiano 8 Furos (19x19x9cm)', unit: 'un', category: 'Básico e Alvenaria', notes: 'Rendimento aprox 25 p/ m²' },
  { id: 'm4', name: 'Vergalhão de Aço CA-50 3/8" (10mm) - 12m', unit: 'barra', category: 'Estrutura', notes: 'Para vigas e colunas de sustentação' },
  { id: 'm5', name: 'Tubo de PVC Esgoto TIGRE 100mm - 6m', unit: 'barra', category: 'Hidráulica', notes: 'Instalação de águas pluviais ou esgoto' },
  { id: 'm6', name: 'Cabo Elétrico Flexível Sil 2.5mm² - Cemar (Rolo 100m)', unit: 'rolo', category: 'Elétrica', notes: 'Tomadas comuns' },
  { id: 'm7', name: 'Tinta Acrílica Fosca Coral Premium Branco Neve 18L', unit: 'lata', category: 'Pintura', notes: 'Rendimento excelente, baixo odor' },
  { id: 'm8', name: 'Argamassa Colante AC-III Cinza Quartzolit 20kg', unit: 'saco', category: 'Acabamento e Revestimento', notes: 'Para assentamento de porcelanato externo' }
];

// Pre-populate some local suppliers
const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Depósito ConstruFort', phone: '(11) 98888-1111', address: 'Av. das Nações, 1420 - Centro' },
  { id: 's2', name: 'Mega Home Center', phone: '(11) 97777-2222', address: 'Rodovia Raposo Tavares, km 18' },
  { id: 's3', name: 'Mundial Materiais', phone: '(11) 96666-3333', address: 'Rua das Palmeiras, 305 - Bairro Industrial' }
];

// Varying price quotes to show comparison capability
const DEFAULT_QUOTES: Quote[] = [
  // Cimento (Cheaper at s1 ConstruFort)
  { id: 'q1-1', materialId: 'm1', supplierId: 's1', price: 34.90, updatedAt: '2026-06-10' },
  { id: 'q1-2', materialId: 'm1', supplierId: 's2', price: 37.50, updatedAt: '2026-06-12' },
  { id: 'q1-3', materialId: 'm1', supplierId: 's3', price: 36.20, updatedAt: '2026-06-15' },

  // Areia (Cheaper at s3 Mundial)
  { id: 'q2-1', materialId: 'm2', supplierId: 's1', price: 9.50, updatedAt: '2026-06-10' },
  { id: 'q2-2', materialId: 'm2', supplierId: 's2', price: 10.90, updatedAt: '2026-06-12' },
  { id: 'q2-3', materialId: 'm2', supplierId: 's3', price: 8.90, updatedAt: '2026-06-15' },

  // Tijolo (Cheaper at s1 ConstruFort)
  { id: 'q3-1', materialId: 'm3', supplierId: 's1', price: 1.15, updatedAt: '2026-06-11' },
  { id: 'q3-2', materialId: 'm3', supplierId: 's2', price: 1.35, updatedAt: '2026-06-13' },
  { id: 'q3-3', materialId: 'm3', supplierId: 's3', price: 1.25, updatedAt: '2026-06-15' },

  // Vergalhao (Cheaper at s2 Mega Home)
  { id: 'q4-1', materialId: 'm4', supplierId: 's1', price: 74.50, updatedAt: '2026-06-10' },
  { id: 'q4-2', materialId: 'm4', supplierId: 's2', price: 68.90, updatedAt: '2026-06-12' },
  { id: 'q4-3', materialId: 'm4', supplierId: 's3', price: 71.00, updatedAt: '2026-06-15' },

  // Tubo (Cheaper at s3 Mundial)
  { id: 'q5-1', materialId: 'm5', supplierId: 's1', price: 54.00, updatedAt: '2026-06-08' },
  { id: 'q5-2', materialId: 'm5', supplierId: 's2', price: 47.90, updatedAt: '2026-06-11' },
  { id: 'q5-3', materialId: 'm5', supplierId: 's3', price: 43.50, updatedAt: '2026-06-15' },

  // Cabo eletrico (Cheaper at s2 Mega Home)
  { id: 'q6-1', materialId: 'm6', supplierId: 's1', price: 189.90, updatedAt: '2026-06-05' },
  { id: 'q6-2', materialId: 'm6', supplierId: 's2', price: 174.90, updatedAt: '2026-06-12' },
  { id: 'q6-3', materialId: 'm6', supplierId: 's3', price: 179.00, updatedAt: '2026-06-15' },

  // Tinta (Cheaper at s1 ConstruFort)
  { id: 'q7-1', materialId: 'm7', supplierId: 's1', price: 349.00, updatedAt: '2026-06-11' },
  { id: 'q7-2', materialId: 'm7', supplierId: 's2', price: 379.00, updatedAt: '2026-06-13' },
  { id: 'q7-3', materialId: 'm7', supplierId: 's3', price: 365.00, updatedAt: '2026-06-15' },

  // Argamassa (Cheaper at s3 Mundial)
  { id: 'q8-1', materialId: 'm8', supplierId: 's1', price: 31.90, updatedAt: '2026-06-10' },
  { id: 'q8-2', materialId: 'm8', supplierId: 's2', price: 33.50, updatedAt: '2026-06-12' },
  { id: 'q8-3', materialId: 'm8', supplierId: 's3', price: 28.50, updatedAt: '2026-06-15' }
];

// Default shopping list
const DEFAULT_SHOPPING_LISTS: ShoppingList[] = [
  {
    id: 'l1',
    name: 'Fase 1: Alvenaria e Estrutura',
    createdAt: '2026-06-14',
    items: [
      { materialId: 'm1', quantity: 20 }, // 20 sacos de cimento
      { materialId: 'm2', quantity: 50 }, // 50 sacos de areia
      { materialId: 'm3', quantity: 800 }, // 800 tijolos
      { materialId: 'm4', quantity: 12 }, // 12 vergalhoes
      { materialId: 'm8', quantity: 8 }   // 8 argamassas
    ]
  },
  {
    id: 'l2',
    name: 'Fase 2: Instalação & Acabamento',
    createdAt: '2026-06-15',
    items: [
      { materialId: 'm5', quantity: 4 },  // 4 barras tubo pvc 100mm
      { materialId: 'm6', quantity: 3 },  // 3 rolos de cabo eletrico
      { materialId: 'm7', quantity: 2 }   // 2 latas de tinta de 18L
    ]
  }
];

// Price history to play with graph
const DEFAULT_HISTORY: PriceHistoryEntry[] = [
  // Cimento history
  { id: 'h1', materialId: 'm1', supplierId: 's1', price: 32.50, date: '2026-05-15' },
  { id: 'h2', materialId: 'm1', supplierId: 's1', price: 33.90, date: '2026-05-30' },
  { id: 'h3', materialId: 'm1', supplierId: 's1', price: 34.90, date: '2026-06-10' },

  { id: 'h4', materialId: 'm1', supplierId: 's2', price: 38.00, date: '2026-05-15' },
  { id: 'h5', materialId: 'm1', supplierId: 's2', price: 37.50, date: '2026-06-12' },

  { id: 'h6', materialId: 'm1', supplierId: 's3', price: 35.90, date: '2026-05-20' },
  { id: 'h7', materialId: 'm1', supplierId: 's3', price: 36.20, date: '2026-06-15' },

  // Vergalhão history
  { id: 'h8', materialId: 'm4', supplierId: 's2', price: 72.00, date: '2026-05-20' },
  { id: 'h9', materialId: 'm4', supplierId: 's2', price: 68.90, date: '2026-06-12' }
];

export function getLocalStorageData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Error loading key ${key} from localStorage`, e);
  }
  return defaultValue;
}

export function setLocalStorageData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key} to localStorage`, e);
  }
}

// Initializers
export function loadMaterials(): Material[] {
  return getLocalStorageData<Material[]>('cota_materials', DEFAULT_MATERIALS);
}

export function saveMaterials(materials: Material[]): void {
  setLocalStorageData('cota_materials', materials);
}

export function loadSuppliers(): Supplier[] {
  return getLocalStorageData<Supplier[]>('cota_suppliers', DEFAULT_SUPPLIERS);
}

export function saveSuppliers(suppliers: Supplier[]): void {
  setLocalStorageData('cota_suppliers', suppliers);
}

export function loadQuotes(): Quote[] {
  return getLocalStorageData<Quote[]>('cota_quotes', DEFAULT_QUOTES);
}

export function saveQuotes(quotes: Quote[]): void {
  setLocalStorageData('cota_quotes', quotes);
}

export function loadShoppingLists(): ShoppingList[] {
  return getLocalStorageData<ShoppingList[]>('cota_shopping_lists', DEFAULT_SHOPPING_LISTS);
}

export function saveShoppingLists(lists: ShoppingList[]): void {
  setLocalStorageData('cota_shopping_lists', lists);
}

export function loadPriceHistory(): PriceHistoryEntry[] {
  return getLocalStorageData<PriceHistoryEntry[]>('cota_price_history', DEFAULT_HISTORY);
}

export function savePriceHistory(history: PriceHistoryEntry[]): void {
  setLocalStorageData('cota_price_history', history);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function getCheapestQuote(materialId: string, quotes: Quote[]): Quote | null {
  const materialQuotes = quotes.filter(q => q.materialId === materialId && q.price > 0);
  if (materialQuotes.length === 0) return null;
  return materialQuotes.reduce((prev, current) => (prev.price < current.price) ? prev : current);
}
