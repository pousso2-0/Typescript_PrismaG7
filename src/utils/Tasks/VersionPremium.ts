import cron from 'node-cron';
import UserService  from '../../services/userService';

cron.schedule('0 0 * * *', async () => {
  console.log('Running daily job to check and update premium status for all users');
  try {
    const users = await UserService.getPremiumUsers();
    for (const user of users) {
      await UserService.checkAndUpdatePremiumStatus(user.id);
    }
    console.log('Premium status check completed.');
  } catch (error) {
    console.error('Error during premium status check:', error);
  }
});
