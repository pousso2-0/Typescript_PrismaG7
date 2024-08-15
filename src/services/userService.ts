import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import UserValidator from '../utils/Validators/userValidator';
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


 
}

export default UserService;
