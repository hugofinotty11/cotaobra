export interface Material {
  id: string;
  name: string;
  unit: string;
  category: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface Quote {
  id: string;
  materialId: string;
  supplierId: string;
  price: number;
  updatedAt: string;
}

export interface ShoppingListItem {
  materialId: string;
  quantity: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: string;
}

export interface PriceHistoryEntry {
  id: string;
  materialId: string;
  supplierId: string;
  price: number;
  date: string;
}

export type Category = 
  | 'Estrutura' 
  | 'Básico e Alvenaria' 
  | 'Cobertura' 
  | 'Hidráulica' 
  | 'Elétrica' 
  | 'Acabamento e Revestimento' 
  | 'Pintura' 
  | 'Ferramentas & EPI' 
  | 'Outros';

export const MATERIAL_CATEGORIES: Category[] = [
  'Estrutura',
  'Básico e Alvenaria',
  'Cobertura',
  'Hidráulica',
  'Elétrica',
  'Acabamento e Revestimento',
  'Pintura',
  'Ferramentas & EPI',
  'Outros'
];

export const MATERIAL_UNITS = [
  'un',     // unidade
  'saco',   // saco (ex: cimento, cal)
  'm³',     // metro cúbico (ex: areia, brita)
  'm²',     // metro quadrado (ex: piso, azulejo)
  'm',      // metro (ex: tubos, fios)
  'barra',  // barra (ex: vergalhão)
  'kg',     // quilograma
  'lira',   // litro
  'lata',   // lata (ex: tinta)
  'rolo'    // rolo (ex: mangueira, fios)
];
