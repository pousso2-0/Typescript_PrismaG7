import { Request, Response } from 'express';
import ReactionService from '../services/reactionService';
import { ReactionToggle } from '../Interfaces/ReactionInterface';

interface AuthRequest extends Request {
  userId?: number;
}

class ReactionController {
  static async toggleReaction(req: AuthRequest, res: Response): Promise<void> {
    const { postId, commentId, reactionType } = req.body as ReactionToggle;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    try {
      if (!reactionType || (!postId && !commentId) || (postId && commentId)) {
        res.status(400).json({ message: 'Invalid request' });
        return;
      }

      const result = await ReactionService.toggleReaction(userId, { reactionType, postId, commentId });
      res.status(result.removed ? 204 : 200).json(result);
    } catch (error) {
      res.status(400).json({ message: `Failed to toggle reaction: ${(error as Error).message}` });
    }
  }

  static async getReactionsForPost(req: Request, res: Response): Promise<void> {
    const postId = parseInt(req.params.postId);

    try {
      const reactions = await ReactionService.getReactionsForPost(postId);
      res.json(reactions);
    } catch (error) {
      res.status(400).json({ message: `Failed to get reactions for post: ${(error as Error).message}` });
    }
  }

  static async getReactionsForComment(req: Request, res: Response): Promise<void> {
    const commentId = parseInt(req.params.commentId);

    try {
      const reactions = await ReactionService.getReactionsForComment(commentId);
      res.json(reactions);
    } catch (error) {
      res.status(400).json({ message: `Failed to get reactions for comment: ${(error as Error).message}` });
    }
  }
}

export default ReactionController;