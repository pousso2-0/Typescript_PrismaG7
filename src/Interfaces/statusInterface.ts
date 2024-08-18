export interface Status {
    id: number; // Utilisation de 'number' au lieu de 'string' pour correspondre à l'ID généré par Prisma
    userId: number; // Assurez-vous que c'est bien un nombre
    content: string;
    media?: string;
    expiresAt?: Date | null; // Accepter 'Date' ou 'null' pour s'adapter à Prisma
    viewsCount: number;
    viewedBy: Array<{ id: number }>; // Utiliser un tableau d'objets avec un champ 'id' pour correspondre à 'ViewWhereUniqueInput' de Prisma
    createdAt: Date;
    updatedAt: Date;
  }
  