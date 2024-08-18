import { PrismaClient } from '@prisma/client';
import {PostServiceImpl} from './postService';
import ConversationService from './messageService';


const postService = new PostServiceImpl();

const prisma = new PrismaClient();

class ShareService {
  static async sharePost(senderId: number, postId: number, recipients: number[]): Promise<any> {
    // Vérifiez si le post existe
    const post = await postService.getPostById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Générez l'URL complète
    const fullUrl = `${process.env.BASE_URL}/api/posts/${postId}`;
    const content = `Shared post: ${fullUrl}`;

    // Envoyer les messages aux destinataires
    const sharePromises = recipients.map((recipientId) => 
        ConversationService.sendMessage(senderId, recipientId, content)
    );

    const sharedMessages = await Promise.all(sharePromises);

    // Incrémenter le compteur de partages du post
    await postService.incrementShareCount(postId);

    return {
      sharedMessages,
      fullUrl,
    };
  }
}

export default ShareService;
