import express from 'express';
import UserController from '../controllers/userController';
import {authMiddleware} from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom complet de l'utilisateur
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur
 *               type:
 *                 type: string
 *                 description: Type d'utilisateur 
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *                 description: URL de la photo de profil de l'utilisateur (optionnel)
 *               bio:
 *                 type: string
 *                 description: Biographie ou description de l'utilisateur (optionnel)
 *               location:
 *                 type: string
 *                 description: Emplacement ou ville de l'utilisateur (optionnel)
 *               gender:
 *                 type: string
 *                 description: Genre de l'utilisateur (optionnel)
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone de l'utilisateur (optionnel)
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des compétences de l'utilisateur (optionnel)
 *     responses:
 *       200:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/register', UserController.register);


/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants incorrects
 */
router.post('/login', UserController.login);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout', UserController.logout);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur
 */
router.get('/profile', authMiddleware, UserController.getCurrentUserProfile);



export default router;