import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export const checkCommentsEnabled = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = parseInt(req.params.postId);

        if (isNaN(postId)) {
            console.log("Invalid post ID");
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        console.log("Checking post ID:", postId);
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });
        console.log("Found post:", post);
        
        if (!post) {
            console.log("Post not found");
            return res.status(404).json({ message: 'Post not found' });
        }
        
        if (!post.commentsEnabled) {
            console.log("Comments are disabled for this post");
            return res.status(403).json({ message: 'Comments are disabled for this post' });
        }
        
        console.log("Comments are enabled, proceeding to next middleware");
        next();
    } catch (error) {
        console.error('Comment verification error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};