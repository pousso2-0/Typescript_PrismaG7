import express from 'express';
import ConversationController from '../controllers/messageController';
import { authMiddleware } from '../middlewares/authMiddleware';

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
router.post('/', authMiddleware, ConversationController.sendMessage);


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
router.get('/conversations', authMiddleware, ConversationController.getUserConversations);

/**
 * @swagger
 * /api/messages/conversation/{conversationId}:
 *   get:
 *     summary: Récupérer tous les messages échangés dans une conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la conversation
 *     responses:
 *       200:
 *         description: Liste des messages échangés avec l'autre utilisateur 
 *       404:
 *         description: Messages ou conversation non trouvé
 */
router.get('/:conversationId', authMiddleware, ConversationController.getConversationMessages);

/**
 * @swagger
 * /api/messages/{messageId}:
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
router.delete('/:id', authMiddleware, ConversationController.deleteMessage);

export default router;
