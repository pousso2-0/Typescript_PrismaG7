// src/middlewares/postActionMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const postActionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    console.log('--- Post Action Middleware Start ---');
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    console.log('Request params:', req.params);

    let postId: number | undefined;

    try {
        // Récupérer l'ID du post à partir des paramètres de l'URL
        if (req.params.id) {
            postId = parseInt(req.params.id , 10);
        }

        console.log('Extracted postId:', postId);

        if (typeof postId !== 'number' || isNaN(postId)) {
            console.log('Invalid or missing post ID');
            return res.status(400).json({ message: 'Invalid or missing post ID' });
        }

        // Vérifier si le post existe et récupérer ses informations
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { isPublic: true, userId: true }
        });

        if (!post) {
            console.log('Post not found for ID:', postId);
            return res.status(404).json({ message: 'Post not found' });
        }

        console.log('Post found:', post);

        // Vérifier si l'utilisateur est authentifié
        if (!req.userId) {
            console.log('User not authenticated');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Vérifier si le post est public ou si l'utilisateur est le propriétaire
        if (!post.isPublic && post.userId !== req.userId) {
            console.log('Access denied: Private post and user is not the owner');
            return res.status(403).json({ message: 'This post is private. You cannot perform this action.' });
        }

        // Ajouter l'ID du post à l'objet req pour une utilisation ultérieure si nécessaire
        (req as any).postId = postId;

        console.log('Post action allowed');
        console.log('--- Post Action Middleware End ---');
        next();
    } catch (error) {
        console.error('Error in postActionMiddleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};