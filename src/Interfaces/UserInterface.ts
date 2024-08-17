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


export type loginInput = Pick < User, 'email' | 'password'>;

export interface UserProfile extends User {}
export interface Register{
  name: string; // Assurez-vous que ces propriétés correspondent au modèle Prisma
  email: string;
  password: string;
  type: 'CLIENT' | 'TAILLEUR' | 'VENDEUR' | 'ADMIN';
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
  
  export interface UserSearchResult {
    id: number;
    name: string;
    profilePicture: string | null;
  }
  

 export interface FollowResult {
    id: number;
    followerId: number;
    followeeId: number;
  }
  
 export interface UserFollow {
    id: number;
    name: string;
  }

 export interface VoteResult {
    id: number;
    userId: number;
    tailorId: number;
    rating: number;
  }
  
 export interface TailorRating {
    averageRating: number;
    totalVotes: number;
  }
  
  export type Gender = 'male' | 'female';
  export type MeasurementKey = keyof Measurement;
  
  export interface Measurement {
    taille?: number;
    tourPoitrine?: number;
    tourTaille?: number;
    tourHanche?: number;
    longueurDos?: number;
    largeurEpaules?: number;
    longueurManche?: number;
    tourCou?: number;
    longueurJambe?: number;
    tourCuisse?: number;
    tourBras?: number;
  }
  


// src/interfaces/Report.ts
export interface Report {
  id: number;
  signalerId: number;
  signaledId: number;
  reasons: string;
  createdAt: Date;
}


// src/interfaces/Notification.ts
export interface Notification {
  userId: number; // ID de l'utilisateur qui reçoit la notification
  message: string;   // Contenu de la notification
  read: boolean;     // Indique si la notification a été lue
}

export interface NotificationResult {
  id: number;
  userId: number;
  message:  string
  read: boolean;
  createdAt: Date;
}

