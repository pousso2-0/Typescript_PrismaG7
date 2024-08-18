import express from 'express';
// import MessageController from '../controllers/messageController.js';
import {authMiddleware} from '../middlewares/authMiddleware';
import MessageController from '../controllers/messageController';



const router = express.Router();

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Envoyer un message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId :
 *                 type: string
 *                 description: ID du destinataire
 *               content:
 *                 type: string
 *                 description: Contenu du message
 *     responses:
 *       201:
 *         description: Message envoyé avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Destinataire non trouvé
 */
router.post('/', authMiddleware, MessageController.sendMessage);

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Récupérer tous les messages de l'utilisateur connecté
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des messages de l'utilisateur
 *       404:
 *         description: Aucun message trouvé
 */
router.get('/', authMiddleware, MessageController.getAllUserMessages);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Récupérer toutes les conversations de l'utilisateur connecté
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations de l'utilisateur
 *       404:
 *         description: Aucune conversation trouvée
 */
router.get('/conversations', authMiddleware, MessageController.getConversations);

/**
 * @swagger
 * /api/messages/{otherUserId}:
 *   get:
 *     summary: Récupérer tous les messages échangés avec un autre utilisateur
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'autre utilisateur avec lequel récupérer les messages
 *     responses:
 *       200:
 *         description: Liste des messages échangés avec l'autre utilisateur
 *       404:
 *         description: Messages ou utilisateur non trouvé
 */
router.get('/:otherUserId', authMiddleware, MessageController.getMessagesWithUser);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Supprimer un message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du message à supprimer
 *     responses:
 *       200:
 *         description: Message supprimé avec succès
 *       404:
 *         description: Message non trouvé
 */
router.delete('/:id', authMiddleware, MessageController.deleteMessage);

export default router;
