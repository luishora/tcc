export type ItemType = 'Material' | 'Ferramenta';

export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  type: ItemType;
  quantity: number;
  unit: string;
  description: string;
  minStock?: number;
}

export interface Transaction {
  id: string;
  itemId: string;
  type: 'Entrada' | 'Saída';
  quantity: number;
  date: string;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  schoolName?: string;
  password?: string; // Only for local mock auth
}
