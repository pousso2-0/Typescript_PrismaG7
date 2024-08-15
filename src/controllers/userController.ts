// src/controllers/UserController.ts
import { Request, Response } from 'express';
import UserService from '../services/userService';

class UserController {
  static async register(req: Request, res: Response) {
    try {
      const authToken = await UserService.register(req.body);
      return res.status(201).json(authToken);
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  }

 
}

export default UserController;
