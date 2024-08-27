// src/services/ReportService.ts

import { PrismaClient } from '@prisma/client';
import { Report } from '../Interfaces/UserInterface';
import NotificationService from './notificationService';

const prisma = new PrismaClient();

class ReportService {
  private static validReasons: string[] = ['spam', 'harassment', 'hate speech', 'fake profile', 'other'];

  static async reportUser(signalerId:number, {signaledId, reasons }: Report): Promise<Report> {
    // Valider les raisons fournies
    if (!this.isValidReasons(reasons)) {
      throw new Error('Invalid reasons provided');
    }
    // Vérifier si l'utilisateur a déjà été signalé par le même utilisateur
    const existingReport = await prisma.report.findFirst({
      where: { signalerId: signalerId, signaledId: signaledId },
    });
    

    if (existingReport) {
      throw new Error('User has already been reported by you');
    }

    // Créer un rapport
    const report = await prisma.report.create({
      data: {
        signalerId: signalerId,
        signaledId: signaledId,
        reasons: reasons, // Convertir le tableau en chaîne
      },
    })
    
    // Incrémenter le compteur de rapports pour l'utilisateur signalé
    const user = await prisma.user.update({
      where: { id: signaledId },
      data: { reportCount: { increment: 1 } },
    });

    const blockshold = 8;
    const notifyshold = 5;

    // Bloquer l'utilisateur s'il dépasse le seuil
    if (user.reportCount >= blockshold) {
      await prisma.user.update({
        where: { id: signaledId },
        data: { isBlocked: true },
      });
    } 
    // Envoyer une notification si le seuil est atteint
    else if (user.reportCount >= notifyshold) {
      const message = `Your account has been temporarily blocked due to multiple reports. Please review your account and report any issues you may have encountered.`;
      await NotificationService.sendNotification(signaledId, message);
    }

    return report as Report;
  }

  
    // Méthode pour valider la raison
    private static isValidReasons(reason: string): boolean {
      return this.validReasons.includes(reason);
    }
}
export default ReportService;
