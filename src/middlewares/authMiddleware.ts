import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/tokenUtils';
import { isBlacklisted } from '../utils/tokenBlacklist';
import { JwtPayload } from 'jsonwebtoken';

// Étendre l'interface Request pour inclure les propriétés personnalisées
declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
    userType?: string;
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('Headers:', req.headers);
    
    const authHeader = req.headers['authorization']; // Correction ici
    if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    if (isBlacklisted(token)) {
        return res.status(401).json({ message: 'Token is no longer valid' });
    }

    try {
        const payload = verifyToken(token);
        
        // Vérification du type de payload
        if (typeof payload === 'object' && 'userId' in payload) {
            req.userId = payload.userId as number;
            req.userType = payload.type as string;
            next();
        } else {
            return res.status(401).json({ message: 'Invalid token structure' });
        }
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
