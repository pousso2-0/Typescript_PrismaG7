import { Request, Response } from 'express';
import ShareFavService from '../services/sharFavService';

class ShareFavController {
  static async retweetPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const { postId, content } = req.body;

      const share = await ShareFavService.retweetPost(userId, postId, content);

      res.status(201).json({ message: 'Post retweet successfully', share });
    } catch (error: any) {
      res.status(400).json({ message: `Failed to retweet post: ${error.message}` });
    }
  }

  static async addToFavorites(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number; 
      const { postId } = req.body;

      const favorite = await ShareFavService.addToFavorites(userId, postId);

      res.status(201).json({ message: 'Post added to favorites successfully', favorite });
    } catch (error: any) {
      res.status(400).json({ message: `Failed to add post to favorites: ${error.message}` });
    }
  }

  static async getUserRetweet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;

      const shares = await ShareFavService.getUserRetweet(userId);

      res.status(200).json(shares);
    } catch (error: any) {
      res.status(400).json({ message: `Failed to get user retweet: ${error.message}` });
    }
  }

  static async getUserFavorites(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;

      const favorites = await ShareFavService.getUserFavorites(userId);

      res.status(200).json(favorites);
    } catch (error: any) {
      res.status(400).json({ message: `Failed to get user favorites: ${error.message}` });
    }
  }

  static async deleteFromFavorites(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const postId = parseInt(req.params.postId);

      const result = await ShareFavService.deleteFromFavorites(userId, postId);

      if (!result) {
        res.status(404).json({ message: 'Post not found in favorites' });
      } else {
        res.status(204).json({ message: 'Post deleted from favorites successfully' });
      }
    } catch (error: any) {
      res.status(400).json({ message: `Failed to delete post from favorites: ${error.message}` });
    }
  }
}


export default ShareFavController;