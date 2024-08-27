import { Request, Response } from 'express';
import CategoryService from '../services/categoryService';
import { CreateCategoryDto } from '../Interfaces/ArticleInterface'; 

class CategoryController {
  
  // Méthode pour récupérer toutes les catégories
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message }); 
    }
  }

  // Méthode pour créer une nouvelle catégorie
  static async createCategory(req: Request, res: Response) {
    try {
      // Extraire les données de la catégorie du corps de la requête et les typer avec CreateCategoryDto
      const categoryData: CreateCategoryDto = req.body;
      const category = await CategoryService.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default CategoryController;
