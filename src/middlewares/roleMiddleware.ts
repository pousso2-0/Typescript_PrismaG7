// Importer les types Request, Response, et NextFunction depuis Express
import { Request, Response, NextFunction } from 'express';
// Importer PrismaClient et UserType depuis @prisma/client pour interagir avec la base de données et gérer les types d'utilisateurs
import { PrismaClient, UserType } from '@prisma/client';
// Importer la fonction verifyToken depuis utils/tokenUtils pour valider les tokens JWT
import { verifyToken } from '../utils/tokenUtils';

// Créer une instance de PrismaClient pour effectuer des opérations de base de données
const prisma = new PrismaClient();

// Définir un type pour les rôles autorisés, qui est un tableau de UserType
type AllowedRoles = UserType[];

// Exporter la fonction middleware qui prend un tableau de rôles autorisés comme argument
export const roleMiddleware = (allowedRoles: AllowedRoles) => {
    // Retourner une fonction middleware asynchrone qui reçoit req, res, et next
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log('Checking roles for user:', req.userType); // Log pour le type d'utilisateur
        console.log('Allowed roles:', allowedRoles); // Log pour les rôles autorisés
        try {
            // Récupérer l'en-tête d'autorisation de la requête
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                // Si l'en-tête est absent, retourner une erreur 401 (non autorisé)
                return res.status(401).json({ message: 'No authorization header provided' });
            }

            // Extraire le token de l'en-tête d'autorisation
            const token = authHeader.split(' ')[1];
            if (!token) {
                // Si le token est absent, retourner une erreur 401
                return res.status(401).json({ message: 'No token provided' });
            }

            // Vérifier et décoder le token JWT
            const decoded = verifyToken(token);

            // Vérifier la structure du token décodé
            if (typeof decoded !== 'object' || !('userId' in decoded) || !('type' in decoded)) {
                return res.status(401).json({ message: 'Invalid token structure' });
            }

            // Extraire userId et userType du token décodé
            const userId = (decoded as any).userId;
            const userType = (decoded as any).type as UserType;

            // Vérifier si le type d'utilisateur est inclus dans les rôles autorisés
            if (!allowedRoles.includes(userType)) {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }

            // Récupérer les informations complètes de l'utilisateur depuis la base de données, si nécessaire
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                // Si l'utilisateur n'est pas trouvé, retourner une erreur 401
                return res.status(401).json({ message: 'User not found' });
            }

            // Ajouter l'utilisateur à l'objet req pour qu'il soit disponible dans les middlewares suivants
            (req as any).user = user;
            // Passer au middleware ou à la route suivante
            next();
        } catch (error) {
            // Gérer les erreurs de vérification des rôles ou de validation du token
            console.error('Role verification error:', error);
            return res.status(401).json({ message: 'Invalid token or insufficient permissions' });
        }
    };
};
