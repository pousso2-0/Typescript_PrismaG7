// src/services/MeasurementService.ts

import { PrismaClient } from '@prisma/client';
import { MeasurementKey , Measurement , Gender } from '../Interfaces/UserInterface';

// Définir un type pour les genres

const prisma = new PrismaClient();
class MeasurementService {
    private static allowedMeasurementsByGender: Record<Gender, MeasurementKey[]> = {
      male: ['taille', 'tourTaille', 'largeurEpaules', 'tourCuisse', 'tourBras'],
      female: ['taille', 'tourPoitrine', 'tourHanche', 'tourBras'],
    };
  
    private static filterMeasurementsByGender(
        measurements: Measurement,
        gender: Gender
      ): Measurement {
        const allowedMeasurements = this.allowedMeasurementsByGender[gender];
        console.log("Type de mesures pour ce genre:", allowedMeasurements);
        
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
      
        return filtered as Measurement;
      }
      
  
    // Exemple de fonction pour créer ou mettre à jour une mesure
    static async createOrUpdateMeasurement(userId: number, measurementData: Measurement) {
      try {

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        if (user.type !== 'CLIENT') throw new Error("Only clients can enter measurements");
        
  
        const gender = user.gender as Gender;
        const filteredMeasurementData = this.filterMeasurementsByGender(measurementData, gender);

  
        const existingMeasurement = await prisma.mesure.findUnique({ where: { userId } });
        if (existingMeasurement) {
          return prisma.mesure.update({
            where: { userId },
            data: filteredMeasurementData,
          });
        } else {
          return prisma.mesure.create({
            data: { userId, ...filteredMeasurementData },
          });
        }
      } catch (error: any) {
        throw new Error(`Measurement creation/update failed: ${error.message}`);
      }
    }

  // Récupérer une mesure par ID utilisateur
  static async getMeasurementByUserId(userId: number) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      const gender = user.gender as Gender; // Assurez-vous que gender est bien 'male' ou 'female'

      const measurement = await prisma.mesure.findUnique({ where: { userId } });
      if (!measurement) throw new Error("Measurements not found for this user");

      const filteredMeasurement = this.filterMeasurementsByGender(measurement, gender);

      return filteredMeasurement;
    } catch (error:any) {
      throw new Error(`Measurement retrieval failed: ${error.message}`);
    }
  }
  static async deleteMeasurement(userId: number) {
    try {
      // Supprimer la mesure associée à l'utilisateur
      return await prisma.mesure.delete({
        where: { userId },
      });
    } catch (error:any) {
      throw new Error(`Failed to delete measurement: ${error.message}`);
    }
  }
}

export default MeasurementService ;