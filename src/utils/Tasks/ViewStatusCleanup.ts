import cron from 'node-cron';
import StatusService  from '../../services/statusService';

// Planifier la tâche pour s'exécuter toutes les 30 minutes
cron.schedule('0 * * * *', async () => {
    console.log(`Cron job exécuté à ${new Date().toISOString()}`);

  try {
    console.log('Exécution de la tâche pour supprimer les vues des statuts expirés...');
    await StatusService.deleteExpiredStatuses();
    console.log('Suppression des vues terminée.');
  } catch (error) {
    console.error('Erreur lors de la suppression des vues des statuts expirés :', error);
  }
});
