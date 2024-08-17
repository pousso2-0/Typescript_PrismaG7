import { Request, Response } from 'express';
import VoteService from '../services/voteService';

class VoteController {
  static async vote(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const { tailorId, rating } = req.body;

      if (rating < 1 || rating > 5) {
        res.status(400).json({ message: 'Rating must be between 1 and 5' });
        return;
      }

      const vote = await VoteService.voteForTailor(userId, tailorId, rating);
      res.status(201).json({ message: 'Vote recorded successfully', vote });
    } catch (error:any) {
      res.status(400).json({ message: `Failed to vote: ${error.message}` });
    }
  }

  static async getTailorRating(req: Request, res: Response): Promise<void> {
    try {
      const tailorId = req.params.id;

      const rating = await VoteService.getTailorRating(parseInt(tailorId));
      res.status(200).json(rating);
    } catch (error:any) {
      res.status(400).json({ message: `Failed to get rating: ${error.message}` });
    }
  }
}

export default VoteController;
