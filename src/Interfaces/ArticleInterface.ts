import { UserSearchResult } from "./UserInterface";

export enum UserType {
  CLIENT = 'CLIENT',
  TAILLEUR = 'TAILLEUR',
  VENDEUR = 'VENDEUR',
  ADMIN = 'ADMIN'
}

export interface Article {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  price: number;
  stockCount: number;
  storeId: number;
  store: Store;
  categoryId: number;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  user: User;
  articles: Article[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  name: string;
  profilePicture: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
  type: UserType;
}

export interface Category {
  id: number;
  name: string;
  image: string | null;
  articles?: Article[];
}

export interface CreateArticleDto {
  name: string;
  description?: string;
  image?: string;
  price: number;
  stockCount: number;
  storeId: number;
  categoryId: number;
}

export interface UpdateArticleDto {
  name?: string;
  image?: string;
  description?: string;
  price?: number;
  stockCount?: number;
  categoryId?: number;
}

export interface ArticleData {
  name: string;
  description?: string;
  image?: string;
  price: number;
  stockCount: number;
  categoryId: number;
}

export interface CategoryWithArticlesResponse {
  categoryId: number;
  categoryName: string;
  articles: {
    articleId: number;
    articleImage?: string;
    articleName: string;
    price: number;
    stockCount: number;
    storeName: string;
    storeDescription?: string | null;
    storeId: number;
  }[];
}

export const categorySelection = {
  id: true,
  name: true,
};

export const articleSelection = {
  id: true,
  name: true,
  image: true,
  description: true,
  price: true,
  stockCount: true,
  category: {
    select: categorySelection,
  },
  store: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
};
export interface CreateOrderDto {
  userId: number;
  vendorId: number;
  articleId: number;  // Ajout de l'ID de l'article
  quantity: number;   // Ajout de la quantité
  totalAmount?: number;  // Rendre optionnel si vous le calculez dynamiquement
  paymentType: string;
  deliveryMode: string;
  status?: string;
  storeId:number
}

// DTOs pour la mise à jour
export interface UpdateCategoryDto {
  name?: string;
  image?: string;
}


// DTOs (Data Transfer Objects) pour la création
export interface CreateCategoryDto {
  id: number;
  image?: string
  name: string;
}
export interface CreateOrderDto {
  userId: number;
  vendorId: number;
  articleId: number;  // Ajout de l'ID de l'article
  quantity: number;   // Ajout de la quantité
  totalAmount?: number;  // Rendre optionnel si vous le calculez dynamiquement
  paymentType: string;
  deliveryMode: string;
  status?: string;
  storeId:number
}

export interface Order {
  id: number;
  userId: number;
  user: User;
  vendorId: number;
  vendor: User;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}


// DTOs (Data Transfer Objects) pour la création
export interface CreateCategoryDto {
  id: number;
  image?: string
  name: string;
}

export interface CreateOrderDto {
  userId: number;
  vendorId: number;
  articleId: number;  // Ajout de l'ID de l'article
  quantity: number;   // Ajout de la quantité
  totalAmount?: number;  // Rendre optionnel si vous le calculez dynamiquement
  paymentType: string;
  deliveryMode: string;
  status?: string;
  storeId:number
}
export interface UpdateOrderDto {
  totalAmount?: number;
  status?: string;
}
