import { Request, Response } from 'express';
import CategoryService from '../services/categoryService';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { UserType } from '@prisma/client';

class CategoryController {
  static async createCategory(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const userId = (req as any).user.id;
      const category = await CategoryService.createCategory(name, userId);
      res.status(201).json(category);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const categories = await CategoryService.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async getCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const category = await CategoryService.getCategory(Number(id), userId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: (error as Error).message });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const deletedCategory = await CategoryService.deleteCategory(Number(id), userId);
      res.json(deletedCategory);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: (error as Error).message });
    }
  }
}

export default CategoryController;