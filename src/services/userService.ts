import {Prisma, PrismaClient} from '@prisma/client';
import bcrypt from 'bcrypt';
import { z } from 'zod'; // Import de zod
import UserValidator from '../utils/Validators/userValidator';
import {PREMIUM_COST , PREMIUM_DEFAULT_CREDITS} from '../config/env';
import { generateToken } from '../utils/tokenUtils';
import { ValidationError, DatabaseError } from '../errors/customErrors';
import { User ,  Register, Login, UpdateUser, UserSearchResult , UserIncludeConfig} from '../Interfaces/UserInterface';

const prisma = new PrismaClient();

class UserService {
  static async register(userData: Register) {
    try {
      console.log("Received data:", userData);

      // Validation des données
      const validatedData = UserValidator.validateRegister(userData);

      // Vérifier si l'email est déjà utilisé
      const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
      if (existingUser) throw new ValidationError('Email already in use');

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Création de l'utilisateur avec type CLIENT par défaut
      const newUser = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          type: 'CLIENT', // Default type
        },
      });

      // Génération du token d'authentification
      const token = generateToken({ userId: newUser.id, type: newUser.type });
      return { token };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Construire un objet avec chaque champ et son message d'erreur correspondant
        const errors = error.errors.reduce((acc: Record<string, string>, curr) => {
          acc[curr.path.join('.')] = curr.message;
          return acc;
        }, {});

        // Renvoyer les erreurs sous forme d'objet
        throw new ValidationError(JSON.stringify(errors));
      }

      if (error instanceof ValidationError) throw error;
      throw new DatabaseError(`Registration failed: ${error.message}`);
    }
  }
  static async login(loginData: Login) {
    try {
      const validatedData = UserValidator.validateLogin(loginData);

      const user = await prisma.user.findUnique({ where: { email: validatedData.email } });
      if (!user) throw new ValidationError('User not found');

      const isMatch = await bcrypt.compare(validatedData.password, user.password);
      if (!isMatch) throw new ValidationError('Invalid credentials');

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isOnline: true,
          lastSeenAt: new Date(),
        },
      });
      const { id }= user;
      const token = generateToken({ userId: user.id, type: user.type });
      return { token };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Construire un objet avec chaque champ et son message d'erreur correspondant
        const errors = error.errors.reduce((acc: Record<string, string>, curr) => {
          acc[curr.path.join('.')] = curr.message;
          return acc;
        }, {});

        // Renvoyer les erreurs sous forme d'objet
        throw new ValidationError(JSON.stringify(errors));
      }

      if (error instanceof ValidationError) throw error;

      throw new DatabaseError(`Login failed: ${error.message}`);
    }
  }

  static async getUserById(id: number , includeRelations: boolean = false): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: includeRelations ? UserIncludeConfig : {}
    });
   if (!user) throw new ValidationError('User not found');
    return user as User;
  }

  static async updateUser(userId: number, updatedData: UpdateUser) {
    try {
      const sanitizedData = Object.fromEntries(
          Object.entries(updatedData).filter(([_, value]) => value !== undefined && value !== "")
      );

      // Validation des données d'update, y compris les mots de passe
      const validatedData = UserValidator.validateUpdate(sanitizedData);

      if (!userId) throw new ValidationError('User ID is required');

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ValidationError('User not found');

      // Vérification des mots de passe
      if (validatedData.currentPassword && validatedData.newPassword && validatedData.confirmPassword) {
        if (validatedData.newPassword !== validatedData.confirmPassword) {
          throw new ValidationError('New password and confirmation password do not match');
        }

        const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
        if (!isPasswordValid) {
          throw new ValidationError('Current password is incorrect');
        }

        validatedData.password = await bcrypt.hash(validatedData.newPassword, 10);
        delete validatedData.currentPassword; // Supprimer le mot de passe actuel
        delete validatedData.confirmPassword; // Supprimer le mot de passe de confirmation
      }

      // Supprimer les champs newPassword et confirmPassword
      delete validatedData.newPassword;
      delete validatedData.confirmPassword;

      // Conversion de la date de naissance en format ISO
      if (validatedData.dateOfBirth) {
        validatedData.dateOfBirth = new Date(validatedData.dateOfBirth).toISOString(); // Format ISO
      }

      // Vérifiez les crédits pour changer le type d'utilisateur
      if (validatedData.type && user.credits < 100) {
        throw new ValidationError('Not enough credits to change user type');
      }

      // Extraire storeName et storeDescription
      const { storeName, storeDescription, website, ...prismaData } = validatedData;

      // Log des données pour vérifier
      console.log(prismaData);



      // Si l'utilisateur met à jour les sites web, gérez cela séparément
      if (validatedData.website && Array.isArray(validatedData.website)) {
        const websiteUpdates = validatedData.website.map(async (site) => {
          const existingWebsite = await prisma.website.findFirst({
            where: { userId, type: site.type },
          });

          if (existingWebsite) {
            return prisma.website.update({
              where: { id: existingWebsite.id },
              data: { url: site.url },
            });
          } else {
            return prisma.website.create({
              data: {
                userId,
                type: site.type,
                url: site.url,
              },
            });
          }
        });

        await Promise.all(websiteUpdates); // Attendre que toutes les mises à jour soient complètes
      }

      // Mise à jour de l'utilisateur avec les données validées (sans le site web)
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: prismaData, // Passer uniquement les données non-relationnelles (sans site web)
      });

      // Gérer la création ou la mise à jour de store pour un VENDEUR
      if (validatedData.type === 'VENDEUR') {
        if (!storeName) throw new ValidationError('Store name is required for vendors.');

        await prisma.store.create({
          data: {
            name: storeName,
            description: storeDescription,
            userId: updatedUser.id,
          },
        });
      }

      return updatedUser;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc: Record<string, string>, curr) => {
          acc[curr.path.join('.')] = curr.message;
          return acc;
        }, {});
        throw new ValidationError(JSON.stringify(errors));
      }
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError(`User update failed: ${error.message}`);
    }
  }

  static async updateCredits(userId: number, amount: number): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });

    if (!user) throw new ValidationError("User not found");

    return user as User;
  }

  static async upgradeToPremium(userId: number): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ValidationError("User not found");

    if (user.credits < PREMIUM_COST) {
      throw new ValidationError("Not enough credits to upgrade to premium");
    }

    const premiumExpiresAt = new Date();
    premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + 1);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType: 'premium',
        premiumExpiresAt,
        credits: user.credits - PREMIUM_COST + PREMIUM_DEFAULT_CREDITS,
      },
    });

    return updatedUser as User;
  }

  static async checkAndUpdatePremiumStatus(userId: number): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ValidationError("User not found");

    if (user.subscriptionType === 'premium' && user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionType: 'free',
          premiumExpiresAt: null,
        },
      });

      return updatedUser as User;
    }

    return user as User;
  }

  static async buyCredits(userId: number, amount: number): Promise<User> {
    const creditsToBuy = Math.floor(amount / 100);
    return this.updateCredits(userId, creditsToBuy);
  }

  static async getPremiumUsers(): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        subscriptionType: 'premium',
        premiumExpiresAt: {
          gt: new Date()  // Filtrer les utilisateurs dont l'abonnement premium est encore valide
        }
      }
    });
  }
  // static async getTopUsers(): Promise<User[]> {
  //   return prisma.user.findMany({
  //     orderBy: {
  //       followersCount: {
  //         desc: true
  //       }
  //     },
  //     take: 10
  //   });
  // }
  // static async getPopularTags(): Promise<string[]> {
  //   const posts = await prisma.post.findMany({
  //     include: {
  //       tags: true,
  //     },
  //   });

  //   const tags = new Set<string>();
  //   posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag.name)));

  //   return Array.from(tags);
  // }
  
  static async searchUsersByName(name: string, limit: number = 10): Promise<UserSearchResult[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: name, // Recherche la sous-chaîne dans le nom
          },
        },
        select: {
          id: true,
          name: true,
          profilePicture: true,
          isOnline: true,
          lastSeenAt: true,
        },
        take: limit // Limiter le nombre de résultats à 10
      });
  
      return users;
    } catch (error: any) {
      throw new DatabaseError(`Search failed: ${error.message}`);
    }
  }


  static async getUserOnlineStatus(userId: number): Promise<{ isOnline: boolean; lastSeenAt: Date | null }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isOnline: true, lastSeenAt: true }
    });
  
    if (!user) throw new ValidationError('User not found');
  
    return {
      isOnline: user.isOnline,
      lastSeenAt: user.lastSeenAt
    };
  }
};

export default UserService;
