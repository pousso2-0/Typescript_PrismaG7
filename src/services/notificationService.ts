// src/services/NotificationService.ts
import { Notification  } from '../Interfaces/UserInterface';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
class NotificationService  {
  static async sendNotification(userId: number, message: string): Promise<void> {
    const notification = await prisma.notification.create({
      data: {
        userId: userId,
        message,
        read: false,
        createdAt: new Date(),
      }
    });
    console.log(`Notification envoyée à l'utilisateur ${userId}: ${message}`);
  }

  static async getNotifications(userId: number): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return notifications ;
  }

  static async markAsRead(notificationId: number, userId: number): Promise<Notification> {

    // verifié si l'utilisateur connecté est le proprietaire du notification

    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notif) {
      throw new Error('Notification not found');
    }
    if (notif.userId!== userId) {
      throw new Error('Unauthorized');
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId, userId: userId },
      data: { read: true },
    });


    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification as Notification;
  }
  static async deleteNotification(notificationId: number, userId: number): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  static async markAsUnread(notificationId: number, userId: number): Promise<Notification> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: false },
    });

    return updatedNotification as Notification;
  }
}

export default NotificationService;
