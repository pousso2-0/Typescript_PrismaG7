import { Request, Response } from "express";
import ConversationService from "../services/messageService";

class ConversationController {
  static async sendMessage(req: Request, res: Response) {
    const senderId = req.userId as number;
    const { receiverId, content } = req.body;

    try {
      const message = await ConversationService.sendMessage(
        senderId,
        receiverId,
        content
      );
      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserConversations(req: Request, res: Response) {
    const userId = req.userId as number;

    try {
      const conversations = await ConversationService.getUserConversations(
        userId
      );
      res.status(200).json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getConversationMessages(req: Request, res: Response) {
    const userId = req.userId as number;
    const conversationId = parseInt(req.params.conversationId, 10);

    try {
      const messages = await ConversationService.getConversationMessages(
        conversationId,
        userId
      );
      res.status(200).json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  static async deleteMessage(req: Request, res: Response) {
    const userId = req.userId as number;
    const messageId = parseInt(req.params.id);

    try {
      await ConversationService.deleteMessage(messageId, userId);
      return res.status(400).json({ message: "Message deleted successfully" });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
export default ConversationController;
