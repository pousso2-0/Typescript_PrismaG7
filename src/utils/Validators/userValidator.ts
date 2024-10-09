import { z } from 'zod';

class UserValidator {
    static registerSchema = z.object({
        name: z.string().min(1, { message: "Name is required" }), // Ajouter `name`
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
        profilePicture: z.string().optional(), // Ajouter `profilePicture`
    });

    static loginSchema = z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    });

    static buyCreditsSchema = z.object({
        amount: z.number().positive({ message: "Amount must be a positive number" }),
    });

    static updateSchema = z.object({
        name: z.string().min(1, { message: "Name is required" }).optional(), // Si fourni, il doit être non vide
        email: z.string().email({ message: "Invalid email address" }).optional(), // Si fourni, il doit être un email valide
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }).optional(), // Si fourni, il doit être d'au moins 8 caractères
        type: z.enum(['CLIENT', 'TAILLEUR', 'VENDEUR', 'ADMIN'], { message: "Invalid user type" }).optional(), // Si fourni, doit correspondre à l'une des valeurs
        website: z.array(
            z.object({
                url: z.string().url({ message: "Invalid URL" }), // Si fourni, il doit être une URL valide
                siteType: z.string().min(1, { message: "Site type is required" }) // Si fourni, le type du site doit être non vide
            })
        ).optional(),
        profilePicture: z.string().optional(), // Si fourni, accepter une chaîne
        storeName: z.string().optional(), // Si fourni, accepter une chaîne
        storeDescription: z.string().optional(), // Si fourni, accepter une chaîne
        bio: z.string().optional(), // Si fourni, accepter une chaîne
        location: z.string().optional(), // Si fourni, accepter une chaîne
        dateOfBirth: z.date().optional(), // Si fourni, accepter une date
        gender: z.string().optional(), // Si fourni, accepter une chaîne
        phone: z.string().optional(), // Si fourni, accepter une chaîne
        isPrivate: z.boolean().optional(), // Si fourni, accepter un booléen
        notificationsEnabled: z.boolean().optional(), // Si fourni, accepter un booléen
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
