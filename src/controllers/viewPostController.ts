// src/controllers/ViewPostController.ts
import { Request, Response } from 'express';
import ViewPostService from '../services/viewService';

class ViewPostController {
  static async recordView(req: Request, res: Response) {
    try {
      const postId = parseInt(req.body.postId, 10);
      const userId = req.userId as number;

      const result = await ViewPostService.recordView(userId, postId );

      if (result.message === 'Post déjà vu') {
        return res.status(200).json(result);
      }

      res.status(201).json(result);

    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  }
}

export default ViewPostController;
