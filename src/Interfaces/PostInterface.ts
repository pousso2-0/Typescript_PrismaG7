// PostInterface.ts





export interface PostService {
    createPost(userId: number, postData: CreatePostInput): Promise<Post>;
    getPostById(postId: number): Promise<Post>;
    updatePost(postId: number, userId: number, updateData: UpdatePostInput): Promise<Post>;
    deletePost(postId: number, userId: number): Promise<Post>;
    getUserPosts(userId: number, page?: number, limit?: number): Promise<Post[]>;
    incrementShareCount(postId: number): Promise<Post>;
    getAllPosts(page?: number, limit?: number): Promise<Post[]>;
  }

  import { UserSearchResult } from './UserInterface';


export interface Post {
  id: number;
  userId: number;
  content: string;
  isPublic: boolean;
  reactionCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  commentsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: UserSearchResult;
  comments: Comment[];
  reactions: Reaction[];
  favorites: Favorite[];
  views: View[];
  retweets: Retweet[];
  media: Media[];
  shares: Share[];
}


export interface CreatePostInput {
  content: string;
  isPublic?: boolean;
  commentsEnabled?: boolean;
  media?: Media[];
}

export interface UpdatePostInput {
  content?: string;
  isPublic?: boolean;
  commentsEnabled?: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  reaction: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  id: number;
  userId: number;
  reactionType: string;
  postId: number | null;
  commentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: number;
  userId: number;
  postId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface View {
  id: number;
  userId: number;
  postId: number | null;
  statusId: number | null;
  createdAt: Date;
}

export interface Retweet {
  id: number;
  userId: number;
  postId: number;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Share {
  id: number;
  userId: number;
  postId: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Media {
  id: number;
  postId: number;
  url: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

// Configuration for Prisma includes
export const postIncludeConfig = {
  user: {
    select: {
      id: true,
      name: true,
      profilePicture: true,
      isOnline: true,
      lastSeenAt: true,
    }
  },
  media: true,
  comments: true,
  reactions: true,
  favorites: true,
  views: true,
  retweets: true,
  shares: true
};
