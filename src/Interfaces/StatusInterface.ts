import { User , UserSearchResult } from './UserInterface';
import {userSelectConfig} from "./PostInterface";

export interface Status {
  id: number;
  userId: number;
  content: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
  viewsCount: number;
  createdAt: Date;
  expiresAt: Date;
  user?: UserSearchResult;
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
  user: {
    select: userSelectConfig, // Réutilisation de la configuration
  },
};