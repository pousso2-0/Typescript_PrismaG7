import { PrismaClient, Comment } from "@prisma/client";
import { ValidationError, DatabaseError } from "../errors/customErrors";
import { commentIncludeConfig , CommentWithLimitedUserInfo } from "../Interfaces/CommentInterface";

const prisma = new PrismaClient();

export class CommentService {
  private readonly DEFAULT_PAGE_SIZE = 10;

  async createComment(userId: number, postId: number, content: string): Promise<Comment> {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ValidationError("User not found");

      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) throw new ValidationError("Post not found");
      if (!post.commentsEnabled) throw new ValidationError("Comments are disabled for this post");

      const newComment = await prisma.comment.create({
        data: {
          userId,
          postId,
          content
        },
        include: commentIncludeConfig
      });

      await prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      });

      return newComment;
    } catch (error: any) {
      throw new DatabaseError(`Failed to create comment: ${error.message}`);
    }
  }

  async getCommentById(id: number): Promise<Comment> {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id },
        include: commentIncludeConfig
      });
      if (!comment) throw new ValidationError("Comment not found");
      return comment;
    } catch (error: any) {
      throw new DatabaseError(`Failed to get comment: ${error.message}`);
    }
  }

  async updateComment(id: number, userId: number, content: string): Promise<Comment> {
    try {
      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) throw new ValidationError("Comment not found");
      if (comment.userId !== userId) throw new ValidationError("Unauthorized");

      return await prisma.comment.update({
        where: { id },
        data: { content },
        include: commentIncludeConfig
      });
    } catch (error: any) {
      throw new DatabaseError(`Failed to update comment: ${error.message}`);
    }
  }

  async deleteComment(id: number, userId: number): Promise<Comment> {
    try {
      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) throw new ValidationError("Comment not found");
      if (comment.userId !== userId) throw new ValidationError("Unauthorized");

      const deletedComment = await prisma.comment.delete({
        where: { id },
        include: commentIncludeConfig
      });

      await prisma.post.update({
        where: { id: comment.postId },
        data: { commentsCount: { decrement: 1 } }
      });

      return deletedComment;
    } catch (error: any) {
      throw new DatabaseError(`Failed to delete comment: ${error.message}`);
    }
  }

  async CommentReplies(commentId: number, userID: number, content: string): Promise<Comment> {
    try {
      const user = await prisma.user.findUnique({ where: { id: userID } });
      if (!user) throw new ValidationError("User not found");
      const parentComment = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!parentComment) throw new ValidationError("Parent comment not found");

      const newReply = await prisma.comment.create({
        data: {
          userId: userID,
          postId: parentComment.postId,
          content,
          parentId: commentId || null 
        },
        include: commentIncludeConfig
      });
      return newReply;
    } catch (error: any) {
      throw new DatabaseError(`Failed to create comment: ${error.message}`);
    }
  }

  async getCommentsByPostId(postId: number, page: number = 1, limit: number = this.DEFAULT_PAGE_SIZE): Promise<Comment[]> {
    try {
      const skip = (page - 1) * limit;
      return await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
           user: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              isOnline: true,
              lastSeenAt: true,

            }
          },
           reactions: true,
           replies: true,
           }
      });
    } catch (error: any) {
      throw new DatabaseError(`Failed to get comments: ${error.message}`);
    }
  }
  

  
}