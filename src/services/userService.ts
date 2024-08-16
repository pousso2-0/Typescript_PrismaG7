import { PrismaClient,   User} from '@prisma/client';
import bcrypt from 'bcrypt';
import UserValidator from '../utils/Validators/userValidator';
import {PREMIUM_COST , PREMIUM_DEFAULT_CREDITS} from '../config/env';
import { generateToken } from '../utils/tokenUtils';
import { ValidationError, DatabaseError } from '../errors/customErrors';
import { UserProfile ,  Register, Login, UpdateUser} from '../Interfaces/UserInterface';

const prisma = new PrismaClient();

class UserService {
  static async register(userData: Register) {
    try {
      const validatedData = UserValidator.validateRegister(userData);
      
      const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
      if (existingUser) throw new ValidationError('Email already in use');

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      const newUser = await prisma.user.create({
        data: {
          ...validatedData,
          password: hashedPassword,
        },
      });

      const token = generateToken({ userId: newUser.id, type: newUser.type });
      return { token };
    } catch (error:any) {
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

      const token = generateToken({ userId: user.id, type: user.type });
      return { token };
    } catch (error:any) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError(`Login failed: ${error.message}`);
    }
  }

  static async getUserById(id: number): Promise<UserProfile> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ValidationError('User not found');
    return user as UserProfile;
  }

  static async updateCredits(userId: number, amount: number): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });

    if (!user) throw new ValidationError("User not found");

    return user as UserProfile;
  }

  static async upgradeToPremium(userId: number): Promise<UserProfile> {
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

    return updatedUser as UserProfile;
  }

  static async checkAndUpdatePremiumStatus(userId: number): Promise<UserProfile> {
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

      return updatedUser as UserProfile;
    }

    return user as UserProfile;
  }

  static async buyCredits(userId: number, amount: number): Promise<UserProfile> {
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
 
}

export default UserService;
