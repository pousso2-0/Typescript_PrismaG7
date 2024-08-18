import { PrismaClient, Status as PrismaStatus } from '@prisma/client';
import { ValidationError, DatabaseError } from '../errors/customErrors';

const prisma = new PrismaClient();

class StatusService {
    static async createStatus(userId: number, statusData: { content: string; media?: string; expiresAt?: Date | null }): Promise<PrismaStatus> {
        try {
          if (!userId) {
            throw new ValidationError('User ID is missing');
          }
    
          const status = await prisma.status.create({
            data: {
              userId,
              content: statusData.content,
              media: statusData.media,
              expiresAt: statusData.expiresAt || null, // Utiliser null si expiresAt n'est pas défini
            },
          });
          return status;
        } catch (error) {
          throw new DatabaseError(`Failed to create status: ${(error as Error).message}`);
        }
      }
  static async getStatusById(statusId: number): Promise<PrismaStatus> {
    try {
      const status = await prisma.status.findUnique({
        where: { id: statusId },
        include: { user: { select: { name: true, profilePicture: true } } },
      });
      if (!status) {
        throw new ValidationError('Status not found');
      }
      return status;
    } catch (error) {
      throw new DatabaseError(`Failed to get status: ${(error as Error).message}`);
    }
  }

  static async viewStatus(statusId: number, userId: number): Promise<PrismaStatus> {
    try {
      const status = await prisma.status.findUnique({
        where: { id: statusId },
      });
      if (!status) {
        throw new ValidationError('Status not found');
      }
  
      const existingView = await prisma.view.findFirst({
        where: {
          statusId,
          userId
        }
      });
  
      if (status.userId !== userId && !existingView) {
        await prisma.status.update({
          where: { id: statusId },
          data: {
            viewsCount: status.viewsCount + 1,
          },
        });
  
        await prisma.view.create({
          data: {
            statusId,
            userId
          }
        });
      }
      return status;
    } catch (error) {
      throw new DatabaseError(`Failed to view status: ${(error as Error).message}`);
    }
  }
  

  static async deleteStatus(statusId: number, userId: number): Promise<void> {
    try {
      const deleteResult = await prisma.status.deleteMany({
        where: {
          id: statusId,
          userId,
        },
      });
      if (deleteResult.count === 0) {
        throw new ValidationError('Status not found or you are not authorized to delete it');
      }
    } catch (error) {
      throw new DatabaseError(`Failed to delete status: ${(error as Error).message}`);
    }
  }

  static async getUserStatuses(userId: number, page = 1, limit = 10): Promise<PrismaStatus[]> {
    try {
      const skip = (page - 1) * limit;
      const statuses = await prisma.status.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { name: true, profilePicture: true } } },
      });
      return statuses;
    } catch (error) {
      throw new DatabaseError(`Failed to get user statuses: ${(error as Error).message}`);
    }
  }
}

export default StatusService;
