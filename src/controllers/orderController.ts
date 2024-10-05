// controllers/orderController.ts
import { Request, Response } from 'express';
import OrderService from '../services/orderService';
import { CreateOrderDto, UpdateOrderDto } from '../Interfaces/ArticleInterface';

class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const userId = req.userId as number;

      const orderData: CreateOrderDto = req.body;
      const order = await OrderService.createOrder(userId, orderData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getOrders(req: Request, res: Response) {
    try {
      const userId = req.userId as number;
      const userType = req.userType as string 

      console.log(userId, userType);
      
      
      if (!userId || !userType) {
        return res.status(400).json({ message: 'User ID or type is missing' });
      }

      const field = userType === 'VENDEUR' ? 'vendorId' : 'userId';
      const orders = await OrderService.getOrdersByField(field, userId);

      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = Number(req.params.orderId);
      const statusData: UpdateOrderDto = req.body;
      if (statusData.status === undefined) {
        throw new Error("Status is required");
      }
      const updatedOrder = await OrderService.updateOrderStatus(orderId, statusData.status);
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async markOrderAsCompleted(req: Request, res: Response) {
    try {
      const orderId = Number(req.params.orderId);
      const updatedOrder = await OrderService.markOrderAsCompleted(orderId);
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  static async cancelOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.body;
      await OrderService.cancelOrder(orderId);
      res.status(200).json({ message: 'Order canceled successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default OrderController;