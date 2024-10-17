import { PrismaClient } from '@prisma/client';
import { Category, CreateCategoryDto } from '../Interfaces/ArticleInterface';

const prisma = new PrismaClient();

class CategoryService {
  // Méthode statique pour récupérer toutes les catégories
  static async getAllCategories(): Promise<Category[]> {
    // Rechercher toutes les catégories dans la base de données
    return prisma.category.findMany({
      // Spécifier les champs à inclure dans le résultat
      select: {
        id: true,
        name: true,
        image: true,
      },
    });
  }

  static async getCategoryByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  }
  
  // Méthode statique pour créer une nouvelle catégorie
  static async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    // Vérifier si une catégorie avec le même nom existe déjà dans la base de données
    const existingCategory = await prisma.category.findUnique({
      where: { name: categoryData.name }
    });

    // Si une catégorie existante est trouvée, lancer une erreur
    if (existingCategory) {
      throw new Error('Category already exists');
    }    

    // Créer une nouvelle catégorie avec les données fournies
    return prisma.category.create({
      // Spécifier les données pour la nouvelle catégorie
      data: categoryData
    });
  }
}

// Exporter la classe CategoryService comme exportation par défaut du module
export default CategoryService;
