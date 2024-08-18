
import { Share , Retweet , View , Favorite ,Reaction , Post , Comment} from './PostInterface';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  type: string; 
  profilePicture: string | null;
  bio: string | null;
  location: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  phone: string  | null; 
  website: string | null;
  followersCount: number ;
  followingCount:  number ;
  postsCount: number ;
  isPrivate: boolean ;
  notificationsEnabled: boolean;
  reportCount: number;
  isBlocked: boolean;
  credits: number;
  subscriptionType: string ;
  premiumExpiresAt: Date | null;
  createdAt: Date;
  posts?: Post[];
  comments?: Comment[];
  reactions?: Reaction[];
  favorites?: Favorite[];
  followedBy?: Follow[];
  following?: Follow[];
  sentMessages?: Message[];
  receivedMessages?: Message[];
  mesure?: Mesure;
  notifications?: Notification[];
  statuses?: Status[];
  votes?: Vote[];
  votesAsTailor?: Vote[];
  views?: View[];
  viewedStatuses?: View[];
  reports?: Report[];
  retweets?: Retweet[];
  reportedBy?: Report[];
  shares?: Share[];
}


export interface Follow {
  id: number;
  followerId: number;
  followeeId: number;
  follower?: User;
  followee?: User;
}

export interface Conversation {
  id: number;
  senderId: number;
  receiverId: number;
  lastMessage: Message;  // Dernier message de la conversation
  unreadCount: number;   // Nombre de messages non lus
  createdAt: Date;
  updatedAt: Date;
}
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;  // Indique si le message a été lu
  senderDeleted:    boolean | null; //
  receiverDeleted: boolean |null; // Indique si le message a été 
  conversationId: number;
  createdAt: Date;
}

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


export interface Mesure  extends Measurement{
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface Status {
  id: number;
  userId: number;
  content?: string;
  mediaType?: string;
  mediaUrl?: string;
  viewsCount: number;
  createdAt: Date;
  expiresAt: Date;
  user?: User;
  viewedBy?: View[];
}

export interface Vote {
  id: number;
  userId: number;
  tailorId: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  tailor?: User;
}
export interface Report {
  id: number;
  signaledId: number;
  signalerId: number;
  reasons: string;
  createdAt: Date;
  updatedAt: Date;
  signaled?: User;
  signaler?: User;
}
export interface UserFollow {
  id: number;
  name: string;
}
export interface TailorRating {
  averageRating: number;
  totalVotes: number;
}

export type Gender = 'male' | 'female';
export type MeasurementKey = keyof Measurement;


export interface Register{
  name: string; 
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
  

  // Configuration for Prisma includes
export const UserIncludeConfig = {

  favorites: true,
  retweets: true,
  statuses:true,
  shares: true,
  followedBy:true,
  mesure: true,
  posts: true,
  following: true
};
