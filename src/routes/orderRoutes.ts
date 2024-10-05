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
*             type: object
*             properties:
*               userId:
*                 type: integer
*                 example: 1
*               vendorId:
*                 type: integer
*                 example: 1
*               totalAmount:
*                 type: number
*                 format: float
*                 example: 100.00
*               paymentType:
*                 type: string
*                 example: 'CASH_ON_DELIVERY'
*               deliveryMode:
*                 type: string
*                 example: 'DELIVERY'
*     responses:
*       201:
*         description: Order created

*       400:
*         description: Bad request
*/
router.post('/', roleMiddleware(['TAILLEUR']), authMiddleware, OrderController.createOrder);

/**
* @swagger
* /api/orders:
*   get:
*     summary: Get orders for the logged-in user
*     tags: [Orders]
*     responses:
*       200:
*         description: List of orders
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
*             type: object
*             properties:
*               status:
*                 type: string
*                 example: 'COMPLETED'
*               paymentType:
*                 type: string
*                 example: 'WAVE'
*     responses:
*       200:
*         description: Order status updated
*       400:
*         description: Bad request
*/
router.put('/orders/:orderId', roleMiddleware(['TAILLEUR']), authMiddleware, OrderController.updateOrderStatus);

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
*             type: object
*             properties:
*               orderId:
*                 type: integer
*                 example: 1
*               amount:
*                 type: number
*                 format: float
*                 example: 100.00
*               paymentType:
*                 type: string
*                 example: 'WAVE'
*     responses:
*       200:
*         description: Payment processed successfully
*       400:
*         description: Bad request
*/
router.post('/payments', roleMiddleware(['TAILLEUR']), PaymentController.processPayment);

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
*       400:
*         description: Bad request
*/
router.patch('/:orderId/complete', roleMiddleware(['VENDEUR']), authMiddleware, OrderController.markOrderAsCompleted);


export default router;

