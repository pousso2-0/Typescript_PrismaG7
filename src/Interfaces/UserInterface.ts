import { User } from '@prisma/client';

//  export interface User {
//     id: number;
//     name: string;
//     email: string;
//     password: string;
//     subscriptionType: string;
//     premiumExpiresAt: Date | null;
//     credits: number;
//     createdAt: Date;
//     updatedAt: Date;
//     posts: Post[];
//     comments: Comment[];
//     likes: Like[];
//     dislikes: Like[];
//     bookmarks: Bookmark[];
//     notifications: Notification[];
//     followers: User[];
//  }

// export type registerInput = Pick < User , 'name'| 'email' |'password' | 'type' > & {
//   profilePicture?: string;
//   bio?: string;
//   location?: string;
//   dateOfBirth?: Date;
//   gender?: string;
//   phone?: string;
//   website?: string;
//   followersCount?: number;
//   followingCount?: number;
//   postsCount?: number;
//   isPrivate?: boolean;
//   notificationsEnabled?: boolean;
//   reportCount?: number;
//   isBlocked?: boolean;
// };


export interface Register{
  name: string; // Assurez-vous que ces propriétés correspondent au modèle Prisma
  email: string;
  password: string;
  type: 'CLIENT' | 'TAILLEUR' | 'VENDEUR' | 'ADMIN';
  profilePicture?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: Date;
  gender?: string;
  phone?: string;
  website?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isPrivate?: boolean;
  notificationsEnabled?: boolean;
  reportCount?: number;
  isBlocked?: boolean;
  
}

  export interface Login{
    email: string;
    password: string;
  }
  
  export interface UpdateUser {
    name?: string;
    email?: string;
    profilePicture?: string;
    bio?: string;
    location?: string;
    gender?: string;
    phone?: string;
    skills?: [];
  }
  