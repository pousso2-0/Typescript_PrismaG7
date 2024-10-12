import { PrismaClient } from '@prisma/client'; 
import { PostServiceImpl } from './postService';
import ConversationService from './messageService'; 

const postService = new PostServiceImpl(); 
const prisma = new PrismaClient(); 

class ShareService {
  // Méthode statique pour partager un post avec plusieurs destinataires
  static async sharePost(senderId: number, postId: number, recipients: number[]): Promise<any> {
    const post = await postService.getPostById(postId); // Récupérer le post à partager
    if (!post) { // Vérifier si le post existe
      throw new Error("Post not found"); // une erreur si le post n'existe pas
    }

    const fullUrl = `${process.env.BASE_URL}/api/posts/${postId}`; // Générer l'URL complète du post
    const content = `Shared post: ${fullUrl}`; // Contenu du message de partage

    // Envoyer les messages aux destinataires
    const sharePromises = recipients.map((recipientId) => 
        ConversationService.sendMessage(senderId, recipientId, content) // Appel du service pour envoyer un message
    );

    const sharedMessages = await Promise.all(sharePromises); // Attendre que tous les messages soient envoyés

    await postService.incrementShareCount(postId); // Incrémenter le compteur de partages du post

    return {
      sharedMessages, // Retourner les messages partagés
      fullUrl, // Retourner l'URL du post
    };
  }
}

export default ShareService; // Exporter la classe ShareService
