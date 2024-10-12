import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

// Middleware Express pour vérifier si les commentaires sont activés pour un post spécifique
export const checkCommentsEnabled = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extraire l'ID du post à partir des paramètres de la requête et le convertir en entier
        const postId = parseInt(req.params.postId, 10);
        
        // Vérifier si l'ID du post est un nombre valide
        if (isNaN(postId)) {
            // Loguer un message d'erreur si l'ID du post est invalide
            console.log("Invalid post ID");
            // Retourner une réponse HTTP 400 Bad Request avec un message d'erreur
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        // Loguer l'ID du post pour débogage
        console.log("Checking post ID:", postId);
        // Rechercher le post dans la base de données en utilisant l'ID
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });
        // Loguer les détails du post trouvé pour débogage
        console.log("Found post:", post);
        
        // Vérifier si le post n'existe pas
        if (!post) {
            // Loguer un message d'erreur si le post n'est pas trouvé
            console.log("Post not found");
            // Retourner une réponse HTTP 404 Not Found avec un message d'erreur
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Vérifier si les commentaires sont désactivés pour ce post
        if (!post.commentsEnabled) {
            // Loguer un message d'erreur si les commentaires sont désactivés
            console.log("Comments are disabled for this post");
            // Retourner une réponse HTTP 403 Forbidden avec un message d'erreur
            return res.status(403).json({ message: 'Comments are disabled for this post' });
        }
        
        // Loguer un message indiquant que les commentaires sont activés et que le middleware peut continuer
        console.log("Comments are enabled, proceeding to next middleware");
        // Appeler la fonction next() pour passer au middleware suivant
        next();
    } catch (error) {
        // Loguer les erreurs qui surviennent pendant la vérification
        console.error('Comment verification error:', error);
        // Retourner une réponse HTTP 500 Internal Server Error avec un message d'erreur
        return res.status(500).json({ message: 'Server error' });
    }
};
