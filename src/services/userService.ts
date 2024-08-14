import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/tokenUtils';
// import { ValidationError, DatabaseError } from '../types/errors';

const prisma = new PrismaClient();

export class UserService {
  // static async register(userData: Partial<User>): Promise<{ token: string }> {
  //   try {
  //     const { email, password } = userData;

  //     if (!email || !password) {
  //       // throw new ValidationError('Email and password are required');
  //     }

  //     const existingUser = await prisma.user.findUnique({ where: { email } });
  //     if (existingUser) {
  //       // throw new ValidationError('Email already in use');
  //     }

  //     const hashedPassword = await bcrypt.hash(password, 10);

  //     const newUser = await prisma.user.create({
  //       data: {
  //         ...userData,
  //         password: hashedPassword,
  //       },
  //     });

  //     const token = generateToken({ userId: newUser.id, type: newUser.type });

  //     return { token };
  //   } catch (error) {
  //     if (error instanceof ValidationError) {
  //       throw error;
  //     }
  //     throw new DatabaseError(`Registration failed: ${error.message}`);
  //   }
  // }

  // static async login(email: string, password: string): Promise<{ token: string }> {
  //   const user = await prisma.user.findUnique({ where: { email } });
  //   if (!user) {
  //     throw new ValidationError('User not found');
  //   }

  //   const isMatch = await bcrypt.compare(password, user.password);
  //   if (!isMatch) {
  //     throw new ValidationError('Invalid credentials');
  //   }

  //   const token = generateToken({ userId: user.id, type: user.type });
  //   return { token };
  // }

  // Ajoutez d'autres méthodes de service ici...
}

// export default UserService;