// Importer les types nécessaires de 'express'
import { Request, Response, NextFunction } from 'express';
// Importer les fonctions utilitaires pour vérifier le token et vérifier s'il est blacklisté
import { verifyToken } from '../utils/tokenUtils';
import { isBlacklisted } from '../utils/tokenBlacklist';
// Importer le type JwtPayload pour la gestion des tokens JWT
import { JwtPayload } from 'jsonwebtoken';

// Étendre l'interface Request pour inclure des propriétés personnalisées (userId et userType)
declare module 'express-serve-static-core' {
  interface Request {
    userId?: number; // Propriété personnalisée pour stocker l'ID de l'utilisateur
    userType?: string; // Propriété personnalisée pour stocker le type d'utilisateur
  }
}

// Middleware d'authentification
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Afficher les en-têtes de la requête dans la console pour le débogage
    console.log('Headers:', req.headers);
    
    // Récupérer l'en-tête d'autorisation
    const authHeader = req.headers['authorization'];
    // Vérifier si l'en-tête d'autorisation est présent
    if (!authHeader) {
        // Répondre avec un code d'erreur 401 si l'en-tête d'autorisation est manquant
        return res.status(401).json({ message: 'No authorization header provided' });
    }

    // Extraire le token de l'en-tête d'autorisation (format 'Bearer <token>')
    const token = authHeader.split(' ')[1];
    // Vérifier si le token est présent après l'extraction
    if (!token) {
        // Répondre avec un code d'erreur 401 si le token est manquant
        return res.status(401).json({ message: 'No token provided' });
    }

    // Vérifier si le token est blacklisté
    if (isBlacklisted(token)) {
        // Répondre avec un code d'erreur 401 si le token est blacklisté
        return res.status(401).json({ message: 'Token is no longer valid' });
    }

    try {
        // Vérifier et décoder le token
        const payload = verifyToken(token);
        
        // Vérifier si le payload est un objet et s'il contient 'userId'
        if (typeof payload === 'object' && 'userId' in payload) {
            // Ajouter les informations d'utilisateur à l'objet de requête
            req.userId = payload.userId as number;
            req.userType = payload.type as string;
            // Passer au middleware suivant
            next();
        } else {
            // Répondre avec un code d'erreur 401 si la structure du token est invalide
            return res.status(401).json({ message: 'Invalid token structure' });
        }
    } catch (error) {
        // Afficher l'erreur de vérification du token dans la console
        console.error('Token verification error:', error);
        // Répondre avec un code d'erreur 401 si le token est invalide
        return res.status(401).json({ message: 'Invalid token' });
    }
};
