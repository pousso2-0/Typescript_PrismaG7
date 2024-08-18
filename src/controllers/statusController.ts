import { Request, Response } from 'express';
import StatusService from '../services/statusService';
import MessageService from '../services/messageService';
import { ValidationError, DatabaseError } from '../errors/customErrors';
import { Status } from '../Interfaces/statusInterface';

class StatusController {
  static async createStatus(req: Request, res: Response) {
    try {
      const userId = Number(req.userId); // Convert userId to number
      const { content, media, expiresAt } = req.body;

      if (isNaN(userId)) {
        throw new ValidationError('Invalid User ID');
      }

      const status = await StatusService.createStatus(userId, { content, media, expiresAt });
      res.status(201).json(status);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  static async viewStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id); // Convert id to number
      const userId = Number(req.userId); // Convert userId to number

      if (isNaN(id) || isNaN(userId)) {
        throw new ValidationError('Status ID or User ID is invalid');
      }

      const status = await StatusService.viewStatus(id, userId);

      res.status(200).json(status);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  static async deleteStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id); // Convert id to number
      const userId = Number(req.userId); // Convert userId to number

      if (isNaN(id) || isNaN(userId)) {
        throw new ValidationError('Status ID or User ID is invalid');
      }

      await StatusService.deleteStatus(id, userId);
      res.status(200).json({ message: 'Status deleted successfully' });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  static async getUserStatuses(req: Request, res: Response) {
    try {
      const userId = Number(req.userId); // Convert userId to number
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (isNaN(userId)) {
        throw new ValidationError('User ID is invalid');
      }

      const statuses = await StatusService.getUserStatuses(userId, page, limit);
      res.status(200).json(statuses);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  static async sendMessageToStatus(req: Request, res: Response) {
    try {
      const { id, content } = req.body;
      const userId = Number(req.userId); // Convert userId to number

      if (isNaN(id) || isNaN(userId) || !content) {
        throw new ValidationError('Status ID, User ID, or content is missing');
      }

      const status = await StatusService.getStatusById(id);
      if (!status) {
        throw new ValidationError('Status not found');
      }

      const conversationId = MessageService.createConversationId(userId, status.userId); // Ensure userId is a number

      const newMessage = await MessageService.sendMessage({
        senderId: userId,
        receiverId: status.userId,
        content: content,
        conversationId: conversationId
      });

      res.status(200).json(newMessage);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }
}

export default StatusController;
