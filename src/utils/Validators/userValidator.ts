import { z } from 'zod';

class UserValidator {
    static registerSchema = z.object({
        name: z.string().min(1, { message: "Name is required" }), // Ajouter `name`
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
        type: z.enum(['CLIENT', 'TAILLEUR', 'VENDEUR', 'ADMIN']), // Ajouter `type`
        
    });

    static loginSchema = z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    });

    static buyCreditsSchema = z.object({
        amount: z.number().positive({ message: "Amount must be a positive number" }),
    });

    static updateSchema = z.object({
        name: z.string().min(1, { message: "Name is required" }).optional(), // Ajouter `name`
        email: z.string().email({ message: "Invalid email address" }).optional(),
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }).optional(),
        type: z.enum(['CLIENT', 'TAILLEUR', 'VENDEUR', 'ADMIN']).optional(), // Ajouter `type`
        profilePicture: z.string().url().optional(), // Ajouter `profilePicture`
        bio: z.string().optional(), // Ajouter `bio`
        location: z.string().optional(), // Ajouter `location`
        dateOfBirth: z.date().optional(), // Ajouter `dateOfBirth`
        gender: z.string().optional(), // Ajouter `gender`
        phone: z.string().optional(), // Ajouter `phone`
        website: z.string().url().optional(), // Ajouter `website`
        followersCount: z.number().optional(), // Ajouter `followersCount`
        followingCount: z.number().optional(), // Ajouter `followingCount`
        postsCount: z.number().optional(), // Ajouter `postsCount`
        isPrivate: z.boolean().optional(), // Ajouter `isPrivate`
        notificationsEnabled: z.boolean().optional(), // Ajouter `notificationsEnabled`
        reportCount: z.number().optional(), // Ajouter `reportCount`
        isBlocked: z.boolean().optional(), // Ajouter `isBlocked`
    });

    static validateRegister(data: any) {
        return this.registerSchema.parse(data);
    }

    static validateLogin(data: any) {
        return this.loginSchema.parse(data);
    }

    static validateBuyCredits(data: any) {
        return this.buyCreditsSchema.parse(data);
    }

    static validateUpdate(data: any) {
        return this.updateSchema.parse(data);
    }
}

export default UserValidator;
