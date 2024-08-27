import { PrismaClient } from '@prisma/client';
import { Follow, UserFollow } from '../Interfaces/UserInterface';

const prisma = new PrismaClient();

class FollowService {
  // Méthode pour suivre un utilisateur
  static async followUser(userId: number, followId: number): Promise<Follow> {

    // Vérifier si l'utilisateur suit déjà l'utilisateur cible
    const isFollowing = await prisma.follow.findFirst({
      where: { followerId: userId, followeeId: followId },
    });

    // Si l'utilisateur suit déjà, lancer une erreur
    if (isFollowing) {
      throw new Error('L\'utilisateur est déjà suivi');
    }

    // Vérifier si l'utilisateur cible existe
    const followee = await prisma.user.findUnique({
      where: { id: followId },
    });

    // Si l'utilisateur cible n'existe pas, lancer une erreur
    if (!followee) {
      throw new Error('L\'utilisateur à suivre n\'existe pas');
    }

    // Vérifier si l'utilisateur cible est un tailleur
    if (followee.type !== 'TAILLEUR') {  // Correction de la vérification du type
      throw new Error('L\'utilisateur à suivre n\'est pas un tailleur');
    }

    // Créer la relation de suivi dans la base de données
    const follow = await prisma.follow.create({
      data: {
        followerId: userId,
        followeeId: followId,
      },
    });

    // Mettre à jour le compteur de suivis de l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: { followingCount: { increment: 1 } },
    });

    // Mettre à jour le compteur de followers de l'utilisateur suivi
    await prisma.user.update({
      where: { id: followId },
      data: { followersCount: { increment: 1 } },
    });

    // Retourner la relation de suivi créée
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
