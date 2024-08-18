import { Request, Response } from 'express';
import MessageService from '../services/messageService';
import { Message } from '../Interfaces/messageInterface';

class MessageController {
    static async sendMessage(req: Request, res: Response) {
        try {
            const senderId = req.userId;
            const { receiverId, content } = req.body;

            if (senderId === undefined) {
                return res.status(400).json({ message: 'Sender ID is required' });
            }

            if (!receiverId || !content) {
                return res.status(400).json({ message: 'Receiver ID and content are required' });
            }

            // Création d'un message avec des valeurs par défaut pour les propriétés manquantes
            const message: Message = {
                id: 0, // Id par défaut (peut être généré par la base de données)
                senderId,
                receiverId,
                content,
                conversationId: MessageService.createConversationId(senderId, receiverId),
                isRead: false, // Valeur par défaut
                createdAt: new Date(), // Valeur par défaut
                updatedAt: new Date(), // Valeur par défaut
            };

            const createdMessage = await MessageService.sendMessage(message);
            res.status(201).json(createdMessage);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred' });
            }
        }
    }

    static async getAllUserMessages(req: Request, res: Response) {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                return res.status(400).json({ message: 'User ID is required' });
            }
            const messages = await MessageService.getAllUserMessages(userId);
            res.status(200).json(messages);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred' });
            }
        }
    }

    static async getConversations(req: Request, res: Response) {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                return res.status(400).json({ message: 'User ID is required' });
            }
            const conversations = await MessageService.getConversations(userId);
            res.status(200).json(conversations);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred' });
            }
        }
    }

    static async deleteMessage(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            if (!id || userId === undefined) {
                return res.status(400).json({ message: 'Message ID and User ID are required' });
            }
            await MessageService.deleteMessage(parseInt(id), userId);
            res.status(200).json({ message: 'Message deleted successfully' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred' });
            }
        }
    }

    static async getMessagesWithUser(req: Request, res: Response) {
        try {
            const userId = req.userId;
            const { otherUserId } = req.params;
            if (userId === undefined || !otherUserId) {
                return res.status(400).json({ message: 'User ID and Other User ID are required' });
            }
            const messages = await MessageService.getMessagesBetweenUsers(userId, parseInt(otherUserId));
            res.status(200).json(messages);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'An unknown error occurred' });
            }
        }
    }
}

export default MessageController;
