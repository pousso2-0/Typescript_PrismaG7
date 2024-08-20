import express from 'express';
import OrderController from '../controllers/orderController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Créer une nouvelle commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderDto'
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Erreur dans la requête
 *       401:
 *         description: Non autorisé
 */
router.post('/', authMiddleware, OrderController.createOrder);

/**
 * @swagger
 * /api/orders/tailor/{tailorId}:
 *   get:
 *     summary: Obtenir les commandes d'un tailleur spécifique
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tailorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des commandes du tailleur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: Erreur dans la requête
 *       401:
 *         description: Non autorisé
 */
router.get('/tailor/:tailorId', authMiddleware, OrderController.getOrdersByTailor);

/**
 * @swagger
 * /api/orders/vendor/{vendorId}:
 *   get:
 *     summary: Obtenir les commandes d'un vendeur spécifique
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des commandes du vendeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: Erreur dans la requête
 *       401:
 *         description: Non autorisé
 */
router.get('/vendor/:vendorId', authMiddleware, OrderController.getOrdersByVendor);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'une commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderDto'
 *     responses:
 *       200:
 *         description: Statut de la commande mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Erreur dans la requête
 *       401:
 *         description: Non autorisé
 */
router.patch('/:orderId/status', authMiddleware, OrderController.updateOrderStatus);

export default router;