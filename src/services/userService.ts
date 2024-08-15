import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import UserValidator from '../utils/Validators/userValidator';
import { generateToken } from '../utils/tokenUtils';
import { ValidationError, DatabaseError } from '../errors/customErrors';
import { Register, Login, UpdateUser} from '../Interfaces/UserInterface';

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

 
}

export default UserService;
