import { User } from './UserInterface';

export interface Status {
  id: number;
  userId: number;
  content: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
  viewsCount: number;
  createdAt: Date;
  expiresAt: Date;
  user?: User;
}

export interface StatusCreate {
  userId: number;
  content?: string;
  mediaType?: string;
  mediaUrl?: string;
  expiresAt: Date;
}

export interface StatusUpdate {
  content?: string;
  mediaType?: string;
  mediaUrl?: string;
  expiresAt?: Date;
}

export type StatusWithUser = Status & { user: User };

export const StatusIncludeConfig = {
  user: true
};