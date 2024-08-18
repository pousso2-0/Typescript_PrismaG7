import { PrismaClient } from '@prisma/client';
import { ValidationError, DatabaseError } from '../errors/customErrors';
import { Message } from '../Interfaces/messageInterface';

const prisma = new PrismaClient();

class MessageService {
    public static createConversationId(userId1: number, userId2: number): string {
        return [userId1, userId2].sort().join('-');
    }

    static async sendMessage(message: Message) {
        try {
            const { senderId, receiverId, content, conversationId } = message;

            if (!content.trim()) {
                throw new ValidationError('Message content cannot be empty');
            }

            const sender = await prisma.user.findUnique({ where: { id: senderId } });
            if (!sender) throw new ValidationError('Sender not found');

            const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
            if (!receiver) throw new ValidationError('Receiver not found');

            const newMessage = await prisma.message.create({
                data: {
                    senderId,
                    receiverId,
                    content,
                    conversationId,
                },
            });

            return newMessage;
        } catch (error: any) {
            console.error(`Failed to send message: ${error.message}`, error);
            throw new DatabaseError(`Failed to send message: ${error.message}`);
        }
    }

    static async getMessagesBetweenUsers(userId: number, otherUserId: number) {
        return prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId },
                ],
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    static async deleteMessage(id: number, userId: number) {
        try {
            const message = await prisma.message.findUnique({ where: { id } });
            if (!message) throw new ValidationError('Message not found');

            if (message.senderId !== userId) throw new ValidationError('Unauthorized');

            return prisma.message.delete({ where: { id } });
        } catch (error: any) {
            throw new DatabaseError(`Failed to delete message: ${error.message}`);
        }
    }

    static async getConversations(userId: number) {
        try {
            const conversations = await prisma.$queryRaw`
                SELECT m.id AS _id, m.conversationId, m.senderId, m.receiverId, m.content, m.createdAt,
                (SELECT COUNT(*) FROM Message WHERE receiverId = ${userId} AND isRead = false) AS unreadCount
                FROM Message m
                WHERE m.senderId = ${userId} OR m.receiverId = ${userId}
                GROUP BY m.conversationId
                ORDER BY m.createdAt DESC
            `;

            return conversations;
        } catch (error: any) {
            throw new DatabaseError(`Failed to retrieve conversations: ${error.message}`);
        }
    }

    static async getAllUserMessages(userId: number) {
        return prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export default MessageService;
