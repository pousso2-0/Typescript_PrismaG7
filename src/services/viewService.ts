import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ViewService {
  static async recordView(userId: number, postId?: number, statusId?: number) {
    // Vérifiez si l'utilisateur a déjà vu le post ou le statut
    const existView = await prisma.view.findFirst({
      where: {
        userId,
        ...(postId ? { postId } : { statusId }),
      },
    });

    if (existView) {
      return { message: postId ? 'Post déjà vu' : 'Statut déjà vu', view: existView, viewsCount: undefined };
    }

    // Créez une nouvelle vue pour le post ou le statut
    const view = await prisma.view.create({
      data: {
        userId,
        ...(postId ? { postId } : { statusId }),
      },
    });

    // Incrémentez la vue du post ou du statut
    const content = postId
      ? await prisma.post.update({ where: { id: postId }, data: { viewsCount: { increment: 1 } } })
      : await prisma.status.update({ where: { id: statusId }, data: { viewsCount: { increment: 1 } } });

    return { message: postId ? 'Vue de post enregistrée' : 'Vue de statut enregistrée', view, viewsCount: content.viewsCount };
  }
}

export default ViewService;
