import { PrismaClient, Comment } from "@prisma/client";
import { ValidationError, DatabaseError } from "../errors/customErrors";
import { commentIncludeConfig, CommentWithLimitedUserInfo } from "../Interfaces/CommentInterface";

const prisma = new PrismaClient();

export class CommentService {
  // Taille de page par défaut pour la pagination des commentaires
  private readonly DEFAULT_PAGE_SIZE = 10;

  // Méthode pour créer un nouveau commentaire
  async createComment(userId: number, postId: number, content: string): Promise<Comment> {
    try {
      // Vérifier si l'utilisateur existe
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ValidationError("User not found");

      // Vérifier si le post existe
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) throw new ValidationError("Post not found");
      // Vérifier si les commentaires sont activés pour le post
      if (!post.commentsEnabled) throw new ValidationError("Comments are disabled for this post");

      // Créer un nouveau commentaire dans la base de données
      const newComment = await prisma.comment.create({
        data: {
          userId,
          postId,
          content
        },
        include: commentIncludeConfig // Inclure les informations supplémentaires spécifiées dans la configuration
      });

      // Mettre à jour le nombre de commentaires du post
      await prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      });

      // Retourner le nouveau commentaire créé
      return newComment;
    } catch (error: any) {
      // Lancer une erreur personnalisée si la création du commentaire échoue
      throw new DatabaseError(`Failed to create comment: ${error.message}`);
    }
  }

  // Méthode pour récupérer un commentaire par ID
  async getCommentById(id: number): Promise<Comment> {
    try {
      // Rechercher le commentaire par ID
      const comment = await prisma.comment.findUnique({
        where: { id },
        include: commentIncludeConfig // Inclure les informations supplémentaires spécifiées dans la configuration
      });
      // Vérifier si le commentaire a été trouvé
      if (!comment) throw new ValidationError("Comment not found");
      // Retourner le commentaire trouvé
      return comment;
    } catch (error: any) {
      // Lancer une erreur personnalisée si la récupération du commentaire échoue
      throw new DatabaseError(`Failed to get comment: ${error.message}`);
    }
  }

  // Méthode pour mettre à jour un commentaire existant
  async updateComment(id: number, userId: number, content: string): Promise<Comment> {
    try {
      // Rechercher le commentaire par ID
      const comment = await prisma.comment.findUnique({ where: { id } });
      // Vérifier si le commentaire a été trouvé
      if (!comment) throw new ValidationError("Comment not found");
      // Vérifier si l'utilisateur a les droits nécessaires pour mettre à jour le commentaire
      if (comment.userId !== userId) throw new ValidationError("Unauthorized");

      // Mettre à jour le contenu du commentaire
      return await prisma.comment.update({
        where: { id },
        data: { content },
        include: commentIncludeConfig // Inclure les informations supplémentaires spécifiées dans la configuration
      });
    } catch (error: any) {
      // Lancer une erreur personnalisée si la mise à jour du commentaire échoue
      throw new DatabaseError(`Failed to update comment: ${error.message}`);
    }
  }

  // Méthode pour supprimer un commentaire
  async deleteComment(id: number, userId: number): Promise<Comment> {
    try {
      // Rechercher le commentaire par ID
      const comment = await prisma.comment.findUnique({ where: { id } });
      // Vérifier si le commentaire a été trouvé
      if (!comment) throw new ValidationError("Comment not found");
      // Vérifier si l'utilisateur a les droits nécessaires pour supprimer le commentaire
      if (comment.userId !== userId) throw new ValidationError("Unauthorized");

      // Supprimer le commentaire
      const deletedComment = await prisma.comment.delete({
        where: { id },
        include: commentIncludeConfig // Inclure les informations supplémentaires spécifiées dans la configuration
      });

      // Mettre à jour le nombre de commentaires du post
      await prisma.post.update({
        where: { id: comment.postId },
        data: { commentsCount: { decrement: 1 } }
      });

      // Retourner le commentaire supprimé
      return deletedComment;
    } catch (error: any) {
      // Lancer une erreur personnalisée si la suppression du commentaire échoue
      throw new DatabaseError(`Failed to delete comment: ${error.message}`);
    }
  }

  // Méthode pour créer une réponse à un commentaire
  async CommentReplies(commentId: number, userID: number, content: string): Promise<Comment> {
    try {
      // Vérifier si l'utilisateur existe
      const user = await prisma.user.findUnique({ where: { id: userID } });
      if (!user) throw new ValidationError("User not found");
      // Vérifier si le commentaire parent existe
      const parentComment = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!parentComment) throw new ValidationError("Parent comment not found");

      // Créer une réponse au commentaire
      const newReply = await prisma.comment.create({
        data: {
          userId: userID,
          postId: parentComment.postId,
          content,
          parentId: commentId || null // Associer la réponse au commentaire parent
        },
        include: commentIncludeConfig // Inclure les informations supplémentaires spécifiées dans la configuration
      });
      // Retourner la réponse créée
      return newReply;
    } catch (error: any) {
      // Lancer une erreur personnalisée si la création de la réponse échoue
      throw new DatabaseError(`Failed to create comment: ${error.message}`);
    }
  }

  // Méthode pour récupérer les commentaires d'un post avec pagination
  async getCommentsByPostId(postId: number, page: number = 1, limit: number = this.DEFAULT_PAGE_SIZE): Promise<Comment[]> {
    try {
      // Calculer le nombre d'éléments à ignorer pour la pagination
      const skip = (page - 1) * limit;
      // Rechercher les commentaires pour un post spécifique avec pagination
      return await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: 'desc' }, // Trier les commentaires par date de création décroissante
        skip, // Ignorer les éléments précédents pour la pagination
        take: limit, // Limiter le nombre de commentaires récupérés
        include: {
          user: {
            select: { // Sélectionner les informations de l'utilisateur associées au commentaire
              id: true,
              name: true,
              profilePicture: true,
              isOnline: true,
              lastSeenAt: true,
            }
          },
          reactions: true, // Inclure les réactions associées au commentaire
          replies: true, // Inclure les réponses associées au commentaire
        }
      });
    } catch (error: any) {
      // Lancer une erreur personnalisée si la récupération des commentaires échoue
      throw new DatabaseError(`Failed to get comments: ${error.message}`);
    }
  }
}
