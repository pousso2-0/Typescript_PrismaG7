import express from 'express';
import OrderController from '../controllers/orderController';
import PaymentController from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderDto'
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 */
router.post('/',roleMiddleware(['TAILLEUR']), authMiddleware, OrderController.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders for the logged-in user
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 */
router.get('/', roleMiddleware(['VENDEUR', 'TAILLEUR']), authMiddleware, OrderController.getOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: ID of the order to update
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
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 */
router.put('/orders/:orderId',roleMiddleware(['TAILLEUR']), authMiddleware, OrderController.updateOrderStatus);


/**
 * @swagger
 * /api/orders/payments:
 *   post:
 *     summary: Process a payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentDto'
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Bad request
 */
router.post('/payments',roleMiddleware(['TAILLEUR']), PaymentController.processPayment);

/**
 * @swagger
 * /api/orders/{orderId}/complete:
 *   patch:
 *     summary: Mark an order as completed
 *     tags: [Orders]
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: ID of the order to mark as completed
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 */
router.patch('/:orderId/complete', roleMiddleware(['VENDEUR']), authMiddleware, OrderController.markOrderAsCompleted);




export default router;


