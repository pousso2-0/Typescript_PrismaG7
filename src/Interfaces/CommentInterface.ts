// CommentInterface.ts

import { User, Post, Reaction } from '@prisma/client';

export interface CommentService {
  createComment(userId: number, postId: number, content: string): Promise<Comment>;
  getCommentById(commentId: number): Promise<Comment>;
  updateComment(commentId: number, userId: number, content: string): Promise<Comment>;
  deleteComment(commentId: number, userId: number): Promise<Comment>;
  getCommentsByPostId(postId: number, page?: number, limit?: number): Promise<Comment[]>;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  reaction: string | null;
  createdAt: Date;
  updatedAt: Date;
  post: Post;
  user: User;
  reactions: Reaction[];
}

// Configuration pour Prisma includes
export const commentIncludeConfig = {
  post: true,
  user: true,
  reactions: true
};