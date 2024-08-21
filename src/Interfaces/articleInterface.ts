// src/interfaces/articleInterface.ts
import { Category } from './CategoryInterface';

export interface Article {
  id: number;
  name: string;
  description?: string; // Champ optionnel
  price: number;
  stockCount: number;
  storeId: number;
  categoryId: number;
  category: Category; // Relation avec `Category`
  createdAt: Date;
  updatedAt: Date;
}
