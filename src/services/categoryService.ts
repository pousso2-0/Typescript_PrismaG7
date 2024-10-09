import { PrismaClient } from '@prisma/client';
import { Category, CreateCategoryDto } from '../Interfaces/ArticleInterface';


const prisma = new PrismaClient();

class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    return prisma.category.findMany({
      select: {
        id: true,
        name: true,
        image: true,
      },
    });
    
  }

  static async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    const existingCategory = await prisma.category.findUnique({
      where: { name: categoryData.name }
    });

    if (existingCategory) {
      throw new Error('Category already exists');
    }    


    return prisma.category.create({
      data: categoryData
    });
  }
}

export default CategoryService;