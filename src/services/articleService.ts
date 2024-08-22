import { PrismaClient } from '@prisma/client';
import { ArticleData, CatalogueResponse, CategoryWithArticlesResponse } from '../Interfaces/ArticleInterface';

const prisma = new PrismaClient();

export class ArticleService {
  static async listArticlesByCategoryForStore(storeId: number, categoryId: number): Promise<CatalogueResponse[]> {

     //Verification si le store existe 

     const storeExists = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!storeExists) {
      throw new Error('Store not found');
    }
    // Vérification si la catégorie existe
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      throw new Error('Category not found');
    }
   
  
    // Récupération des articles pour le magasin spécifique et la catégorie
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        Catalogue: {
          where: {
            article: {
              categoryId: categoryId,
            },
          },
          include: {
            article: true,
          },
        },
      },
    });
  
    if (!store) {
      throw new Error('Store not found');
    }
  
    // Mapper les résultats en `CatalogueResponse`
    return store.Catalogue.map((catalogue) => ({
      articleId: catalogue.article.id,
      articleName: catalogue.article.name,
      price: catalogue.price,
      stockCount: catalogue.stockCount,
    }));
  }
  
  static async listCategoriesWithArticles(storeId?: number): Promise<CategoryWithArticlesResponse[]> {
    const categories = await prisma.category.findMany({
      include: {
        articles: {
          include: {
            Catalogue: {
              where: storeId ? { storeId } : {},
              include: { store: true },
            },
          },
        },
      },
    });
  
    return categories.map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      articles: category.articles.flatMap((article) => {
        // Filtrage des catalogues en fonction du magasin si storeId est fourni
        const storeCatalogues = storeId
          ? article.Catalogue.filter(catalogue => catalogue.storeId === storeId)
          : article.Catalogue;
  
        return storeCatalogues.map((catalogue) => ({
          articleId: article.id,
          articleName: article.name,
          price: catalogue.price,
          stockCount: catalogue.stockCount,
          storeName: catalogue.store.name, // Assurez-vous que `store` est bien inclus
        }));
      }),
    }));
  }
  

  static async addArticleToStore(storeId: number, articleData: ArticleData): Promise<void> {
    const existingArticle = await prisma.article.findFirst({
      where: { name: articleData.name, categoryId: articleData.categoryId },
    });

    if (existingArticle) {
      const storeArticle = await prisma.catalogue.findUnique({
        where: {
          storeId_articleId: { storeId, articleId: existingArticle.id }, // Correction ici
        },
      });

      if (storeArticle) {
        await prisma.catalogue.update({
          where: { id: storeArticle.id },
          data: { stockCount: storeArticle.stockCount + articleData.stockCount },
        });
      } else {
        await prisma.catalogue.create({
          data: {
            storeId,
            articleId: existingArticle.id,
            stockCount: articleData.stockCount,
            price: articleData.price,
          },
        });
      }
    } else {
      const newArticle = await prisma.article.create({
        data: {
          name: articleData.name,
          description: articleData.description,
          categoryId: articleData.categoryId,
        },
      });
  
      await prisma.catalogue.create({
        data: {
          storeId,
          articleId: newArticle.id,
          stockCount: articleData.stockCount,
          price: articleData.price,
        },
      });
    }
  }

  static async deleteStoreOrCategory(userId: number, storeId: number, categoryId?: number): Promise<void> {
    // Vérifier si l'utilisateur a le droit d'accéder au magasin
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { userId: true },
    });

    if (!store || store.userId !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à supprimer ce magasin ou cette catégorie.');
    }

    if (categoryId) {
      // Supprimer les articles associés à la catégorie dans le magasin
      const storeArticles = await prisma.catalogue.findMany({
        where: {
          storeId,
          article: {
            categoryId,
          },
        },
      });

      for (const catalogue of storeArticles) {
        await prisma.catalogue.delete({ where: { id: catalogue.id } });
      }
    } else {
      // Supprimer le magasin et ses articles
      await prisma.catalogue.deleteMany({ where: { storeId } });
      await prisma.store.delete({ where: { id: storeId } });
    }
  }
}

export default ArticleService;