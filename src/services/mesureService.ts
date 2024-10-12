import { PrismaClient } from '@prisma/client';
import { MeasurementKey, Measurement, Gender } from '../Interfaces/UserInterface';

const prisma = new PrismaClient();

// Définir la classe MeasurementService qui gère les opérations liées aux mesures des utilisateurs
class MeasurementService {

  // Définir un mapping des mesures autorisées en fonction du genre
  private static allowedMeasurementsByGender: Record<Gender, MeasurementKey[]> = {
    male: ['taille', 'tourTaille', 'largeurEpaules', 'tourCuisse', 'tourBras'],
    female: ['taille', 'tourPoitrine', 'tourHanche', 'tourBras'],
  };

  // Méthode privée pour filtrer les mesures en fonction du genre
  private static filterMeasurementsByGender(
      measurements: Measurement, // Les mesures à filtrer
      gender: Gender // Le genre de l'utilisateur
    ): Measurement {

    // Récupérer les mesures autorisées pour le genre spécifié
    const allowedMeasurements = this.allowedMeasurementsByGender[gender];
    console.log("Type de mesures pour ce genre:", allowedMeasurements);
    
    // Initialiser un objet partiel pour les mesures filtrées
    const filtered: Partial<Measurement> = {};
  
    console.log("Mesures fournies:", measurements, "Genre:", gender);
  
    // Parcourir les clés autorisées pour ce genre
    for (const key of allowedMeasurements) {
      // Vérifier si la clé est présente dans les données de mesure et a une valeur définie
      if (measurements[key as keyof Measurement] !== undefined) {
        filtered[key as keyof Measurement] = measurements[key as keyof Measurement];
      } else {
        console.log(`La clé ${key} n'est pas présente ou est indéfinie dans les mesures.`);
      }
    }
  
    console.log("Données de mesure filtrées:", filtered);
  
    // Retourner les données de mesure filtrées en tant qu'objet Measurement
    return filtered as Measurement;
  }

  // Méthode pour créer ou mettre à jour les mesures pour un utilisateur
  static async createOrUpdateMeasurement(userId: number, measurementData: Measurement) {
    try {
      // Récupérer l'utilisateur en fonction de son ID
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found"); // Erreur si l'utilisateur n'existe pas
      if (user.type !== 'CLIENT') throw new Error("Only clients can enter measurements"); // Vérifier si l'utilisateur est un client

      // Déterminer le genre de l'utilisateur
      const gender = user.gender as Gender;
      // Filtrer les données de mesure en fonction du genre
      const filteredMeasurementData = this.filterMeasurementsByGender(measurementData, gender);

      // Vérifier si des mesures existent déjà pour cet utilisateur
      const existingMeasurement = await prisma.mesure.findUnique({ where: { userId } });
      if (existingMeasurement) {
        // Mettre à jour les mesures existantes
        return prisma.mesure.update({
          where: { userId },
          data: filteredMeasurementData,
        });
      } else {
        // Créer de nouvelles mesures
        return prisma.mesure.create({
          data: { userId, ...filteredMeasurementData },
        });
      }
    } catch (error: any) {
      throw new Error(`Measurement creation/update failed: ${error.message}`); // Gestion des erreurs
    }
  }

  // Méthode pour récupérer les mesures d'un utilisateur par son ID
  static async getMeasurementByUserId(userId: number) {
    try {
      // Récupérer l'utilisateur en fonction de son ID
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found"); // Erreur si l'utilisateur n'existe pas

      // Déterminer le genre de l'utilisateur
      const gender = user.gender as Gender;

      // Récupérer les mesures associées à l'utilisateur
      const measurement = await prisma.mesure.findUnique({ where: { userId } });
      if (!measurement) throw new Error("Measurements not found for this user"); // Erreur si les mesures n'existent pas

      // Filtrer les mesures récupérées en fonction du genre
      const filteredMeasurement = this.filterMeasurementsByGender(measurement, gender);

      // Retourner les mesures filtrées
      return filteredMeasurement;
    } catch (error: any) {
      throw new Error(`Measurement retrieval failed: ${error.message}`); // Gestion des erreurs
    }
  }

  // Méthode pour supprimer les mesures d'un utilisateur par son ID
  static async deleteMeasurement(userId: number) {
    try {
      // Supprimer la mesure associée à l'utilisateur
      return await prisma.mesure.delete({
        where: { userId },
      });
    } catch (error: any) {
      throw new Error(`Failed to delete measurement: ${error.message}`); // Gestion des erreurs
    }
  }
}

// Exporter MeasurementService pour qu'il soit accessible ailleurs dans l'application
export default MeasurementService;
