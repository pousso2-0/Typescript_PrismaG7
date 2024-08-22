// CommentInterface.ts

import { Reaction } from './PostInterface';
import { UserSearchResult } from './UserInterface';

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
  parentId: number;
  createdAt: Date;
  updatedAt: Date;
  user: UserSearchResult;
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
  user: UserSearchResult;
  reactions: Reaction[];
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
      profilePicture: true,
      isOnline: true,
      lastSeenAt: true,
    }
  },
  reactions: true,
  replies:true
};