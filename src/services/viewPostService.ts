// src/services/ViewPostService.ts
import { PrismaClient} from "@prisma/client";


const prisma = new PrismaClient();

class ViewPostService {
  static async recordView(userId: number, postId: number) {
    // Vérifiez si l'utilisateur a déjà vu le post
    const existView = await prisma.view.findFirst({
      where: { userId, postId },
    });

    if (existView) {
      return { message: 'Post déjà vu', view: existView, viewsCount: undefined };
    }

    // Créez une nouvelle vue
    const view = await prisma.view.create({
      data: {
        userId,
        postId,
      },
    });

    // Incrémentez la vue du post
    const post = await prisma.post.update({
      where: { id: postId },
      data: { viewsCount: { increment: 1 } },
    });

    return { message: 'Vue enregistrée', view, viewsCount: post.viewsCount };
  }
}

export default ViewPostService;
