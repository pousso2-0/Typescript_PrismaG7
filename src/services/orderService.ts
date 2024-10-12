import { PrismaClient, Order as PrismaOrder } from "@prisma/client";
import { CreateOrderDto } from "../Interfaces/ArticleInterface";

const prisma = new PrismaClient();

class OrderService {
  static async createOrder(userId: number, orderData: CreateOrderDto): Promise<PrismaOrder> {
    const { vendorId, articleId, quantity, paymentType, storeId } = orderData;

    // Retrieve the article and check stock availability
    const article = await prisma.catalogue.findUnique({
      where: {
        storeId_articleId: { storeId, articleId },
      },
    });
    if (!article) throw new Error(`Article with ID ${articleId} not found in store ${storeId}`);
    if (article.stockCount < quantity) throw new Error("Insufficient stock available");

    // Calculate total amount
    const totalAmount = article.price * quantity;

    // Retrieve PaymentType record based on the name
    const paymentTypeRecord = await prisma.paymentType.findUnique({
      where: { type: paymentType },
    });
    if (!paymentTypeRecord) throw new Error(`Payment type "${paymentType}" not found`);

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        vendorId,
        storeId,
        articleId,
        quantity,
        totalAmount,
        status: "PENDING",
        deliveryMode: "DELIVERY",
      },
      include: {
        user:  {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        store: true,
        payment: true,
      },
    });

    // Create initial payment entry
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        paymentTypeId: paymentTypeRecord.id, 
        status: paymentType === 'CASH_ON_DELIVERY' ? 'ON_DELIVERED' : 'PENDING',
      },
    });

    // Update stock count
    await prisma.catalogue.update({
      where: {
        storeId_articleId: { storeId, articleId },
      },
      data: { stockCount: article.stockCount - quantity },
    });

    return order;
  }
  private static  getIncludeOptions(field: 'userId' | 'vendorId' | 'storeId') {
    const includeOptions: any = {
      store: {
        select: {
          id: true,
          name: true,
        },
      },
      payment: {
        select: {
          status: true,
          paymentType: true,
        },
      },
    };
  
    if (field === 'userId') {
      includeOptions.vendor  = {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          isOnline: true,
          lastSeenAt: true,
          location: true,

        },
      };
    } else if (field === 'vendorId') {
      includeOptions.user = {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          location: true,
          isOnline: true,
          lastSeenAt: true,
        },
      };
    }
  
    return includeOptions;
  }

  static async cancelOrder(orderId: number): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) throw new Error('Order not found');

    if (order.payment && order.payment.status === 'SUCCESS') {
      throw new Error('Cannot cancel a paid order');
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELED' },
    });

    // Optional: You might also want to revert the stock if the order is canceled.
    await prisma.catalogue.update({
      where: {
        storeId_articleId: {
          storeId: order.storeId,
          articleId: order.articleId,
        },
      },
      data: { stockCount: { increment: order.quantity } },
    });
  }

  static async getOrdersByField(field: 'userId' | 'vendorId' | 'storeId', id: number): Promise<PrismaOrder[]> {
  
    console.log(field, id);
  
    // Utiliser la fonction importée pour obtenir `includeOptions`
    const includeOptions = this.getIncludeOptions(field);
  
    // Requête Prisma avec les options `include` dynamiques
    return prisma.order.findMany({
      where: { [field]: id },
      include: includeOptions,
    });
  }

  static async updateOrderStatus(orderId: number,status: string): Promise<PrismaOrder> {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: true,
        vendor: true,
        store: true,
        payment: true,
      },
    });
  }

  static async markOrderAsCompleted(orderId: number): Promise<void> {
    // Find the order and payment record
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) throw new Error('Order not found');


    // Check if the order status is 'PAY' or 'PENDING' with payment status 'ON_DELIVERED'
    if (order.payment) {
      if (order.status === 'PAY' || (order.status === 'PENDING' && order.payment.status === 'ON_DELIVERED')) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' },
        });
      } else {
        throw new Error('Order cannot be marked as completed');
      }
    } else {
      throw new Error('Payment record not found');
    }
  }
}

export default OrderService;
