import { Request, Response } from 'express';
import StatusService from '../services/statusService';
// import MessageService from '../services/messageService';
import { StatusCreate } from '../Interfaces/StatusInterface';
import ConversationService from '../services/messageService';

class StatusController {
    static async createStatus(req: Request, res: Response): Promise<void> {
        try {
          const { content, mediaType, mediaUrl } = req.body;
          const userId = req.userId as number;
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
          const statusData: StatusCreate = { userId, content, mediaType, mediaUrl, expiresAt };
          const status = await StatusService.createStatus(userId, statusData);
          res.status(201).json(status);
        } catch (error : any) {
          res.status(400).json({ message: `Failed to create status: ${error.message}` });
        }
    }
    
    
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const statusId = parseInt(req.params.statusId);
      const userId = req.userId as number;
      const status = await StatusService.getStatusById( statusId , userId );
      res.status(200).json(status);
    } catch (error : any) {
      res.status(400).json({ message: `Failed to get status: ${error.message}` });
    }
  }

  static async viewStatus(req: Request, res: Response): Promise<void> {
    try {
      const statusId = parseInt(req.params.statusId);
      const userId = req.userId as number;
      const status = await StatusService.viewStatus(statusId, userId);
      res.status(200).json(status);
    } catch (error : any) {
      res.status(400).json({ message: `Failed to view status: ${error.message}` });
    }
  }

  static async getFollowedUserStatuses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const statuses = await StatusService.getFollowedUserStatuses(userId, page, limit);
      res.status(200).json(statuses);
    } catch (error : any) {
      res.status(400).json({ message: `Failed to get followed user statuses: ${error.message}` });
    }
  }

  static async deleteStatus(req: Request, res: Response): Promise<void> {
    try {
      const statusId = parseInt(req.params.statusId);
      const userId = req.userId as number;
      await StatusService.deleteStatus(statusId, userId);
      res.status(204).json({ message: 'Status deleted successfully' });
    } catch (error : any) {
      res.status(400).json({ message: `Failed to delete status: ${error.message}` });
    }
  }

  static async getUserStatuses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const statuses = await StatusService.getUserStatuses(userId, page, limit);
      res.status(200).json(statuses);
    } catch (error : any) {
      res.status(400).json({ message: `Failed to get user statuses: ${error.message}` });
    }
  }

  static async sendMessageToStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const { messageContent, statusId } = req.body;

      const status = await StatusService.getStatusById(statusId , userId);

      if (!status) {
        res.status(404).json({ message: 'Status not found' });
        return;
      }


      const statusUri = `${req.protocol}://${req.get('host')}/api/status/${statusId}`;
      const content = `${messageContent}\n\nSee the status here: ${statusUri}`;

      console.log(status);
           
     const newMessage = await ConversationService.sendMessage(userId, status.userId, content);

     // Envoyer une réponse après l'envoi du message
     res.status(200).json({ message: 'Message sent successfully', newMessage });
   } catch (error: any) {
     res.status(500).json({ message: `Failed to send message: ${error.message}` });
   }
  }
}

export default StatusController;