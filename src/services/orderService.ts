import { PrismaClient, Order as PrismaOrder } from "@prisma/client";
import { CreateOrderDto } from "../Interfaces/ArticleInterface";

const prisma = new PrismaClient();

class OrderService {
  static async createOrder(userId: number, orderData: CreateOrderDto): Promise<PrismaOrder> {
    const { vendorId, articleId, quantity, paymentType, storeId } = orderData;

    // Récupérer l'article et vérifier la disponibilité du stock
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
        storeId: storeId, // La relation directe entre article et store
      },
    });
    if (!article) throw new Error(`Article avec ID ${articleId} introuvable dans le magasin ${storeId}`);
    if (article.stockCount < quantity) throw new Error("Stock insuffisant disponible");

    // Calculer le montant total
    const totalAmount = article.price * quantity;

    // Récupérer le type de paiement
    const paymentTypeRecord = await prisma.paymentType.findUnique({
      where: { type: paymentType },
    });
    if (!paymentTypeRecord) throw new Error(`Type de paiement "${paymentType}" introuvable`);

    // Créer la commande
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
        user: {
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

    // Créer une entrée de paiement initiale
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        paymentTypeId: paymentTypeRecord.id,
        status: paymentType === 'CASH_ON_DELIVERY' ? 'ON_DELIVERED' : 'PENDING',
      },
    });

    // Mettre à jour le stock de l'article
    await prisma.article.update({
      where: { id: articleId },
      data: { stockCount: article.stockCount - quantity },
    });

    return order;
  }

  private static getIncludeOptions(field: 'userId' | 'vendorId' | 'storeId') {
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
      includeOptions.vendor = {
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
    if (!order) throw new Error('Commande non trouvée');

    if (order.payment && order.payment.status === 'SUCCESS') {
      throw new Error('Impossible d’annuler une commande payée');
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELED' },
    });

    // Optionnel : vous pouvez aussi vouloir rétablir le stock si la commande est annulée
    await prisma.article.update({
      where: { id: order.articleId },
      data: { stockCount: { increment: order.quantity } },
    });
  }

  static async getOrdersByField(field: 'userId' | 'vendorId' | 'storeId', id: number): Promise<PrismaOrder[]> {
    console.log(field, id);
    const includeOptions = this.getIncludeOptions(field);

    return prisma.order.findMany({
      where: { [field]: id },
      include: includeOptions,
    });
  }

  static async updateOrderStatus(orderId: number, status: string): Promise<PrismaOrder> {
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
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) throw new Error('Commande non trouvée');

    if (order.payment) {
      if (order.status === 'PAY' || (order.status === 'PENDING' && order.payment.status === 'ON_DELIVERED')) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' },
        });
      } else {
        throw new Error('Impossible de marquer la commande comme complétée');
      }
    } else {
      throw new Error('Enregistrement de paiement introuvable');
    }
  }
}

export default OrderService;
