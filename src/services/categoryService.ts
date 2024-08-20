import { PrismaClient } from '@prisma/client';
import { Category, CreateCategoryDto } from '../Interfaces/ArticleInterface';


const prisma = new PrismaClient();

class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    return prisma.category.findMany();
  }

  static async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    return prisma.category.create({
      data: categoryData
    });
  }
}

export default CategoryService;