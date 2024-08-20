// controllers/orderController.ts
import { Request, Response } from 'express';
import OrderService from '../services/orderService';
import { CreateOrderDto, UpdateOrderDto } from '../Interfaces/ArticleInterface';

class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const orderData: CreateOrderDto = req.body;
      const order = await OrderService.createOrder(orderData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getOrdersByTailor(req: Request, res: Response) {
    try {
      const tailorId = Number(req.params.tailorId);
      const orders = await OrderService.getOrdersByTailor(tailorId);
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getOrdersByVendor(req: Request, res: Response) {
    try {
      const vendorId = Number(req.params.vendorId);
      const orders = await OrderService.getOrdersByVendor(vendorId);
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
}

export default OrderController;
