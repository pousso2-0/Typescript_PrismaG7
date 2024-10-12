import { PrismaClient } from '@prisma/client';
import { StatusCreate, StatusUpdate , Status , StatusIncludeConfig} from '../Interfaces/StatusInterface';
import { ValidationError, DatabaseError } from '../errors/customErrors';
import ViewService from './viewService';
import MediaService from "./mediaService";

const prisma = new PrismaClient();

class StatusService {
  static async createStatus(userId: number, statusData: StatusCreate): Promise<Status> {
    try {
      const status = await prisma.status.create({
        data: {
          userId,
          content: statusData.content,
          mediaType: statusData.mediaType,
          mediaUrl: statusData.mediaUrl,
          expiresAt: statusData.expiresAt, // Utilisez la date d'expiration calculée
          viewsCount: 0,
        },
      });
      return status;
    } catch (error: any) {
      throw new DatabaseError(`Failed to create status: ${error.message}`);
    }
  }
    

    static async getStatusById(statusId: number, userId: number): Promise<Status> {
      try {
        const status = await prisma.status.findUnique({
          where: {
            id: statusId,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: StatusIncludeConfig,
        });
  
        if (!status) {
          throw new ValidationError('Status not found or has expired');
        }
  
        // Enregistrer une vue pour le statut et incrémenter le compteur de vues
        await ViewService.recordView(userId, undefined, statusId);
  
        return status;
      } catch (error: any) {
        throw new DatabaseError(`Failed to get status: ${error.message}`);
      }
    }

  static async viewStatus(statusId: number, userId: number): Promise<Status> {
    try {
      const status = await prisma.status.findUnique({
        where: { id: statusId }  // Assurez-vous que 'id' est bien le nom du champ dans votre schéma Prisma
      });
      
      if (!status) {
        throw new ValidationError("Status not found");
      }
      
      if (status.userId !== userId) {
        await prisma.status.update({
          where: { id: statusId },
          data: { viewsCount: { increment: 1 } },
        });
      }
      
      return status;
    } catch (error : any) {
      throw new DatabaseError(`Failed to view status: ${error.message}`);
    }
  }

  static async getFollowedUserStatuses(userId: number, page: number = 1, limit: number = 10): Promise<Status[]> {
    try {
      const skip = (page - 1) * limit;
      const statuses = await prisma.status.findMany({
        where: {
          user: {
            followedBy: {
              some: {
                followerId: userId
              }
            }
          },
          expiresAt: {
            gt: new Date() // Cette ligne garantit que seuls les statuts non expirés sont récupérés
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: StatusIncludeConfig,
      });
      return statuses;
    } catch (error : any) {
      throw new DatabaseError(`Failed to get followed user statuses: ${error.message}`);
    }
  }

  static async deleteStatus(statusId: number, userId: number): Promise<Status> {
    try {
      // Trouver d'abord le statut
      const status = await prisma.status.findUnique({
        where: { id: statusId },
      });
  
      // Vérifier si le statut existe et appartient à l'utilisateur
      if (!status || status.userId !== userId) {
        throw new ValidationError("Status not found or you're not authorized to delete it");
      }
  
      // Supprimer le statut
      const deletedStatus = await prisma.status.delete({
        where: { id: statusId },
      });
  
      return deletedStatus;
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete status: ${error.message}`);
    }
  }


  static async getUserStatuses(userId: number, page: number = 1, limit: number = 10): Promise<Status[]> {
    try {
      const skip = (page - 1) * limit;
      const statuses = await prisma.status.findMany({
        where: { 
          userId,
          expiresAt: {
            gt: new Date() // Cette ligne garantit que seuls les statuts non expirés sont récupérés
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: StatusIncludeConfig,
      });
      return statuses;
    } catch (error : any) {
      throw new DatabaseError(`Failed to get user statuses: ${error.message}`);
    }
  }

  static async deleteExpiredStatuses() {
    try {
      const expiredStatuses = await prisma.status.findMany({
        where: {
          expiresAt: {
            lte: new Date(),
          },
        },
      });

      for (const status of expiredStatuses) {
        // Supprimer l'image du cloud si l'URL est présente
        if (status.mediaUrl) {
          await MediaService.deleteMedia(status.mediaUrl);
        }
      }

      const statusIds = expiredStatuses.map(status => status.id);

      // Supprimer les statuts expirés
      await prisma.status.deleteMany({
        where: {
          id: {
            in: statusIds,
          },
        },
      });

    } catch (error: any) {
      throw new DatabaseError(`Failed to delete expired statuses: ${error.message}`);
    }
  }

}

export default StatusService;