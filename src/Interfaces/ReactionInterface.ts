import { User } from './UserInterface';
import { Post } from './PostInterface';
import { Comment } from './CommentInterface';

export interface Reaction {
  id: number;
  userId: number;
  reactionType: string;
  postId?: number | null;
  commentId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  post?: Post | null;
  comment?: Comment | null;
}

export interface ReactionCreate {
  userId: number;
  reactionType: string;
  postId?: number;
  commentId?: number;
}

export interface ReactionUpdate {
  reactionType?: string;
}

export interface ReactionToggle {
  reactionType: string;
  postId?: number;
  commentId?: number;
}

export interface ReactionResponse {
  removed?: boolean;
  updated?: boolean;
  created?: boolean;
  reaction?: Reaction;
}

export type ReactionWithUser = Reaction & { user: User };
export type ReactionWithPost = Reaction & { post: Post };
export type ReactionWithComment = Reaction & { comment: Comment };

export const ReactionIncludeConfig = {
  user: true,
  post: true,
  comment: true
};