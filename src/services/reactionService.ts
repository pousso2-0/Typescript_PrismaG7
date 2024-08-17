// src/services/reactionService.ts

import { PrismaClient } from '@prisma/client';
import { ReactionToggle, ReactionResponse, Reaction, ReactionIncludeConfig } from '../Interfaces/ReactionInterface';

const prisma = new PrismaClient();

class ReactionService {
  static async toggleReaction(userId: number, { reactionType, postId, commentId }: ReactionToggle): Promise<ReactionResponse> {
    if ((postId && commentId) || (!postId && !commentId)) {
      throw new Error('You must provide either postId or commentId, but not both.');
    }

    const existingReaction = await prisma.reaction.findFirst({
      where: {
        userId,
        ...(postId ? { postId } : {}),
        ...(commentId ? { commentId } : {}),
      },
    });

    if (existingReaction) {
      if (existingReaction.reactionType === reactionType) {
        await prisma.reaction.delete({ where: { id: existingReaction.id } });
        await this.updateReactionCount(-1, postId, commentId);
        return { removed: true };
      } else {
        const updatedReaction = await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { reactionType },
        });
        await this.updateReactionCount(0, postId, commentId);
        return { updated: true, reaction: updatedReaction };
      }
    } else {
      const newReaction = await prisma.reaction.create({
        data: {
          userId,
          reactionType,
          ...(postId ? { postId } : {}),
          ...(commentId ? { commentId } : {}),
        },
      });
      await this.updateReactionCount(1, postId, commentId);
      return { created: true, reaction: newReaction };
    }
  }

  static async getReactionsForPost(postId: number): Promise<Reaction[]> {
    const reactions = await prisma.reaction.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: ReactionIncludeConfig,
    });
    return reactions as Reaction[];
  }
  
  static async getReactionsForComment(commentId: number): Promise<Reaction[]> {
    const reactions = await prisma.reaction.findMany({
      where: { commentId },
      orderBy: { createdAt: 'desc' },
      include: ReactionIncludeConfig,
    });
    return reactions as Reaction[];
  }

  private static async updateReactionCount(increment: number, postId?: number, commentId?: number): Promise<void> {
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { reactionCount: { increment } },
      });
    }

    if (commentId) {
      await prisma.post.update({
        where: { id: commentId },
        data: { reactionCount: { increment } },
      });
    }
  }
}

export default ReactionService;