// Importer les types Request et Response depuis Express pour typer les requêtes et réponses HTTP
import { Request, Response } from 'express';
// Importer le service FollowService qui gère la logique de suivi des utilisateurs
import FollowService from '../services/followService';

// Définir la classe FollowController pour gérer les requêtes HTTP liées au suivi des utilisateurs
class FollowController {

  // Méthode pour suivre un utilisateur
  static async followUser(req: Request, res: Response): Promise<void> {
    try {
      // Récupérer l'ID de l'utilisateur qui effectue le suivi depuis req.userId (assumé comme étant défini par un middleware d'authentification)
      const followerId = req.userId as number;
      // Récupérer l'ID de l'utilisateur à suivre depuis le corps de la requête
      const { followingId } = req.body;

      // Appeler le service pour effectuer l'action de suivi
      const follow = await FollowService.followUser(followerId, followingId);
      // Retourner une réponse avec un code 201 (créé) indiquant que le suivi a réussi
      res.status(201).json({ message: 'User followed successfully', follow });
    } catch (error: any) {
      // En cas d'erreur, retourner une réponse avec un code 400 (mauvaise requête) et le message d'erreur
      res.status(400).json({ message: `Failed to follow user: ${error.message}` });
    }
  }

  // Méthode pour arrêter de suivre un utilisateur
  static async unfollowUser(req: Request, res: Response): Promise<void> {
    try {
      // Récupérer l'ID de l'utilisateur qui effectue le désuivi depuis req.userId
      const unfollowerId = req.userId as number;
      // Récupérer l'ID de l'utilisateur à désuivre depuis le corps de la requête
      const { unfollowingId } = req.body;

      // Appeler le service pour effectuer l'action de désuivi
      await FollowService.unfollowUser(unfollowerId, unfollowingId);
      // Retourner une réponse avec un code 200 (succès) indiquant que le désuivi a réussi
      res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (error: any) {
      // En cas d'erreur, retourner une réponse avec un code 400 (mauvaise requête) et le message d'erreur
      res.status(400).json({ message: `Failed to unfollow user: ${error.message}` });
    }
  }

  // Méthode pour récupérer la liste des abonnés d'un utilisateur
  static async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      // Récupérer l'ID de l'utilisateur pour lequel on veut les abonnés depuis req.userId
      const userId = req.userId as number;

      // Appeler le service pour obtenir la liste des abonnés
      const followers = await FollowService.getFollowers(userId);
      // Retourner la liste des abonnés avec un code 200 (succès)
      res.status(200).json(followers);
    } catch (error: any) {
      // En cas d'erreur, retourner une réponse avec un code 400 et le message d'erreur
      res.status(400).json({ message: `Failed to get followers: ${error.message}` });
    }
  }

  // Méthode pour récupérer la liste des utilisateurs suivis par un utilisateur
  static async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      // Récupérer l'ID de l'utilisateur pour lequel on veut les abonnements depuis req.userId
      const userId = req.userId as number;

      // Appeler le service pour obtenir la liste des utilisateurs suivis
      const following = await FollowService.getFollowing(userId);
      // Retourner la liste des utilisateurs suivis avec un code 200 (succès)
      res.status(200).json(following);
    } catch (error: any) {
      // En cas d'erreur, retourner une réponse avec un code 400 et le message d'erreur
      res.status(400).json({ message: `Failed to get following: ${error.message}` });
    }
  }
}

// Exporter FollowController pour qu'il puisse être utilisé dans les routes de l'application
export default FollowController;
