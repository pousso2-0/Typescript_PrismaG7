import { Request, Response } from 'express';
import PaymentService from '../services/paymentService';

class PaymentController {
  static async processPayment(req: Request, res: Response) {
    try {
      const { orderId } = req.body;
      await PaymentService.processPayment(orderId);
      res.status(200).json({ message: 'Payment processed successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default PaymentController;
