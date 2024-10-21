import { PrismaClient, Prisma } from '@prisma/client';
import {
  ArticleData,
  articleSelection,
  CategoryWithArticlesResponse
} from '../Interfaces/ArticleInterface';
import { userSelectConfig } from "../Interfaces/PostInterface";

const prisma = new PrismaClient();

export class ArticleService {
  static async createStoreForUser(userId: number, storeData: { name: string, description?: string }) {
    try {
      const newStore = await prisma.store.create({
        data: {
          name: storeData.name,
          description: storeData.description,
          userId: userId,
        },
      });
      return newStore;
    } catch (error: any) {
      throw new Error('Error creating store: ' + error.message);
    }
  }

  static async getAllStores() {
    try {
      const stores = await prisma.store.findMany({
        include: {
          user: { select: userSelectConfig },
          articles: {
            include: {
              category: true,
              store: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                }
              }
            }
          },
        },
      });
      return stores;
    } catch (error: any) {
      throw new Error('Error fetching stores: ' + error.message);
    }
  }

  static async getStoresByUserId(userId: number) {
    try {
      const userStores = await prisma.store.findMany({
        where: {
          userId: userId,
        },
        include: {
          user: { select: userSelectConfig },
          articles: {
            include: {
              category: true,
              store: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                }
              }
            }
          },
        },
      });
      return userStores;
    } catch (error: any) {
      throw new Error('Error fetching user stores: ' + error.message);
    }
  }

  static async listArticlesByCategoryForStore(storeId: number, categoryId: number) {
    const articles = await prisma.article.findMany({
      where: {
        storeId: storeId,
        categoryId: categoryId,
      },
    });

    return articles.map((article) => ({
      articleId: article.id,
      articleName: article.name,
      articleImage: article.image,
      price: article.price,
      stockCount: article.stockCount,
    }));
  }

  static async listCategoriesWithArticles(storeId?: number): Promise<CategoryWithArticlesResponse[]> {
    const categories = await prisma.category.findMany({
      include: {
        articles: {
          where: storeId ? {
            storeId: storeId
          } : undefined,
          include: {
            store: true,
          },
        },
      },
    });

    return categories.map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      articles: category.articles.map((article) => ({
        articleId: article.id,
        articleName: article.name,
        articleImage: article.image ?? "",
        price: article.price,
        stockCount: article.stockCount,
        storeName: article.store.name,
        storeDescription: article.store.description,
        storeId: article.store.id,
      })),
    }));
  }

  static async addArticleToStore(storeId: number, articleData: ArticleData) {
    const existingArticle = await prisma.article.findFirst({
      where: {
        name: articleData.name,
        storeId: storeId,
        categoryId: articleData.categoryId,
      },
    });

    if (existingArticle) {
      // Mise à jour de l'article existant et retour de l'article mis à jour
      return await prisma.article.update({
        where: { id: existingArticle.id },
        data: {
          price: articleData.price,
          stockCount: existingArticle.stockCount + articleData.stockCount,
        },
      });
    } else {
      // Création du nouvel article et retour de l'article créé
      return await prisma.article.create({
        data: {
          name: articleData.name,
          image: articleData.image,
          description: articleData.description,
          price: articleData.price,
          stockCount: articleData.stockCount,
          storeId: storeId,
          categoryId: articleData.categoryId,
        },
      });
    }
  }

  static async deleteArticleFromStore(storeId: number, articleId: number): Promise<void> {
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        storeId: storeId,
      },
    });

    if (!article) {
      throw new Error('Article not found in the specified store');
    }

    await prisma.article.delete({
      where: { id: articleId },
    });
  }

  static async deleteStoreOrCategory(userId: number, storeId: number, categoryId?: number): Promise<void> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { userId: true },
    });

    if (!store || store.userId !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à supprimer ce magasin ou cette catégorie.');
    }

    if (categoryId) {
      await prisma.article.deleteMany({
        where: {
          storeId,
          categoryId,
        },
      });
    } else {
      await prisma.store.delete({
        where: { id: storeId },
      });
    }
  }
}

export default ArticleService;