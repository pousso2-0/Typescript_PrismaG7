import { PrismaClient } from '@prisma/client';
import { Vote, TailorRating } from '../Interfaces/UserInterface';

const prisma = new PrismaClient();


class VoteService {
    static async voteForTailor(userId: number, tailorId: number, rating: number): Promise<Vote> {
        if (rating < 1 || rating > 5) {
          throw new Error('Rating must be between 1 and 5');
        }

      
        // Vérifier si l'utilisateur a déjà voté pour ce tailleur
        const existingVote = await prisma.vote.findFirst({
          where: { userId, tailorId },
        });
        if (existingVote) {
          throw new Error('You have already voted for this tailor');
        }
        // Vérifier si le tailleur existe et si c'est bien un tailleur
        const tailor = await prisma.user.findUnique({
          where: { id: tailorId },
        });
      
        if (!tailor || tailor.type !== 'TAILLEUR') {
          throw new Error('You can only vote for tailors');
        }
      
        // Créer un vote
        const vote = await prisma.vote.create({
          data: {
            userId,
            tailorId,
            rating,
          },
        });
      
        return vote;
      }
      

  static async getTailorRating(tailorId: number): Promise<TailorRating> {
    const votes = await prisma.vote.findMany({
      where: { tailorId },
    });

    const totalVotes = votes.length;
    const totalRating = votes.reduce((sum, vote) => sum + vote.rating, 0);
    const averageRating = totalVotes > 0 ? totalRating / totalVotes : 0;

    return { averageRating, totalVotes };
  }
}

export default VoteService;
