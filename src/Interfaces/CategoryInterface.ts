export interface Category {
  id: number;
  name: string;
  articles: Article[];
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id: number;
  name: string;
  categoryId: number;
  // Autres propriétés de l'article
}