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
    profilePicture: string | null;
    isOnline: boolean;
    lastSeenAt: Date | null;
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

  
  export interface PaymentDto {
    orderId: number;
    amount: number; // Ajout du montant ici
    IdpaymentType: number;
  }
  

  export interface ArticleData {
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    stockCount: number;
  }
  
  export interface CatalogueResponse {
    articleId: number;
    articleName: string;
    price: number;
    stockCount: number;
  }
  
export interface CategoryWithArticlesResponse {
  categoryId: number;
  categoryName: string;
  articles: {
    articleId: number;
    articleName: string;
    price?: number; // Peut être undefined si non applicable
    stockCount?: number; // Peut être undefined si non applicable
    storeName?: string; // Peut être undefined si non applicable
  }[];
}