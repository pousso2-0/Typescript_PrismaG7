// import { Request, Response } from 'express';
// import { CommentService } from '../services/commentService';

// interface AuthenticatedRequest extends Request {
//   user: {
//     id: number;
//     type: string;
//   };
// }

// const commentService = new CommentService();

// export class CommentController {
//     async createComment(req: AuthenticatedRequest, res: Response) {
//         try {
//           const { postId } = req.params;
//           const { content } = req.body;
//           const userId = req.user.id;
    
//           console.log('req.user:', req.user);
//           console.log('userId:', userId);
    
//           const comment = await commentService.createComment(userId, Number(postId), content);
//           res.status(201).json(comment);
//         } catch (error: any) {
//           res.status(400).json({ message: error.message });
//         }
//       }

//   async getComment(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const comment = await commentService.getCommentById(Number(id));
//       res.status(200).json(comment);
//     } catch (error: any) {
//       res.status(404).json({ message: error.message });
//     }
//   }

//   async updateComment(req: AuthenticatedRequest, res: Response) {
//     try {
//       const { id } = req.params;
//       const { content } = req.body;
//       const userId = req.user.id;

//       const comment = await commentService.updateComment(Number(id), userId, content);
//       res.status(200).json(comment);
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   }

//   async deleteComment(req: AuthenticatedRequest, res: Response) {
//     try {
//       const { id } = req.params;
//       const userId = req.user.id;

//       const comment = await commentService.deleteComment(Number(id), userId);
//       res.status(200).json(comment);
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   }

//   async getCommentsByPost(req: Request, res: Response) {
//     try {
//       const { postId } = req.params;
//       const { page, limit } = req.query;

//       const comments = await commentService.getCommentsByPostId(
//         Number(postId),
//         page ? Number(page) : undefined,
//         limit ? Number(limit) : undefined
//       );
//       res.status(200).json(comments);
//     } catch (error: any) {
//       res.status(400).json({ message: error.message });
//     }
//   }
// }

// export default new CommentController();