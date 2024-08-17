// src/controllers/ReportController.ts
import { Request, Response } from 'express';
import ReportService from '../services/reportService';

class ReportController {
  static async reportUser(req: Request, res: Response){
    try {
      const signalerId = req.userId as number; // Assurez-vous que userId est bien un nombre
      const { signaledId, reasons }: { signaledId: number; reasons: string } = req.body; // Assurez-vous que les données sont du bon type


      console.log("celui qui signaler id: " + signalerId);
      
      if (!signaledId || !reasons) {
        throw new Error('Missing required fields');
      }

      if (signalerId === signaledId) {
        throw new Error('You cannot report yourself');
      }
      console.log("raison dans le controller", req.body.reasons );
      

      const report = await ReportService.reportUser(signalerId,  req.body);

      res.status(201).json({ message: 'User reported successfully', report });
    } catch (error:any) {
      res.status(400).json({ message: `Failed to report user: ${error.message}` });
    }
  }
}

export default ReportController;
