import { PrismaClient, Order as PrismaOrder, Prisma } from '@prisma/client';
import { CreateOrderDto } from '../Interfaces/ArticleInterface';

const prisma = new PrismaClient();

class OrderService {
  static async createOrder(orderData: CreateOrderDto): Promise<PrismaOrder> {
    return prisma.order.create({
      data: {
        userId: orderData.userId,
        vendorId: orderData.vendorId,
        totalAmount: orderData.totalAmount,
        status: orderData.status || 'PENDING',
      },
      include: {
        user: true,
        vendor: true
      }
    });
  }

  static async getOrdersByTailor(tailorId: number): Promise<PrismaOrder[]> {
    return prisma.order.findMany({
      where: { userId: tailorId },
      include: {
        user: true,
        vendor: true
      }
    });
  }

  static async getOrdersByVendor(vendorId: number): Promise<PrismaOrder[]> {
    return prisma.order.findMany({
      where: { vendorId },
      include: {
        user: true,
        vendor: true
      }
    });
  }

  static async updateOrderStatus(orderId: number, status: string): Promise<PrismaOrder> {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: true,
        vendor: true
      }
    });
  }
}

export default OrderService;