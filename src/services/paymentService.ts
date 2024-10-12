import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PaymentService {
  private static async simulatePayment(paymentType: string, amount: number): Promise<string> {
    const success = paymentType === 'CREDIT_CARD' ? Math.random() > 0.2 : Math.random() > 0.3;
    return success ? 'SUCCESS' : 'FAILED';
  }

  static async processPayment(orderId: number): Promise<void> {
    let paymentStatus: string;

    // Find the order and its total amount
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { totalAmount: true },
    });
    if (!order) throw new Error('Order not found');

    // Find the payment record associated with the order
    const payment = await prisma.payment.findUnique({
      where: { orderId: orderId },
    });
    if (!payment) throw new Error('Payment record not found');

    // Check if the payment is already completed
    if (payment.status === 'SUCCESS' || payment.status === 'ON_DELIVERED') {
      throw new Error('Payment for this order has already been processed or will be processed upon delivery');
    }

    // Find the payment type using the paymentTypeId stored in the payment record
    const paymentType = await prisma.paymentType.findUnique({
      where: { id: payment.paymentTypeId },
    });
    if (!paymentType) throw new Error('Invalid payment type');

    
      paymentStatus = await this.simulatePayment(paymentType.type, order.totalAmount);
      if (paymentStatus === 'FAILED') {
        throw new Error('Payment failed');
      }
    

    // Update the payment status
    await prisma.payment.update({
      where: { orderId: orderId },
      data: { status: paymentStatus },
    });

    // Update the order status if necessary
    if (paymentStatus === 'SUCCESS') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAY' },
      });
    }
  }
}

export default PaymentService;
