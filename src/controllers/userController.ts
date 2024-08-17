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
  static async login(req: Request, res: Response) {
    try {
      const authToken = await UserService.login(req.body);
      res.json(authToken);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(400).json({ message: "No token provided" });
      }
      // Implement logout logic if needed (e.g., invalidating tokens)
      res.status(200).json({ message: "Logout successful" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  static async getCurrentUserProfile(req: Request, res: Response) {
    try {
      const profile = await UserService.getUserById(req.userId as number); // assuming userId is added to req by middleware
      res.json(profile);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async buyCredits(req: Request, res: Response) {
    try {
      const userId = req.userId as number; 
      const { amount } = req.body;
      const user = await UserService.buyCredits(userId, amount);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async upgradeToPremium(req: Request, res: Response) {
    try {
      const userId = req.userId as number; 
      const user = await UserService.upgradeToPremium(userId);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message }); 
    }
  }

  static async checkAndUpdatePremiumStatus(req: Request, res: Response) {
    try {
      const userId = req.userId as number; 
      const user = await UserService.checkAndUpdatePremiumStatus(userId);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message }); 
    }
  }

static async getUserProfileById(req: Request, res: Response) {
    try {
      const userId = req.userId as number;
        const profile = await UserService.getUserById(userId);
        if (profile.isPrivate) {
            return res.status(403).json({ message: "Private profile" });
        }
        return res.json(profile);
    } catch (error:any) {
        return res.status(404).json({ message: error.message });
    }
}

static async searchUsers(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.query;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ message: "Name parameter is required and must be a string" });
      return;
    }

    const users = await UserService.searchUsersByName(name);
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

}

export default UserController;
