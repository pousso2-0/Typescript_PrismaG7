import { PrismaClient } from '@prisma/client';
import { Article, CreateArticleDto } from '../Interfaces/ArticleInterface';

const prisma = new PrismaClient();

class ArticleService {
  private static transformToArticle(prismaArticle: any): Article {
    return {
      ...prismaArticle,
      description: prismaArticle.description || undefined,
      store: {
        ...prismaArticle.store,
        description: prismaArticle.store.description || undefined
      }
    };
  }

  static async createArticle(articleData: CreateArticleDto): Promise<Article> {
    const prismaArticle = await prisma.article.create({
      data: articleData,
      include: {
        store: true,
        category: true
      }
    });
    return this.transformToArticle(prismaArticle);
  }

  static async getArticlesByVendor(vendorId: number): Promise<Article[]> {
    const prismaArticles = await prisma.article.findMany({
      where: { store: { userId: vendorId } },
      include: {
        store: true,
        category: true
      }
    });
    return prismaArticles.map(this.transformToArticle);
  }

  static async getArticlesByCategory(categoryId: number): Promise<Article[]> {
    const prismaArticles = await prisma.article.findMany({
      where: { categoryId },
      include: {
        store: true,
        category: true
      }
    });
    return prismaArticles.map(this.transformToArticle);
  }
}

export default ArticleService;