// Interfaces/ArticleInterface.ts

export enum UserType {
    CLIENT = 'CLIENT',
    TAILLEUR = 'TAILLEUR',
    VENDEUR = 'VENDEUR',
    ADMIN = 'ADMIN'
  }

  export interface Article {
    id: number;
    name: string;
    description?: string | null; 
    price: number;
    stockCount: number;
    storeId: number;
    store: Store;
    categoryId: number;
    category: Category;
    createdAt: Date;
    updatedAt: Date;
  }


  export interface PrismaArticle {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stockCount: number;
    storeId: number;
    categoryId: number;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface User {
    id: number;
    name: string;
    email: string;
    type: UserType;
  }
  
  export interface Store {
    id: number;
    name: string;
    description: string | null;
    userId: number;
    user: User; 
    articles?: Article[]; 
    createdAt: Date;
    updatedAt: Date;
  }
  
export interface Category {
  id: number;
  name: string;
  articles?: Article[];
  createdAt: Date;
  updatedAt: Date;
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
    name: string;
  }
  
  export interface CreateArticleDto {
    name: string;
    description?: string;
    price: number;
    stockCount: number;
    storeId: number;
    categoryId: number;
  }
  
  export interface CreateOrderDto {
    userId: number;
    vendorId: number;
    totalAmount: number;
    status?: string;
  } 
  
  // DTOs pour la mise à jour
  export interface UpdateCategoryDto {
    name?: string;
  }
  
  export interface UpdateArticleDto {
    name?: string;
    description?: string;
    price?: number;
    stockCount?: number;
    categoryId?: number;
  }
  
  export interface UpdateOrderDto {
    totalAmount?: number;
    status?: string;
  }

  