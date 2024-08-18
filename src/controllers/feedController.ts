import { Request, Response } from 'express';
import FeedService from '../services/feedService';

class FeedController {
  static async getUserFeed(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      // Vérifier si "followingOnly" est présent dans la requête, sinon le définir par défaut
      const followingOnly = req.path.includes('/follow') || req.query.followingOnly === 'true';

      const feed = await FeedService.getUserFeed(userId, page, limit, followingOnly);

      res.json(feed);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default FeedController;
