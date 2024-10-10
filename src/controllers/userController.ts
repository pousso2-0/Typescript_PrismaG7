// src/controllers/UserController.ts
import { Request, Response } from 'express';
import UserService from '../services/userService';
import {Register} from "../Interfaces/UserInterface";
import { handleMediaFiles } from '../utils/mediaUtils'; // Assurez-vous que handleMediaFiles est disponible et fonctionne correctement

class UserController {
    static async register(req: Request, res: Response) {
        try {
            const userData: Register = req.body;
            console.log(userData);

            const authToken = await UserService.register(userData);
            return res.status(201).json(authToken);
        } catch (error: any) {
            console.log(`Error: ${error.message}`);
            return res.status(400).json({ message: error.message });
        }
    }
    static async updateUser(req: Request, res: Response) {
        try {
            const userId = req.userId as number;  // User ID venant du middleware d'authentification
            const updatedData = req.body;
            const { website } = req.body;

            // Parser manuellement le champ `website` s'il est reçu sous forme de string
            let parsedWebsite;
            if (website) {
                try {
                    parsedWebsite = JSON.parse(website);
                    console.log("Données de 'website' parsées avec succès", parsedWebsite);
                    updatedData.website = parsedWebsite;  // Inclure les données parsées
                } catch (error) {
                    return res.status(400).json({ message: "Invalid website format" });
                }
            }
            // Vérifier si req.files existe et est un tableau ou un fichier unique
            let files: Express.Multer.File[] = [];
            if (Array.isArray(req.files)) {
                files = req.files;
            } else if (req.file) {
                files.push(req.file);
            }

            if (files.length > 0) {
                // Utiliser handleMediaFiles pour traiter les fichiers envoyés
                const profilePictures = await handleMediaFiles(files, 'profilePicture');

                // Si un fichier est trouvé et traité, attacher l'URL à updatedData
                if (profilePictures.length > 0) {
                    updatedData.profilePicture = profilePictures[0];  // Prendre le premier fichier
                }
            }

            console.log('Utilisateur connecté', userId);

            // Appeler la méthode de service pour mettre à jour les informations de l'utilisateur
            const updatedUser = await UserService.updateUser(userId, updatedData);

            // Réponse de succès
            return res.status(200).json(updatedUser);
        } catch (error: any) {
            // Gestion des erreurs
            return res.status(500).json({ message: error.message });
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
      res.status(200).json({ message: "Logout successful" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getCurrentUserProfile(req: Request, res: Response) {
    try {
      const profile = await UserService.getUserById(req.userId as number , true); // assuming userId is added to req by middleware
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
        const userId = parseInt(req.params.id, 10) ;
        const profile = await UserService.getUserById(userId , true);

        // Vérifiez si le profil est privé
        if (profile.isPrivate) {
            return res.status(403).json({ message: "Private profile" });
        }

        // Tronquez les données du profil
        const truncatedProfile = {
            id: profile.id,
            name: profile.name,
            type: profile.type,
            profilePicture: profile.profilePicture,
            location: profile.location,
            dateOfBirth: profile.dateOfBirth,
            website: profile.website,
            followersCount: profile.followersCount,
            followingCount: profile.followingCount,
            postsCount: profile.postsCount,
            isOnline: profile.isOnline,
            lastSeenAt: profile.lastSeenAt,
            createdAt: profile.createdAt,
        };

        return res.json(truncatedProfile);
    } catch (error: any) {
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

static async getUserOnlineStatus(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    const status = await UserService.getUserOnlineStatus(userId);
    res.json(status);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
}

}

export default UserController;
