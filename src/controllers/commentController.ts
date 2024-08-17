import { Request, Response, RequestHandler } from 'express';
import { CommentService } from '../services/commentService';

// Définir une interface pour les requêtes authentifiées
interface AuthenticatedRequest extends Request {
  userId?: number;
  userType?: string;
}

const commentService = new CommentService();

export class CommentController {
  createComment: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.userId; // Utiliser req.userId

      const comment = await commentService.createComment(userId, Number(postId), content);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getComment: RequestHandler = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const comment = await commentService.getCommentById(Number(id));
      res.status(200).json(comment);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };

  updateComment: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { id } = req.params;
      const { content } = req.body;
      const userId = req.userId;

      const comment = await commentService.updateComment(Number(id), userId, content);
      res.status(200).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  deleteComment: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { id } = req.params;
      const userId = req.userId;

      const comment = await commentService.deleteComment(Number(id), userId);
      res.status(200).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getCommentsByPost: RequestHandler = async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const { page, limit } = req.query;

      const comments = await commentService.getCommentsByPostId(
        Number(postId),
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined
      );
      res.status(200).json(comments);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}

export default new CommentController();
