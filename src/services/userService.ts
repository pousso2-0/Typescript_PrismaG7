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

      const validatedData = UserValidator.validateUpdate(sanitizedData);

      if (!userId) throw new ValidationError('User ID is required');

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ValidationError('User not found');

      // Assurez-vous que validatedData.dateOfBirth est bien un objet Date
      if (validatedData.dateOfBirth) {
        validatedData.dateOfBirth = new Date(validatedData.dateOfBirth); // Conversion en objet Date
      }

      if (validatedData.type && user.credits < 100) {
        throw new ValidationError('Not enough credits to change user type');
      }

      const prismaData: Prisma.UserUpdateInput = validatedData as Prisma.UserUpdateInput;

      // Exclude the website field from prismaData because websites are handled separately
      delete prismaData.website;

      // If the user is updating websites, handle it separately
      if (validatedData.website && Array.isArray(validatedData.website)) {
        const websiteUpdates = validatedData.website.map(async (site) => {
          const existingWebsite = await prisma.website.findFirst({
            where: { userId, type: site.type },
          });

          if (existingWebsite) {
            // Update existing website
            return prisma.website.update({
              where: { id: existingWebsite.id },
              data: { url: site.url },
            });
          } else {
            // Create new website
            return prisma.website.create({
              data: {
                userId,
                type: site.type,
                url: site.url,
              },
            });
          }
        });

        await Promise.all(websiteUpdates); // Wait for all updates to complete
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: prismaData, // Pass only the non-relation data (without website)
      });

      if (validatedData.type === 'VENDEUR') {
        if (!validatedData.storeName) throw new ValidationError('Store name is required for vendors.');

        const existingStore = await prisma.store.findUnique({
          where: { userId },
        });

        if (!existingStore) {
          await prisma.store.create({
            data: {
              name: validatedData.storeName,
              description: validatedData.storeDescription,
              userId: updatedUser.id,
            },
          });
        }
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
  
  static async searchUsersByName(name: string): Promise<UserSearchResult[]> {
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
        take: 10 // Limiter le nombre de résultats à 10
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
