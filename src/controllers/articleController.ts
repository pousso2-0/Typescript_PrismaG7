// articleController.ts

import { Request, Response } from 'express';
import  ArticleService  from '../services/articleService';
import { CatalogueResponse, CategoryWithArticlesResponse } from '../Interfaces/ArticleInterface';
import {handleMediaFiles} from "../utils/mediaUtils";


export class ArticleController {

  // Contrôleur pour créer un magasin pour un utilisateur
  static async createStore(req: Request, res: Response) {
    try {
      const userId = req.userId as number; // Supposant que l'userId est récupéré via un middleware d'authentification
      const { name, description } = req.body;


      // Appel du service pour créer un magasin
      const newStore = await ArticleService.createStoreForUser(userId, { name, description });

      return res.status(201).json(newStore);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
  static async listArticlesByCategoryForStore(req: Request, res: Response) {
    try {
      const { storeId, categoryId } = req.params;
  
      // Conversion des paramètres en entiers
      const parsedStoreId = parseInt(storeId, 10);
      const parsedCategoryId = parseInt(categoryId, 10);
  
      // Appel du service avec les ID convertis
      const articles: CatalogueResponse[] = await ArticleService.listArticlesByCategoryForStore(parsedStoreId, parsedCategoryId);
      
      return res.json(articles);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }

  static async deleteArticleFromStore(req: Request, res: Response) {
    try {
      const storeId = parseInt(req.params.storeId, 10); // Convertir storeId en entier
      const articleId = parseInt(req.params.articleId, 10); // Convertir articleId en entier

      // Appel du service pour supprimer l'article
      await ArticleService.deleteArticleFromStore(storeId, articleId);

      return res.status(204).json(); // Succès sans contenu
    } catch (error: any) {
      return res.status(500).json({ message: error.message }); // Retourne une erreur en cas de problème
    }
  }
  

  static async listAllCategoriesForStore(req: Request, res: Response) {
    try {
      const { storeId } = req.params;
      const categories: CategoryWithArticlesResponse[] = await ArticleService.listCategoriesWithArticles(parseInt(storeId, 10));
      return res.json(categories);
    } catch (error:any) {
      return res.status(500).json({ message: error.message });
    }


  }

  static async listAllCategoriesAndArticles(req: Request, res: Response) {
    try {
      const categories: CategoryWithArticlesResponse[] = await ArticleService.listCategoriesWithArticles();
      return res.json(categories);
    } catch (error:any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async addArticleToStore(req: Request, res: Response) {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const articleData = req.body;

      // Ensure categoryId, storeId, price, and stockCount are numbers
      const categoryId = parseInt(articleData.categoryId, 10);
      const price = parseFloat(articleData.price);
      const stockCount = parseInt(articleData.stockCount, 10);

      // Validate if parsing was successful (optional)
      if (isNaN(categoryId) || isNaN(price) || isNaN(stockCount)) {
        return res.status(400).json({ message: 'Invalid data types provided for article' });
      }

      // Update articleData with parsed values
      articleData.categoryId = categoryId;
      articleData.price = price;
      articleData.stockCount = stockCount;

      // Check if files are provided
      const files = req.files as Express.Multer.File[];

      if (files && files.length > 0) {
        // Use handleMediaFiles to process the uploaded files
        const image = await handleMediaFiles(files, 'image');

        // If image is found and processed, attach the URL to articleData
        if (image.length > 0) {
          articleData.image = image[0];
        }
      }

      console.log('Les articles:', articleData);

      // Add article to the store (call the service method)
      await ArticleService.addArticleToStore(storeId, articleData);

      return res.status(201).json({ message: 'Article added to store' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }


  static async deleteCategoryForStore(req: Request, res: Response) {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const categoryId = parseInt(req.params.categoryId, 10);
      const userId = req.userId as number;
      await ArticleService.deleteStoreOrCategory(userId, storeId, categoryId);
      return res.status(204).json();
    } catch (error:any) {
      return res.status(500).json({ message: error.message });
    }
  }
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