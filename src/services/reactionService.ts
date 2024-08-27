import { PrismaClient } from '@prisma/client';
import { ReactionToggle, ReactionResponse, Reaction, ReactionIncludeConfig } from '../Interfaces/ReactionInterface';

const prisma = new PrismaClient(); 

class ReactionService {
  // Méthode pour basculer une réaction (ajouter, mettre à jour ou supprimer)
  static async toggleReaction(userId: number, { reactionType, postId, commentId }: ReactionToggle): Promise<ReactionResponse> {
    // Vérifiez que soit postId soit commentId est fourni, mais pas les deux ou aucun
    if ((postId && commentId) || (!postId && !commentId)) {
      throw new Error('You must provide either postId or commentId, but not both.');
    }

    // Chercher une réaction existante pour l'utilisateur, postId ou commentId
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        userId,
        ...(postId ? { postId } : {}), // Ajouter la condition sur postId si présent
        ...(commentId ? { commentId } : {}), // Ajouter la condition sur commentId si présent
      },
// l'opérateur de déchiquetage (...) est utilisé pour ajouter la propriété correspondant à l'objet cible si elle existe.
    });

    // Si une réaction existante est trouvée
    if (existingReaction) {
      if (existingReaction.reactionType === reactionType) {
        // Si la réaction existante est du même type que la nouvelle, supprimer la réaction
        await prisma.reaction.delete({ where: { id: existingReaction.id } });
        // Mettre à jour le compteur de réactions (décrémenter)
        await this.updateReactionCount(-1, postId, commentId);
        return { removed: true, message: 'Reaction removed successfully.' };
      } else {
        // Sinon, mettre à jour la réaction existante avec le nouveau type
        const updatedReaction = await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { reactionType },
        });
        // Mettre à jour le compteur de réactions (aucun changement)
        await this.updateReactionCount(0, postId, commentId);
        return { updated: true, reaction: updatedReaction };
      }
    } else {
      // Si aucune réaction existante n'est trouvée, en créer une nouvelle
      const newReaction = await prisma.reaction.create({
        data: {
          userId,
          reactionType,
          ...(postId ? { postId } : {}), // Ajouter postId si présent
          ...(commentId ? { commentId } : {}), // Ajouter commentId si présent
        },
      });
      // Mettre à jour le compteur de réactions (incrémenter)
      await this.updateReactionCount(1, postId, commentId);
      return { created: true, reaction: newReaction };
    }
  }

  // Méthode pour obtenir toutes les réactions pour un post spécifique
  static async getReactionsForPost(postId: number): Promise<Reaction[]> {
    const reactions = await prisma.reaction.findMany({
      where: { postId }, // Chercher les réactions associées au postId
      orderBy: { createdAt: 'desc' }, // Ordre décroissant par date de création
      include: ReactionIncludeConfig, // Inclure des informations supplémentaires définies dans ReactionIncludeConfig
    });
    return reactions as Reaction[]; // Retourner les réactions trouvées
  }
  
  // Méthode pour obtenir toutes les réactions pour un commentaire spécifique
  static async getReactionsForComment(commentId: number): Promise<Reaction[]> {
    const reactions = await prisma.reaction.findMany({
      where: { commentId }, // Chercher les réactions associées au commentId
      orderBy: { createdAt: 'desc' }, // Ordre décroissant par date de création
      include: ReactionIncludeConfig, // Inclure des informations supplémentaires définies dans ReactionIncludeConfig
    });
    return reactions as Reaction[]; // Retourner les réactions trouvées
  }

  // Méthode privée pour mettre à jour le compteur de réactions sur un post ou un commentaire
  private static async updateReactionCount(increment: number, postId?: number, commentId?: number): Promise<void> {
    if (postId) {
      await prisma.post.update({
        where: { id: postId }, // Mettre à jour le post avec l'id spécifié
        data: { reactionCount: { increment } }, // Incrémenter ou décrémenter le compteur de réactions
      });
    }

    if (commentId) {
      await prisma.comment.update({
        where: { id: commentId }, // Mettre à jour le commentaire avec l'id spécifié
        data: { reactionCount: { increment } }, // Incrémenter ou décrémenter le compteur de réactions
      });
    }
  }
}

export default ReactionService; // Exporter la classe ReactionService pour utilisation dans d'autres parties de l'application
