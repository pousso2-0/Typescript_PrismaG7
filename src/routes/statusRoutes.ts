import express from 'express';
import StatusController from '../controllers/statusController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/status:
 *   post:
 *     summary: Créer un nouveau statut
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenu du statut
 *     responses:
 *       201:
 *         description: Statut créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', authMiddleware, StatusController.createStatus);

/**
 * @swagger
 * /api/status/all:
 *   get:
 *     summary: Récupérer tous les statuts de l'utilisateur connecté
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des statuts de l'utilisateur
 *       404:
 *         description: Aucun statut trouvé
 */
router.get('/all', authMiddleware, StatusController.getUserStatuses);

/**
 * @swagger
 * /api/status/followed:
 *   get:
 *     summary: Récupérer les statuts des utilisateurs suivis
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des statuts des utilisateurs suivis
 *       404:
 *         description: Aucun statut trouvé
 */
router.get('/followed', authMiddleware, StatusController.getFollowedUserStatuses);

/**
 * @swagger
 * /api/status/del/{statusId}:
 *   delete:
 *     summary: Supprimer un statut
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: statusId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du statut à supprimer
 *     responses:
 *       200:
 *         description: Statut supprimé avec succès
 *       404:
 *         description: Statut non trouvé
 */
router.delete('/del/:statusId', authMiddleware, StatusController.deleteStatus);

/**
 * @swagger
 * /api/status/message:
 *   post:
 *     summary: Envoyer un message à un statut
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statusId:
 *                 type: string
 *                 description: ID du statut
 *               message:
 *                 type: string
 *                 description: Contenu du message
 *     responses:
 *       200:
 *         description: Message envoyé avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Statut non trouvé
 */
 router.post('/message', authMiddleware, StatusController.sendMessageToStatus);

/**
 * @swagger
 * /api/status/{statusId}:
 *   get:
 *     summary: Voir un statut spécifique
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: statusId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du statut à afficher
 *     responses:
 *       200:
 *         description: Détails du statut
 *       404:
 *         description: Statut non trouvé
 */
router.get('/:statusId', authMiddleware, StatusController.getStatus);


export default router;