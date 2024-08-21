import { PrismaClient , Category } from '@prisma/client';
import {  Article } from '../Interfaces/CategoryInterface';

const prisma = new PrismaClient();

class CategoryService {
  static async createCategory(name: string, userId: number): Promise<Category> {
    return prisma.category.create({
      data: {
        name,
        userId,
      },
    });
  }

  static async getCategories(userId: number): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        userId,
      },
      include: {
        articles: true,
      },
    });
  }

  static async getCategory(id: number, userId: number): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        articles: true,
      },
    });
  }

  static async deleteCategory(id: number, userId: number): Promise<Category | null> {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!category) {
        return null;
      }

      return await prisma.category.delete({
        where: {
          id: category.id,
        },
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

}

export default CategoryService;