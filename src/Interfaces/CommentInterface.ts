// CommentInterface.ts

import { Reaction } from '@prisma/client';

export interface CommentService {
  createComment(userId: number, postId: number, content: string): Promise<Comment>;
  getCommentById(commentId: number): Promise<Comment>;
  updateComment(commentId: number, userId: number, content: string): Promise<Comment>;
  deleteComment(commentId: number, userId: number): Promise<Comment>;
  getCommentsByPostId(postId: number, page?: number, limit?: number): Promise<CommentWithLimitedUserInfo[]>;
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

export interface CommentWithLimitedUserInfo {
  id: number;
  postId: number;
  userId: number;
  content: string;
  reaction: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: LimitedUserInfo;
  reactions: Reaction[];
}

export interface LimitedUserInfo {
  id: number;
  name: string;
  profilePicture: string | null;
}

export interface Post {
  id: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export const commentIncludeConfig = {
  post: true,
  user: {
    select: {
      id: true,
      name: true,
      profilePicture: true
    }
  },
  reactions: true
};