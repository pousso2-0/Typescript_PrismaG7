import { PrismaClient } from '@prisma/client';

import {Post, Favorite, Retweet, userSelectConfig} from '../Interfaces/PostInterface'; // Supposons que vos interfaces sont dans un fichier séparé

const prisma = new PrismaClient();

class ShareFavService {
  static async retweetPost(userId: number, postId: number, content: string): Promise<Retweet> {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) throw new Error("Post not found");

    const existingShare = await prisma.retweet.findFirst({
      where: { userId, postId },
      include: { user: { select: userSelectConfig } }

    });

    if (existingShare) throw new Error("Post already shared by this user");

    const newShare = await prisma.retweet.create({
      data: { userId, postId, content }
    });

    await prisma.post.update({
      where: { id: postId },
      data: { sharesCount: { increment: 1 } }
    });

    return newShare;
  }

  static async addToFavorites(userId: number, postId: number): Promise<Favorite> {
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
  
    if (!post) throw new Error("Post not found");
  
    const existingFavorite = await prisma.favorite.findFirst({
      where: { userId, postId }
    });
  
    if (existingFavorite) throw new Error("Post already in favorites");
  
    const newFavorite = await prisma.favorite.create({
      data: { userId, postId }
    });
  
    return newFavorite;
  }
  

  static async deleteFromFavorites(userId: number, postId: number): Promise<{ count: number }> {

    const isFav = await prisma.favorite.findFirst({
      where: { userId: userId, postId: postId },
    });
    if (!isFav) throw new Error("Post not found");

    const favorite = await prisma.favorite.deleteMany({
      where: { userId, postId }
    });

    return favorite;
  }
  

  static async getUserRetweet(userId: number): Promise<Retweet[]> {
    return prisma.retweet.findMany({
      where: { userId },
      include: {
        post: true,
        user: { select: userSelectConfig }
      }
    });
  }

  static async getUserFavorites(userId: number): Promise<Favorite[]> {
    return prisma.favorite.findMany({
      where: { userId },
      include: { post: true }
    });
  }
}


export default ShareFavService;