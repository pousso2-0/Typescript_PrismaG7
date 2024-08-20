import { Request, Response } from 'express';
import ArticleService from '../services/articleService';
import { CreateArticleDto } from '../Interfaces/ArticleInterface';

class ArticleController {
    static async createArticle(req: Request, res: Response) {
        try {
          const articleData: CreateArticleDto = req.body;
          const article = await ArticleService.createArticle(articleData);
          res.status(201).json(article);
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      }

  static async getArticlesByVendor(req: Request, res: Response) {
    try {
      const vendorId = Number(req.params.vendorId);
      const articles = await ArticleService.getArticlesByVendor(vendorId);
      res.json(articles);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getArticlesByCategory(req: Request, res: Response) {
    try {
      const categoryId = Number(req.params.categoryId);
      const articles = await ArticleService.getArticlesByCategory(categoryId);
      res.json(articles);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default ArticleController;
