// src/controllers/PostController.ts
import { Request, Response } from 'express';
import { PostServiceImpl } from '../services/postService';
import { CreatePostInput, UpdatePostInput } from '../Interfaces/PostInterface';

const postService = new PostServiceImpl();

class PostController {
  static async createPost(req: Request, res: Response) {
    try {
      const userId = req.userId as number; 
      const postData: CreatePostInput = req.body;
      const newPost = await postService.createPost(userId, postData);
      return res.status(201).json(newPost);
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  }

  static async getPostById(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params.id);
      const post = await postService.getPostById(postId);
      return res.json(post);
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