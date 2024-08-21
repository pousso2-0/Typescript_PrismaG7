import { Request, Response } from 'express';
import { Message } from '../Interfaces/UserInterface'; // Import du type Message
import ShareService from '../services/shareService';

class ShareController {
  static async sharePost(req: Request, res: Response) {
    console.log("sharePost function called"); 
    try {
      const senderId = req.userId as number; // Assurez-vous que userId est extrait de la session ou du token JWT
      const { postId, recipients } = req.body;

      console.log("Request body:", req.body);
      console.log("Sender ID:", senderId);

      const result = await ShareService.sharePost(senderId, postId, recipients);

      const response = {
        message: "Post shared successfully",
        sharedMessages: result.sharedMessages.map((msg: Message) => ({
          messageId: msg.id,
          recipientId: msg.receiverId,
          content: msg.content
        })),
        fullUrl: result.fullUrl
      };

      console.log("Response being sent:", response);

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Error sharing post:", error);
      res.status(400).json({ message: error.message });
    }
  }
}

export default ShareController;
