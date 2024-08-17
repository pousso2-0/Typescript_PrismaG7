// CommentInterface.ts

import { User , Post , Reaction } from '@prisma/client';

export interface CommentService {
  createComment(userId: number, postId: number, commentData: CreateCommentInput): Promise<Comment>;
  getCommentById(commentId: number): Promise<Comment>;
  updateComment(commentId: number, userId: number, updateData: UpdateCommentInput): Promise<Comment>;
  deleteComment(commentId: number, userId: number): Promise<Comment>;
  getPostComments(postId: number, page?: number, limit?: number): Promise<Comment[]>;
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

export interface CreateCommentInput {
  content: string;
  reaction?: string;
}

export interface UpdateCommentInput {
  content?: string;
  reaction?: string;
}

// Configuration pour Prisma includes
export const commentIncludeConfig = {
  post: true,
  user: true,
  reactions: true
};