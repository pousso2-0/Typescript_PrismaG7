import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserType } from '@prisma/client';
import { verifyToken } from '../utils/tokenUtils'; 

const prisma = new PrismaClient();

type AllowedRoles = UserType[];

export const roleMiddleware = (allowedRoles: AllowedRoles) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log('Checking roles for user:', req.userType);
        console.log('Allowed roles:', allowedRoles);
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ message: 'No authorization header provided' });
            }
            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const decoded = verifyToken(token);
            
            // Le type du retour de verifyToken est non spécifié, donc nous devons faire une assertion
            if (typeof decoded !== 'object' || !('userId' in decoded) || !('type' in decoded)) {
                return res.status(401).json({ message: 'Invalid token structure' });
            }

            const userId = (decoded as any).userId;
            const userType = (decoded as any).type as UserType;

            // Vérifier si le type d'utilisateur est autorisé
            if (!allowedRoles.includes(userType)) {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }

            // Optionnel : récupérer l'utilisateur complet si nécessaire
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            (req as any).user = user; // Ajouter l'utilisateur à la requête
            next();
        } catch (error) {
            console.error('Role verification error:', error);
            return res.status(401).json({ message: 'Invalid token or insufficient permissions' });
        }
    };
};
