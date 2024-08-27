import { PrismaClient } from '@prisma/client';
import { ArticleData, CatalogueResponse, CategoryWithArticlesResponse } from '../Interfaces/ArticleInterface';

const prisma = new PrismaClient();

// La classe `ArticleService` encapsule plusieurs méthodes pour gérer les articles, les magasins, et les catégories.
export class ArticleService {

   // Méthode pour créer un nouveau magasin pour un utilisateur
   static async createStoreForUser(userId: number, storeData: { name: string, description?: string }) {
    try {
      // Création du magasin et association avec l'utilisateur
      const newStore = await prisma.store.create({
        data: {
          name: storeData.name,
          description: storeData.description,
          userId: userId, // Association avec l'utilisateur via userId
        },
      });

      return newStore;
    } catch (error:any) {
      throw new Error('Error creating store: ' + error.message);
    }
  }

  // Méthode pour lister les articles d'une catégorie spécifique dans un magasin donné.
  static async listArticlesByCategoryForStore(storeId: number, categoryId: number): Promise<CatalogueResponse[]> {

    // Vérifie si le magasin existe dans la base de données.
    const storeExists = await prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!storeExists) {
      throw new Error('Store not found');
    }

    // Vérifie si la catégorie existe dans la base de données.
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      throw new Error('Category not found');
    }

    // Récupère les articles d'un magasin spécifique appartenant à une catégorie donnée.
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

    // Mappe les résultats pour créer une liste de `CatalogueResponse`, une structure définie pour les réponses.
    return store.Catalogue.map((catalogue) => ({
      articleId: catalogue.article.id,
      articleName: catalogue.article.name,
      price: catalogue.price,
      stockCount: catalogue.stockCount,
    }));
  }

  // Méthode pour lister toutes les catégories avec leurs articles, optionnellement filtrée par magasin.
  static async listCategoriesWithArticles(storeId?: number): Promise<CategoryWithArticlesResponse[]> {
    // Récupère toutes les catégories et leurs articles, en incluant les catalogues associés si un storeId est fourni.
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
      }
    });

    // Mappe les catégories et leurs articles pour créer une structure de réponse.
    return categories.map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      articles: category.articles.flatMap((article) => {
        // Filtre les catalogues par magasin si storeId est fourni.
        const storeCatalogues = storeId ? article.Catalogue.filter(catalogue => catalogue.storeId === storeId) : article.Catalogue;

        // Mappe les catalogues filtrés en une structure de réponse pour les articles.
        return storeCatalogues.map((catalogue) => ({
          articleId: article.id,
          articleName: article.name,
          price: catalogue.price,
          stockCount: catalogue.stockCount,
          storeName: catalogue.store.name,
        }));
      }),
    }));
  }

  // Méthode pour ajouter un article à un magasin, ou mettre à jour l'existant.
  static async addArticleToStore(storeId: number, articleData: ArticleData): Promise<void> {
    // Cherche si un article avec le même nom et catégorie existe déjà.
    const existingArticle = await prisma.article.findFirst({
      where: { name: articleData.name, categoryId: articleData.categoryId },
    });

    if (existingArticle) {
      // Vérifie si cet article est déjà dans le catalogue du magasin spécifié.
      const storeArticle = await prisma.catalogue.findUnique({
        where: {
          storeId_articleId: { storeId, articleId: existingArticle.id },
        },
      });

      if (storeArticle) {
        // Met à jour le stock de l'article existant dans le magasin.
        await prisma.catalogue.update({
          where: { id: storeArticle.id },
          data: { stockCount: storeArticle.stockCount + articleData.stockCount },
        });
      } else {
        // Ajoute l'article au catalogue du magasin.
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
      // Crée un nouvel article s'il n'existe pas, puis l'ajoute au catalogue du magasin.
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
   // Méthode pour supprimer un article spécifique d'un magasin
   static async deleteArticleFromStore(storeId: number, articleId: number): Promise<void> {
    // Vérifie si l'article existe dans le catalogue du magasin
    const storeArticle = await prisma.catalogue.findUnique({
      where: {
        storeId_articleId: { storeId, articleId },
      },
    });

    if (!storeArticle) {
      throw new Error('Article not found in the specified store');
    }

    // Supprime l'article du catalogue du magasin
    await prisma.catalogue.delete({
      where: { id: storeArticle.id },
    });
  }

  // Méthode pour supprimer un magasin ou une catégorie associée aux articles d'un magasin spécifique.
  static async deleteStoreOrCategory(userId: number, storeId: number, categoryId?: number): Promise<void> {
    // Vérifie si l'utilisateur a les droits d'accès au magasin spécifié.
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { userId: true },
    });

    if (!store || store.userId !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à supprimer ce magasin ou cette catégorie.');
    }

    if (categoryId) {
      // Supprime les articles d'une catégorie spécifique dans le magasin.
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
      // Supprime tous les articles du magasin, puis le magasin lui-même.
      await prisma.catalogue.deleteMany({ where: { storeId } });
      await prisma.store.delete({ where: { id: storeId } });
    }
  }
}

// Exportation de la classe `ArticleService` pour qu'elle puisse être utilisée ailleurs dans le projet.
export default ArticleService;
