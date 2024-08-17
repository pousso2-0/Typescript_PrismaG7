import { Post, CreatePostInput, UpdatePostInput } from '../Interfaces/PostInterface';   
import { ValidationError, DatabaseError } from '../errors/customErrors';    
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PostService {
  createPost(userId: number, postData: CreatePostInput): Promise<Post>;
  getPostById(postId: number): Promise<Post>;
  updatePost(postId: number, userId: number, updateData: UpdatePostInput): Promise<Post>;
  deletePost(postId: number, userId: number): Promise<Post>;
  getUserPosts(userId: number, page?: number, limit?: number): Promise<Post[]>;
  incrementShareCount(postId: number): Promise<Post>;
  getAllPosts(page?: number, limit?: number): Promise<Post[]>;
}

export class PostServiceImpl implements PostService {
  async createPost(userId: number, postData: CreatePostInput): Promise<Post> {
    try {
      // Vérifier le statut de l'utilisateur et ses crédits
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ValidationError("User not found");

      if (user.type === 'CLIENT' && postData.media && postData.media.length > 3) {
        throw new ValidationError("Free users can only post up to 3 media items");
      }
      if (user.type === 'CLIENT' && user.credits < 3) {
        throw new ValidationError("Not enough credits to create a post");
      }

      // Créer le post
      const newPost = await prisma.post.create({
        data: {
          userId,
          content: postData.content,
          isPublic: postData.isPublic ?? true,
          commentsEnabled: postData.commentsEnabled ?? true,
          media: {
            create: postData.media
          }
        },
        include: {
          user: true,
          media: true,
          comments: true,
          reactions: true,
          favorites: true,
          views: true,
          retweets: true,
          shares: true
        }
      });

      // Mettre à jour les crédits et le nombre de posts de l'utilisateur
      if (user.type === 'CLIENT') {
        await prisma.user.update({
          where: { id: userId },
          data: {
            credits: { decrement: 3 },
            postsCount: { increment: 1 }
          }
        });
      }

      return newPost as Post;
    } catch (error : any) {
      throw new DatabaseError(`Failed to create post: ${error.message}`);
    }
  }

  async getPostById(postId: number): Promise<Post> {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: true,
          media: true,
          comments: true,
          reactions: true,
          favorites: true,
          views: true,
          retweets: true,
          shares: true
        }
      });

      if (!post) throw new ValidationError("Post not found");

      return post as Post;
    } catch (error : any) {
      throw new DatabaseError(`Failed to get post: ${error.message}`);
    }
  }

  async updatePost(postId: number, userId: number, updateData: UpdatePostInput): Promise<Post> {
    try {
      const post = await prisma.post.findFirst({
        where: { id: postId, userId }
      });

      if (!post) {
        throw new ValidationError("Post not found or you're not authorized to update it");
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          content: updateData.content,
          isPublic: updateData.isPublic,
          commentsEnabled: updateData.commentsEnabled
        },
        include: {
          user: true,
          media: true,
          comments: true,
          reactions: true,
          favorites: true,
          views: true,
          retweets: true,
          shares: true
        }
      });

      return updatedPost as Post;
    } catch (error : any) {
      throw new DatabaseError(`Failed to update post: ${error.message}`);
    }
  }

  async deletePost(postId: number, userId: number): Promise<Post> {
    try {
      const post = await prisma.post.findFirst({
        where: { id: postId, userId }
      });

      if (!post) {
        throw new ValidationError("Post not found or you're not authorized to delete it");
      }

      const deletedPost = await prisma.post.delete({
        where: { id: postId },
        include: {
          user: true,
          media: true,
          comments: true,
          reactions: true,
          favorites: true,
          views: true,
          retweets: true,
          shares: true
        }
      });

      // Mettre à jour le nombre de posts de l'utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: { postsCount: { decrement: 1 } }
      });

      return deletedPost as Post;
    } catch (error : any) {
      throw new DatabaseError(`Failed to delete post: ${error.message}`);
    }
  }

  async getUserPosts(userId: number, page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const skip = (page - 1) * limit;
      const posts = await prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: true,
          media: true,
          comments: true,
          reactions: true,
          favorites: true,
          views: true,
          retweets: true,
          shares: true
        }
      });

      return posts as Post[];
    } catch (error : any) {
      throw new DatabaseError(`Failed to get user posts: ${error.message}`);
    }
  }

  async incrementShareCount(postId: number): Promise<Post> {
    try {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { sharesCount: { increment: 1 } },
        include: {
          user: true,
          media: true,
          comments: true,
          reactions: true,
          favorites: true,
          views: true,
          retweets: true,
          shares: true
        }
      });

      if (!updatedPost) {
        throw new ValidationError("Post not found");
      }

      return updatedPost as Post;
    } catch (error : any) {
      throw new DatabaseError(`Failed to increment share count: ${error.message}`);
    }
  }

  async getAllPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const skip = (page - 1) * limit;
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: true,
          media: true,
          comments: true,
          reactions: true,
          favorites: true,
          views: true,
          retweets: true,
          shares: true
        }
      });

      return posts as Post[];
    } catch (error : any) {
      throw new DatabaseError(`Failed to get all posts: ${error.message}`);
    }
  }
}