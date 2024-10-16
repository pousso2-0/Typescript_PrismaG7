import { Request, Response } from 'express';
import CategoryService from '../services/categoryService';
import { CreateCategoryDto } from '../Interfaces/ArticleInterface';
import {handleMediaFiles} from "../utils/mediaUtils";

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

  static async getCategoryByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const category = await CategoryService.getCategoryByName(name);

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Méthode pour créer une nouvelle catégorie
  static async createCategory(req: Request, res: Response) {
    try {
      // Extraire les données de la catégorie du corps de la requête et les typer avec CreateCategoryDto
      const categoryData: CreateCategoryDto = req.body;

      // Vérifier si req.files existe et est un tableau
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        // Utiliser handleMediaFiles pour traiter les fichiers envoyés, ici pour le champ 'profilePicture'
        const image = await handleMediaFiles(files, 'image');

        // Si un fichier est trouvé et traité, attacher l'URL à userData
        if (image.length > 0) {
          categoryData.image = image[0]; // Prendre le premier fichier, ou plus si nécessaire
        }
      }
      const category = await CategoryService.createCategory(categoryData);

      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default CategoryController;
