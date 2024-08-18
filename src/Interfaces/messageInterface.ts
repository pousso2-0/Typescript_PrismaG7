import { User } from '@prisma/client';

export interface Message {
    id?: number; // Optionnel si auto-généré
    senderId: number;
    receiverId: number ;
    content: string;
    conversationId: string;
    isRead?: boolean; // Optionnel, selon votre modèle
    createdAt?: Date; // Optionnel, selon votre modèle
    updatedAt?: Date; // Optionnel, selon votre modèle
}

