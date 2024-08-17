import { PrismaClient } from '@prisma/client';
import { Follow , UserFollow} from '../Interfaces/UserInterface';

const prisma = new PrismaClient();



class FollowService {
  static async followUser(userId: number, followId: number): Promise<Follow> {

    // Vérifier si l'utilisateur est déjà suivi
    const isFollowing = await prisma.follow.findFirst({
      where: { followerId: userId, followeeId: followId },
    });
    if (isFollowing) {
      throw new Error('L\'utilisateur est déjà suivi');
    }
    // verifier si l'utilisateur qu'on suit est un tailleur 

    const followee = await prisma.user.findUnique({
        where: { id: followId },
      });
    if (!followee) {
      throw new Error('L\'utilisateur à suivre n\'existe pas');
    }
    if (followee.type !== 'TAILLEUR') {  // Correction de la vérification du type
        throw new Error('L\'utilisateur à suivre n\'est pas un tailleur');
    }
    

    const follow = await prisma.follow.create({
      data: {
        followerId: userId,
        followeeId: followId,
      },
    });

    // Mettre à jour les compteurs
    await prisma.user.update({
      where: { id: userId },
      data: { followingCount: { increment: 1 } },
    });

    await prisma.user.update({
      where: { id: followId },
      data: { followersCount: { increment: 1 } },
    });

    return follow;
  }

  static async unfollowUser(unfollowerId:number, unfollowingId:number): Promise<void> {

    // Vérifier si l'utilisateur est déjà suivi
    const follow = await prisma.follow.findFirst({
      where: { followerId: unfollowerId, followeeId: unfollowingId },
    });

    if (!follow) {
      throw new Error('L\'utilisateur n\'est pas suivi');
    }
    await prisma.follow.deleteMany({
      where: { followerId: unfollowerId, followeeId: unfollowingId },
    });

    // Mettre à jour les compteurs
    await prisma.user.update({
      where: { id: unfollowerId },
      data: { followingCount: { decrement: 1 } },
    });

    await prisma.user.update({
      where: { id: unfollowingId },
      data: { followersCount: { decrement: 1 } },
    });
  }

  static async getFollowers(userId: number): Promise<UserFollow[]> {
    const follows = await prisma.follow.findMany({
      where: { followeeId: userId },
      include: { follower: true },
    });

    return follows.map(f => ({
      id: f.follower.id,
      name: f.follower.name,
    }));
  }

  static async getFollowing(userId: number): Promise<UserFollow[]> {
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { followee: true },
    });

    return follows.map(f => ({
      id: f.followee.id,
      name: f.followee.name,
    }));
  }
}

export default FollowService;
