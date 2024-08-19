// src/services/ConversationService.ts
import { PrismaClient } from '@prisma/client';
import { Conversation , Message } from '../Interfaces/UserInterface';

const prisma = new PrismaClient();

class ConversationService {
  // Vérification de l'accès à la conversation
  static async verifyUserAccessToConversation(userId: number, conversationId: number): Promise<boolean> {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });
    return !!conversation;
  }

  // Marquer les messages reçus comme lus
  static async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });
  }

  // Envoi de message et gestion de la conversation
  static async sendMessage(senderId: number, receiverId: number, content: string): Promise<Message> {
      console.log(senderId , receiverId , "cest ca le content", content);
  

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { senderId, receiverId }
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        content,
      }
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    return newMessage;
  }

  // Récupérer tous les messages d'une conversation
  static async getConversationMessages(conversationId: number, userId: number): Promise<Message[]> {
    const hasAccess = await this.verifyUserAccessToConversation(userId, conversationId);
    if (!hasAccess) {
      throw new Error('Access denied.');
    }

    // Marquer les messages comme lus pour l'utilisateur connecté
    await this.markMessagesAsRead(conversationId, userId);

    return prisma.message.findMany({
      where: {
        conversationId,
        AND: [
          {
            OR: [
              // Inclure les messages envoyés par l'utilisateur ou reçus et non supprimés
              { senderId: userId, senderDeleted: false },
              { receiverId: userId, receiverDeleted: false }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
  }
 // Récupérer toutes les conversations pour un utilisateur
 static async getUserConversations(userId: number): Promise<Conversation[]> {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    include: {
      messages: {
        where: {
          AND: [
            {
              OR: [
                // Inclure les messages envoyés par l'utilisateur ou reçus et non supprimés
                { senderId: userId, senderDeleted: false },
                { receiverId: userId, receiverDeleted: false }
              ]
            }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return conversations.map(conversation => {
    const lastMessage = conversation.messages[0]?.content || null;
    return {
      id: conversation.id,
      senderId: conversation.senderId,
      receiverId: conversation.receiverId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessage: lastMessage,
      unreadCount: conversation.messages.filter(message => message.receiverId === userId && !message.isRead).length
    };
  });
}

// Supprimer un message
static async deleteMessage(id: number, userId: number): Promise<void> {
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) {
    throw new Error('Message not found');
  }

  if (message.senderId === userId) {
    const now = new Date();
    const createdAt = new Date(message.createdAt);
    const diff = now.getTime() - createdAt.getTime();

    if (diff <= 30 * 60 * 1000) {
      // Supprimez le message des deux côtés
      await prisma.message.delete({ where: { id } });
    } else {
      // Supprimez le message seulement du côté de l'expéditeur
      await prisma.message.update({
        where: { id },
        data: { senderDeleted: true }
      });
    }
  } else if (message.receiverId === userId) {
    // Supprimez le message seulement du côté du destinataire
    await prisma.message.update({
      where: { id },
      data: { receiverDeleted: true }
    });
  } else {
    throw new Error('Unauthorized');
  }
}
}

export default ConversationService;
