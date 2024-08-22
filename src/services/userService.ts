import { PrismaClient} from '@prisma/client';
import bcrypt from 'bcrypt';
import UserValidator from '../utils/Validators/userValidator';
import {PREMIUM_COST , PREMIUM_DEFAULT_CREDITS} from '../config/env';
import { generateToken } from '../utils/tokenUtils';
import { ValidationError, DatabaseError } from '../errors/customErrors';
import { User ,  Register, Login, UpdateUser, UserSearchResult , UserIncludeConfig} from '../Interfaces/UserInterface';

const prisma = new PrismaClient();

class UserService {
  static async register(userData: Register) {
    try {
      // Validation des données
      const validatedData = UserValidator.validateRegister(userData);
      
      // Vérifier si l'email est déjà utilisé
      const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
      if (existingUser) throw new ValidationError('Email already in use');

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Création de l'utilisateur
      const newUser = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          type: validatedData.type,
        },
      });
      // Création du magasin si l'utilisateur est un vendeur
      if (validatedData.type === 'VENDEUR') {
        if (!validatedData.storeName) {
          throw new ValidationError('Store name is required for vendors.');
        }
        await prisma.store.create({
          data: {
            name: validatedData.storeName,
            description: validatedData.storeDescription,
            userId: newUser.id,
          },
        });
      }
      // Génération du token d'authentification
      const token = generateToken({ userId: newUser.id, type: newUser.type });
      return { token };
    } catch (error: any) {
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
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError(`Login failed: ${error.message}`);
    }
  }
  static async getUserById(id: number , includeRelations: boolean = false): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: includeRelations ? UserIncludeConfig : {}
    });    if (!user) throw new ValidationError('User not found');
    return user as User;
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
