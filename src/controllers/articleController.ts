import { Request, Response } from 'express';
import ArticleService from '../services/articleService';
import { CategoryWithArticlesResponse } from '../Interfaces/ArticleInterface';
import { handleMediaFiles } from "../utils/mediaUtils";

export class ArticleController {
  // Créer un magasin pour un utilisateur
  static async createStore(req: Request, res: Response) {
    try {
      const userId = req.userId as number;
      const { name, description } = req.body;

      const newStore = await ArticleService.createStoreForUser(userId, { name, description });
      return res.status(201).json(newStore);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Lister les articles par catégorie pour un magasin
  static async listArticlesByCategoryForStore(req: Request, res: Response) {
    try {
      const { storeId, categoryId } = req.params;
      const parsedStoreId = parseInt(storeId, 10);
      const parsedCategoryId = parseInt(categoryId, 10);

      const articles = await ArticleService.listArticlesByCategoryForStore(parsedStoreId, parsedCategoryId);
      return res.json(articles);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }

  // Lister tous les magasins
  static async getAllStores(req: Request, res: Response) {
    try {
      const stores = await ArticleService.getAllStores();
      return res.status(200).json(stores);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Lister les magasins d'un utilisateur
  static async getStoresByUser(req: Request, res: Response) {
    try {
      const userId = req.userId as number;
      const userStores = await ArticleService.getStoresByUserId(userId);
      return res.status(200).json(userStores);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Supprimer un article d'un magasin
  static async deleteArticleFromStore(req: Request, res: Response) {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const articleId = parseInt(req.params.articleId, 10);

      await ArticleService.deleteArticleFromStore(storeId, articleId);
      return res.status(204).json();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Lister toutes les catégories pour un magasin
  static async listAllCategoriesForStore(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const categories: CategoryWithArticlesResponse[] = await ArticleService.listCategoriesWithArticles(parseInt(storeId, 10));
      return res.json(categories);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Lister toutes les catégories et leurs articles
  static async listAllCategoriesAndArticles(req: Request, res: Response) {
    try {
      const categories: CategoryWithArticlesResponse[] = await ArticleService.listCategoriesWithArticles();
      return res.json(categories);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Ajouter un article à un magasin
  static async addArticleToStore(req: Request, res: Response) {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const articleData = req.body;

      // Conversion et validation des données numériques
      const categoryId = parseInt(articleData.categoryId, 10);
      const price = parseFloat(articleData.price);
      const stockCount = parseInt(articleData.stockCount, 10);

      if (isNaN(categoryId) || isNaN(price) || isNaN(stockCount)) {
        return res.status(400).json({ message: 'Invalid data types provided for article' });
      }

      // Mise à jour des données avec les valeurs converties
      articleData.categoryId = categoryId;
      articleData.price = price;
      articleData.stockCount = stockCount;

      // Traitement des fichiers uploadés
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const image = await handleMediaFiles(files, 'image');
        if (image.length > 0) {
          articleData.image = image[0];
        }
      }

      // Appel du service pour ajouter ou mettre à jour l'article
      const article = await ArticleService.addArticleToStore(storeId, articleData);

      // Retourner l'article créé ou mis à jour dans la réponse
      return res.status(201).json({
        message: 'Article added to store successfully',
        article, // Inclure l'article dans la réponse
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Supprimer une catégorie pour un magasin
  static async deleteCategoryForStore(req: Request, res: Response) {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const categoryId = parseInt(req.params.categoryId, 10);
      const userId = req.userId as number;

      await ArticleService.deleteStoreOrCategory(userId, storeId, categoryId);
      return res.status(204).json();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Supprimer un magasin
  static async deleteStore(req: Request, res: Response) {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const userId = req.userId as number;

      await ArticleService.deleteStoreOrCategory(userId, storeId);
      return res.status(204).json();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default ArticleController;