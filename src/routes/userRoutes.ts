import express from 'express';
import UserController from '../controllers/userController';
import FollowController from '../controllers/followController';
import VoteController from '../controllers/voteController';
import {authMiddleware} from '../middlewares/authMiddleware';
import MesureController from '../controllers/mesureController';
import ReportController from '../controllers/reportController';
import NotificationController from '../controllers/notificationController';
import {uploadMiddleware} from "../middlewares/uploadMiddleware";

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
 *         multipart/form-data:
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
 *                 format: password
 *                 description: Mot de passe de l'utilisateur
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image de la photo de profil de l'utilisateur (optionnel)

 *     responses:
 *       200:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/register', uploadMiddleware, UserController.register);


/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Modifier son compte
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 format: password
 *                 description: Mot de passe de l'utilisateur
 *               type:
 *                 type: string
 *                 description: Type d'utilisateur
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: "Date de naissance de l'utilisateur (format: YYYY-MM-DD)"
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image de la photo de profil de l'utilisateur (optionnel)
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
 *               storeName:
 *                 type: string
 *                 description: Nom du magasin (optionnel)
 *               storeDescription:
 *                 type: string
 *                 description: Description du magasin (optionnel)
 *               website:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: "URL of the website"
 *                     type:
 *                       type: string
 *                       description: "Type of the website (e.g., Facebook, YouTube, etc.)"
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès
 *       400:
 *         description: Données invalides
 */
router.put('/update', authMiddleware, uploadMiddleware, UserController.updateUser);

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



/**
 * @swagger
 * /api/users/profile/{id}:
 *   get:
 *     summary: Récupérer le profil d'un utilisateur
 *     tags: 
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur
 */
router.get('/profile/:id', authMiddleware, UserController.getUserProfileById);

/**
 * @swagger
 * /api/users/buy-credits:
 *   post:
 *     summary: Buy credits for a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated user with new credits
 */
router.post('/buy-credits', authMiddleware, UserController.buyCredits);

/**
 * @swagger
 * /api/users/upgrade-to-premium:
 *   post:
 *     summary: Upgrade a user to premium
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Updated user with premium status
 */
router.post('/upgrade-to-premium', authMiddleware, UserController.upgradeToPremium);

/**
 * @swagger
 * /api/users/premium-status:
 *   get:
 *     summary: Check and update premium status of a user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Updated user with the current premium status
 */
router.get('/premium-status',authMiddleware, UserController.checkAndUpdatePremiumStatus);


/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Rechercher des utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Résultats de la recherche
 *       404:
 *         description: Aucun utilisateur trouvé
 */
router.get('/search', authMiddleware, UserController.searchUsers);


/**
 * @swagger
 * /api/users/follow:
 *   post:
 *     summary: Suivre un utilisateur
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followingId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Utilisateur suivi
 */
router.post('/follow', authMiddleware, FollowController.followUser);

/**
 * @swagger
 * /api/users/unfollow:
 *   post:
 *     summary: Ne plus suivre un utilisateur
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unfollowingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur non suivi
 */
router.post('/unfollow', authMiddleware, FollowController.unfollowUser);

/**
 * @swagger
 * /api/users/follower:
 *   get:
 *     summary: Récupérer les abonnés de l'utilisateur connecté
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des abonnés
 */
router.get('/follower', authMiddleware, FollowController.getFollowers);

/**
 * @swagger
 * /api/users/following:
 *   get:
 *     summary: Récupérer les utilisateurs que l'utilisateur connecté suit
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs suivis
 */
router.get('/following', authMiddleware, FollowController.getFollowing);

/**
 * @swagger
 * /api/users/vote:
 *   post:
 *     summary: Voter pour un tailleur
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tailorId:
 *                 type: number
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Vote enregistré
 */
router.post('/vote', authMiddleware, VoteController.vote);

/**
 * @swagger
 * /api/users/{id}/vote:
 *   get:
 *     summary: Récupérer la note moyenne d'un tailleur
 *     tags: [Votes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du tailleur
 *     responses:
 *       200:
 *         description: Note moyenne récupérée
 */
router.get('/:id/vote', authMiddleware, VoteController.getTailorRating);

/**
 * @swagger
 * /api/users/mesure:
 *   post:
 *     summary: Créer ou mettre à jour une mesure pour l'utilisateur connecté
 *     tags: [Mesures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taille:
 *                 type: number
 *                 example: 175
 *               tourPoitrine:
 *                 type: number
 *                 example: 90
 *               tourTaille:
 *                 type: number
 *                 example: 75
 *               tourHanche:
 *                 type: number
 *                 example: 95
 *               longueurDos:
 *                 type: number
 *                 example: 40
 *               largeurEpaules:
 *                 type: number
 *                 example: 50
 *               longueurManche:
 *                 type: number
 *                 example: 65
 *               tourCou:
 *                 type: number
 *                 example: 38
 *               longueurJambe:
 *                 type: number
 *                 example: 105
 *               tourCuisse:
 *                 type: number
 *                 example: 55
 *               tourBras:
 *                 type: number
 *                 example: 35
 *             required:
 *               - taille
 *               - tourTaille
 *               - largeurEpaules
 *               - tourCuisse
 *               - tourBras
 *     responses:
 *       201:
 *         description: Mesure créée ou mise à jour avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/mesure', authMiddleware, MesureController.createOrUpdateMesure);

/**
 * @swagger
 * /api/users/mesures:
 *   get:
 *     summary: Récupérer les mesures de l'utilisateur connecté
 *     tags: [Mesures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des mesures récupérées
 *       404:
 *         description: Aucune mesure trouvée
 */
router.get('/mesures', authMiddleware, MesureController.getMesure);

/**
 * @swagger
 * /api/users/delMesure:
 *   delete:
 *     summary: Supprimer une mesure de l'utilisateur connecté
 *     tags: [Mesures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mesureId:
 *                 type: number
 *                 description: ID de la mesure à supprimer
 *     responses:
 *       200:
 *         description: Mesure supprimée avec succès
 *       400:
 *         description: Données invalides ou mesure non trouvée
 */
router.delete('/delMesure', authMiddleware, MesureController.deleteMesure);


/**
 * @swagger
 * /api/users/report:
 *   post:
 *     summary: Signaler un utilisateur
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signaledId:
 *                 type: string
 *               reasons:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signalement créé
 */
router.post('/report', authMiddleware, ReportController.reportUser);



/**
 * @swagger
 * /api/users/notifications:
 *   get:
 *     summary: Récupérer les notifications de l'utilisateur connecté
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 */
router.get('/notifications', authMiddleware, NotificationController.getNotifications);

/**
 * @swagger
 * /api/users/notifications/{id}:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 */
router.patch('/notifications/:id', authMiddleware, NotificationController.markAsRead);

/**
 * @swagger
 * /api/users/notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la notification à supprimer
 *     responses:
 *       200:
 *         description: Notification supprimée avec succès
 *       404:
 *         description: Notification non trouvée
 *       403:
 *         description: Non autorisé à supprimer cette notification
 */
router.delete('/notifications/:id', authMiddleware, NotificationController.deleteNotification);

/**
 * @swagger
 * /api/users/notifications/{id}/unread:
 *   patch:
 *     summary: Marquer une notification comme non lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la notification à marquer comme non lue
 *     responses:
 *       200:
 *         description: Notification marquée comme non lue
 *       404:
 *         description: Notification non trouvée
 *       403:
 *         description: Non autorisé à marquer cette notification
 */
router.patch('/notifications/:id/unread', authMiddleware, NotificationController.markAsUnread);

/**
 * @swagger
 * /api/users/notifications:
 *   post:
 *     summary: Envoyer une notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification envoyée
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Utilisateur ou notification non trouvé
 */
router.post('/notifications', authMiddleware, NotificationController.sendNotification);


/**
 * @swagger
 * /api/users/{id}/online-status:
 *   get:
 *     summary: Récupérer le statut en ligne d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Statut en ligne de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isOnline:
 *                   type: boolean
 *                 lastSeenAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:id/online-status', UserController.getUserOnlineStatus);




export default router;