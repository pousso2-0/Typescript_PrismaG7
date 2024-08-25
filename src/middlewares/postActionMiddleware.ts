import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export const postActionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    console.log('--- Post Action Middleware Start ---');
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);

    let postId: number | undefined;

    try {
        // Priorité 1 : Vérifier si l'ID est dans les paramètres de l'URL
        if (req.params.postId) {
            postId = parseInt(req.params.postId, 10);
        }

        // Priorité 2 : Si pas trouvé dans les paramètres, vérifier le corps de la requête
        if (!postId && req.body.postId) {
            postId = parseInt(req.body.postId, 10);
        }

        console.log('Extracted postId:', postId);

        if (typeof postId !== 'number' || isNaN(postId)) {
            console.log('Invalid or missing post ID');
            return res.status(400).json({ message: 'Invalid or missing post ID' });
        }

        // Récupérer les informations du post
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { isPublic: true, userId: true, commentsEnabled: true }
        });

        if (!post) {
            console.log('Post not found for ID:', postId);
            return res.status(404).json({ message: 'Post not found' });
        }

        console.log('Post found:', post);

        // Vérifier les droits d'accès au post
        if (!post.isPublic && post.userId !== req.userId) {
            console.log('Access denied: Private post and user is not the owner');
            return res.status(403).json({ message: 'This post is private. You cannot perform this action.' });
        }

        // Vérifier si les commentaires sont activés
        if (req.path.includes('comment') && !post.commentsEnabled) {
            console.log('Comments are disabled for this post');
            return res.status(403).json({ message: 'Comments are disabled for this post' });
        }

        // Ajouter l'ID du post au request object pour une utilisation ultérieure
        (req as any).postId = postId;

        console.log('Post action allowed');
        console.log('--- Post Action Middleware End ---');
        next();
    } catch (error) {
        console.error('Error in postActionMiddleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
