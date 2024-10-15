import { PrismaClient } from '@prisma/client';
import { Follow, UserFollow } from '../Interfaces/UserInterface';
import NotificationService from './notificationService';

const prisma = new PrismaClient();

class FollowService {
  static async followUser(userId: number, followId: number): Promise<Follow> {
    const isFollowing = await prisma.follow.findFirst({
      where: { followerId: userId, followeeId: followId },
    });

    if (isFollowing) {
      throw new Error('L\'utilisateur est déjà suivi');
    }

    const followee = await prisma.user.findUnique({
      where: { id: followId },
    });

    if (!followee) {
      throw new Error('L\'utilisateur à suivre n\'existe pas');
    }

    if (followee.type !== 'TAILLEUR') {
      throw new Error('L\'utilisateur à suivre n\'est pas un tailleur');
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: userId,
        followeeId: followId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { followingCount: { increment: 1 } },
    });

    await prisma.user.update({
      where: { id: followId },
      data: { followersCount: { increment: 1 } },
    });

    // Récupérer les informations de l'utilisateur qui suit
    const follower = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        profilePicture: true,
      },
    });

    if (!follower) {
      throw new Error('L\'utilisateur qui suit n\'existe pas');
    }

    // Créer le message de notification
    const message = `L'utilisateur ${follower.name} ${follower.profilePicture}  a commencé à vous suivre.`;

    // Envoyer une notification à l'utilisateur suivi
    await NotificationService.sendNotification(followId, message);

    return follow;
  }

  // Méthode pour se désabonner d'un utilisateur
  static async unfollowUser(unfollowerId: number, unfollowingId: number): Promise<void> {

    // Vérifier si la relation de suivi existe
    const follow = await prisma.follow.findFirst({
      where: { followerId: unfollowerId, followeeId: unfollowingId },
    });

    // Si la relation de suivi n'existe pas, lancer une erreur
    if (!follow) {
      throw new Error('L\'utilisateur n\'est pas suivi');
    }

    // Supprimer la relation de suivi dans la base de données
    await prisma.follow.deleteMany({
      where: { followerId: unfollowerId, followeeId: unfollowingId },
    });

    // Mettre à jour le compteur de suivis de l'utilisateur
    await prisma.user.update({
      where: { id: unfollowerId },
      data: { followingCount: { decrement: 1 } },
    });

    // Mettre à jour le compteur de followers de l'utilisateur suivi
    await prisma.user.update({
      where: { id: unfollowingId },
      data: { followersCount: { decrement: 1 } },
    });
  }

  // Méthode pour obtenir les followers d'un utilisateur
  static async getFollowers(userId: number): Promise<UserFollow[]> {
    // Rechercher les relations de suivi où l'utilisateur est le suivi
    const follows = await prisma.follow.findMany({
      where: { followeeId: userId },
      include: { follower: true },
    });

    // Mapper les résultats pour retourner uniquement les ID et noms des followers
    return follows.map(f => ({
      id: f.follower.id,
      name: f.follower.name,
    }));
  }

  // Méthode pour obtenir les utilisateurs suivis par un utilisateur
  static async getFollowing(userId: number): Promise<UserFollow[]> {
    // Rechercher les relations de suivi où l'utilisateur est le suiveur
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { followee: true },
    });

    // Mapper les résultats pour retourner uniquement les ID et noms des utilisateurs suivis
    return follows.map(f => ({
      id: f.followee.id,
      name: f.followee.name,
    }));
  }
}

// Exporter la classe FollowService comme exportation par défaut du module
export default FollowService;
