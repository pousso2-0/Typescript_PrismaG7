// src/controllers/NotificationController.ts
import { Request, Response } from 'express';
import NotificationService from '../services/notificationService';
import { Notification } from '../Interfaces/UserInterface';

class NotificationController {
  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number; // Assurez-vous que userId est bien un nombre
      const notifications: Notification[] = await NotificationService.getNotifications(userId);
      res.status(200).json(notifications);
    } catch (error: any) {
      res.status(400).json({ message: `Failed to get notifications: ${error.message}` });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id, 10); // Convertir l'ID en nombre
      const userId = req.userId as number; // Assurez-vous que userId est bien un nombre
      const notification = await NotificationService.markAsRead(notificationId, userId);
      res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error: any) {
      res.status(400).json({ message: `Failed to mark notification as read: ${error.message}` });
    }
  }

  static async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, message } = req.body;

       // Validation simple
       if (typeof userId !== 'number' || !message) {
        res.status(400).json({ message: 'User ID and message are required' });
        return; // Assurez-vous d'utiliser 'return' pour sortir de la fonction sans valeur
      }
      await NotificationService.sendNotification(userId, message);

      res.status(201).json({ message: 'Notification sent successfully' });
    } catch (error: any) {
      res.status(400).json({ message: `Failed to send notification: ${error.message}` });
    }
  }

  static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id, 10);
      const userId = req.userId as number;
      await NotificationService.deleteNotification(notificationId, userId);
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ message: `Failed to delete notification: ${error.message}` });
    }
  }

  static async markAsUnread(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = parseInt(req.params.id, 10);
      const userId = req.userId as number;
      const notification = await NotificationService.markAsUnread(notificationId, userId);
      res.status(200).json({ message: 'Notification marked as unread', notification });
    } catch (error: any) {
      res.status(400).json({ message: `Failed to mark notification as unread: ${error.message}` });
    }
  }
}

export default NotificationController;
