import { PrismaClient } from "@prisma/client";
import { Post, Retweet, postIncludeConfig } from "../Interfaces/PostInterface";

const prisma = new PrismaClient();

class FeedService {
  // Récupère le fil d'actualité de l'utilisateur avec des options de filtrage
  static async getUserFeed(
    userId: number,
    page: number,
    limit: number,
    followingOnly: boolean = false
  ): Promise<(Post | Retweet)[]> {
    const skip = (page - 1) * limit;

    // Récupération des utilisateurs suivis si nécessaire
    let usersToInclude: number[] = [];
    if (followingOnly) {
      const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followeeId: true },
      });
      usersToInclude = follows.map((follow) => follow.followeeId);

      // Si l'utilisateur ne suit personne, retourner un tableau vide
      if (usersToInclude.length === 0) {
        return [];
      }
    }

    // Récupération des utilisateurs signalés par l'utilisateur connecté
    const reportedUsers = await prisma.report.findMany({
      where: { signalerId: userId },
      select: { signaledId: true },
    });
    const reportedUserIds = reportedUsers.map((report) => report.signaledId);

    // Filtrage des posts selon les critères
    let postQuery: any = {};

    // Cas où l'utilisateur ne suit que certains utilisateurs
    if (followingOnly && usersToInclude.length > 0) {
      postQuery.userId = { in: [...usersToInclude, userId] };
    } else {
      // Cas où on exclut les utilisateurs signalés
      postQuery.userId = { notIn: reportedUserIds };
    }

    // Ajouter la condition pour exclure les posts privés
    postQuery.OR = [
      { isPublic: true },          // Inclure les posts publics
      { userId: userId }           // Inclure les posts de l'utilisateur connecté, même s'ils sont privés
    ];

    // Récupération des posts
    const posts = await prisma.post.findMany({
      where: postQuery,
      skip,
      take: limit,
      include: postIncludeConfig,
      orderBy: { createdAt: "desc" },
    });

    // Récupérer les retweets
    const retweets = await prisma.retweet.findMany({
      where: {
        userId: { in: [...usersToInclude, userId] },
        NOT: {
          userId: { in: reportedUserIds },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        post: true,
      },
    });

    // Fusion et tri des posts et des retweets
    const feed = [...posts, ...retweets].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return feed;
  }
}

export default FeedService;
