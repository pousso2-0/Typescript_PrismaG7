// src/controllers/PostController.ts
import { Request, Response } from 'express';
import { PostServiceImpl } from '../services/postService';
import { CreatePostInput, UpdatePostInput } from '../Interfaces/PostInterface';
import ViewService from '../services/viewService';
import {handleMediaFiles} from "../utils/mediaUtils";

const postService = new PostServiceImpl();



class PostController {
  static async createPost(req: Request, res: Response) {
    try {
      const userId = req.userId as number;
      console.log('les donné du request', req.body)

      // Journaliser le corps de la requête
      console.log('Corps de la requête:', req.body);

      const postData: CreatePostInput = req.body;

      // Vérifiez si postData est correctement peuplé
      console.log('Données du post avant traitement:', req.files);


      const files = req.files as Express.Multer.File[];

      // Traiter les fichiers multimédia
      if (files && files.length > 0) {
        const mediaUrls: string[] = await handleMediaFiles(files, 'media'); // Supposons que le champ "media" contienne les fichiers

        // Ajouter les URLs des médias traités au postData
        postData.media = mediaUrls.map((url, index) => ({
          url,
          type: files[index].mimetype,
        }));
      }
      console.log('Données du post après traitement:', postData);

      const newPost = await postService.createPost(userId, postData);
      return res.status(201).json(newPost);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  }

  static async getPostById(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.id, 10);
      const userId = req.userId as number; // Assurez-vous que userId est disponible

      console.log(userId);
      

      // Enregistrez la vue pour le post
      const { message, view, viewsCount } = await ViewService.recordView(userId, postId);

      // Obtenez le post
      const post = await postService.getPostById(postId);

      // Envoyez la réponse en incluant le message et les données du post
      return res.json({
        message,
        post,
        viewsCount: viewsCount ?? post.viewsCount,
      });
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }
  static async updatePost(req: Request, res: Response) {
    try {
      const userId = req.userId as number;
      const postId = parseInt(req.params.id);
      const updateData: UpdatePostInput = req.body;
      const updatedPost = await postService.updatePost(postId, userId, updateData);
      return res.json(updatedPost);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async deletePost(req: Request, res: Response) {
    try {
      const userId = req.userId as number;
      const postId = parseInt(req.params.id);
      const deletedPost = await postService.deletePost(postId, userId);
      return res.json({ message: "Post deleted successfully", post: deletedPost });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async getUserPosts(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const posts = await postService.getUserPosts(userId, page, limit);
      return res.json(posts);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async incrementShareCount(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.id);
      const updatedPost = await postService.incrementShareCount(postId);
      return res.json(updatedPost);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async getAllPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const posts = await postService.getAllPosts(page, limit);
      return res.json(posts);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default PostController;