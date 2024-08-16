import {
  Post,
  CreatePostInput,
  UpdatePostInput,
  postIncludeConfig,
  PostService,
} from "../Interfaces/PostInterface";
import { ValidationError, DatabaseError } from "../errors/customErrors";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export class PostServiceImpl implements PostService {
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly FREE_USER_MEDIA_LIMIT = 3;
  private static readonly POST_CREATION_COST = 3;

  private async getUser(userId: number): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ValidationError("User not found");
    return user;
  }

  private async checkUserCredits(user: User) {
    if (
      user.type === "CLIENT" &&
      user.credits < PostServiceImpl.POST_CREATION_COST
    ) {
      throw new ValidationError("Not enough credits to create a post");
    }
  }

  private async updateUserCreditsAndPostCount(
    userId: number,
    isCreating: boolean
  ): Promise<void> {
    if (isCreating) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: PostServiceImpl.POST_CREATION_COST },
          postsCount: { increment: 1 },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { postsCount: { decrement: 1 } },
      });
    }
  }

  async createPost(userId: number, postData: CreatePostInput): Promise<Post> {
    try {
      const user = await this.getUser(userId);
      this.checkUserCredits(user);

      if (
        user.type === "CLIENT" &&
        postData.media &&
        postData.media.length > PostServiceImpl.FREE_USER_MEDIA_LIMIT
      ) {
        throw new ValidationError(
          `Free users can only post up to ${PostServiceImpl.FREE_USER_MEDIA_LIMIT} media items`
        );
      }

      const newPost = await prisma.post.create({
        data: {
          userId,
          content: postData.content,
          isPublic: postData.isPublic ?? true,
          commentsEnabled: postData.commentsEnabled ?? true,
          media: { create: postData.media },
        },
        include: postIncludeConfig,
      });

      if (user.type === "CLIENT") {
        await this.updateUserCreditsAndPostCount(userId, true);
      }

      return newPost as Post;
    } catch (error: any) {
      throw new DatabaseError(`Failed to create post: ${error.message}`);
    }
  }

  async getPostById(postId: number): Promise<Post> {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: postIncludeConfig,
      });

      if (!post) throw new ValidationError("Post not found");

      return post as Post;
    } catch (error: any) {
      throw new DatabaseError(`Failed to get post: ${error.message}`);
    }
  }

  async updatePost(
    postId: number,
    userId: number,
    updateData: UpdatePostInput
  ): Promise<Post> {
    try {
      const post = await prisma.post.findFirst({
        where: { id: postId, userId },
      });
      if (!post)
        throw new ValidationError(
          "Post not found or you're not authorized to update it"
        );

      return (await prisma.post.update({
        where: { id: postId },
        data: updateData,
        include: postIncludeConfig,
      })) as Post;
    } catch (error: any) {
      throw new DatabaseError(`Failed to update post: ${error.message}`);
    }
  }

  async deletePost(postId: number, userId: number): Promise<Post> {
    try {
      const post = await prisma.post.findFirst({
        where: { id: postId, userId },
      });
      if (!post)
        throw new ValidationError(
          "Post not found or you're not authorized to delete it"
        );

      const deletedPost = await prisma.post.delete({
        where: { id: postId },
        include: postIncludeConfig,
      });

      await this.updateUserCreditsAndPostCount(userId, false);

      return deletedPost as Post;
    } catch (error: any) {
      throw new DatabaseError(`Failed to delete post: ${error.message}`);
    }
  }

  async getUserPosts(
    userId: number,
    page: number = 1,
    limit: number = PostServiceImpl.DEFAULT_PAGE_SIZE
  ): Promise<Post[]> {
    try {
      const skip = (page - 1) * limit;
      return (await prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: postIncludeConfig,
      })) as Post[];
    } catch (error: any) {
      throw new DatabaseError(`Failed to get user posts: ${error.message}`);
    }
  }

  async incrementShareCount(postId: number): Promise<Post> {
    try {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { sharesCount: { increment: 1 } },
        include: postIncludeConfig,
      });

      if (!updatedPost) throw new ValidationError("Post not found");

      return updatedPost as Post;
    } catch (error: any) {
      throw new DatabaseError(
        `Failed to increment share count: ${error.message}`
      );
    }
  }

  async getAllPosts(
    page: number = 1,
    limit: number = PostServiceImpl.DEFAULT_PAGE_SIZE
  ): Promise<Post[]> {
    try {
      const skip = (page - 1) * limit;
      return (await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: postIncludeConfig,
      })) as Post[];
    } catch (error: any) {
      throw new DatabaseError(`Failed to get all posts: ${error.message}`);
    }
  }
}
