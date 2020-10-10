import { join, resolve } from 'path';
import { promises as fs } from 'fs';

import { downloadGTFS, uploadGTFSToLocalDatabase } from './gtfs';
import { createLogger, isLocal, getRootDir } from './util';
import { LocalDatabase } from './local-database';
import { FirestoreDatabase } from './cloud-platform';
import { Exporter, FileExporter, FirestoreExporter } from './exporters';

(async function() {
  const logger = createLogger('CE-Updater');

  let db: LocalDatabase | undefined;
  try {
    const rootDir = await getRootDir();
    const dataDir = join(rootDir, 'data');
    const gtfsFile = join(dataDir, 'gtfs.zip');
    const databaseFile = resolve(join(dataDir, 'database.db'));

    logger.info('Starting data update');
    await ensureThatDirIsEmpty(dataDir);
    await downloadGTFS(gtfsFile, logger);

    db = new LocalDatabase(databaseFile, logger);
    await uploadGTFSToLocalDatabase(db, gtfsFile, logger);

    let exporter: Exporter;
    if (isLocal) {
      exporter = new FileExporter(dataDir, logger);
    } else {
      const firestoreDb = new FirestoreDatabase();
      exporter = new FirestoreExporter(firestoreDb, logger);
    }

    await exporter.exportData(db);
    logger.info('Update finished');
  } catch (error) {
    if (db) {
      await db.close();
    }

    logger.error('Error when running update', error);
  }
})();

async function ensureThatDirIsEmpty(dir: string): Promise<void> {
  try {
    const files = await fs.readdir(dir);
    for (const filename of files) {
      const file = join(dir, filename);
      await fs.unlink(file);
    }
  } catch (error) {
    if (error.code == 'ENOENT') {
      await fs.mkdir(dir, { recursive: true });
      return;
    }

    throw error;
  }
}
