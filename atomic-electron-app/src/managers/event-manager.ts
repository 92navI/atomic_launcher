import { TypedIpcMain } from '@shared/types/ipc-types';
import tryInstallLatest from './profile-manager';
import logger from '@shared/utils/logger';
import launchGame from '../launcher';

export default function initEventManager(ipc: TypedIpcMain): void {
  ipc.on('play', async () => {
    try {
      const profile = 'imperial';
      await tryInstallLatest(profile);
      await launchGame(profile);
      return { success: true };
    } catch (err) {
      logger.error(err);
      if (err instanceof Error) {
        logger.error(err.message);
        logger.error(err.stack);
        return { success: false, error: err.message };
      }
    }
  });
}
