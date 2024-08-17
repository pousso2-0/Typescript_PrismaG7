// src/controllers/MesureController.ts
import { Request, Response } from 'express';
import MeasurementService from '../services/mesureService';
import { Measurement } from '../Interfaces/UserInterface'; // Importez les types nécessaires

class MesureController {
  static async createOrUpdateMesure(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number; // Assurez-vous que userId est bien un nombre
      const mesureData: Measurement = req.body; // Assurez-vous que les données sont du bon type
      
      const mesure = await MeasurementService.createOrUpdateMeasurement(userId, mesureData);
      res.status(201).json(mesure);
    } catch (error:any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getMesure(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number; // Assurez-vous que userId est bien un nombre
      const mesure = await MeasurementService.getMeasurementByUserId(userId);
      res.json(mesure);
    } catch (error:any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async deleteMesure(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId as number; // Assurez-vous que userId est bien un nombre
      const result = await MeasurementService.deleteMeasurement(userId);
      res.json(result);
    } catch (error:any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default MesureController;
