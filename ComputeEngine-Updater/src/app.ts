import { join, resolve } from 'path';
import { promises as fs } from 'fs';

import { LocalDatabase } from './local-database';
import { createLogger, isLocal, getRootDir } from './util';
import { downloadGTFS, uploadGTFSToLocalDatabase } from './gtfs';
import { FirestoreDatabase } from './cloud-platform';
import { Exporter, FileExporter, FirestoreExporter } from './exporters';
import { getAvailableLines as getAvailableLinesFromSchedule } from './wroclaw-pl-rozklad-jazdy';

(async function() {
  const logger = createLogger('CE-Updater');

  let db: LocalDatabase | undefined;
  try {
    const rootDir = await getRootDir();
    const dataDir = join(rootDir, 'data');

    logger.info('Starting data update');
    await ensureThatDirIsEmpty(dataDir);
    const gtfsFile = await downloadGTFS(dataDir, logger);

    const databaseFile = resolve(join(dataDir, 'database.db'));
    db = new LocalDatabase(databaseFile, logger);
    await uploadGTFSToLocalDatabase(db, gtfsFile, logger);

    // Sometimes (but often enough) GTFS file will not contain some lines.
    // We will use https://www.wroclaw.pl/rozklady-jazdy to add them.
    logger.info(`Getting line definitions from 'https://www.wroclaw.pl/rozklady-jazdy'`);
    const additionalLines = await getAvailableLinesFromSchedule();
    logger.info(`Found ${additionalLines.length} lines, merging them with GTFS lines`);
    await db.insertLinesSkippingDuplicates(additionalLines);

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

    logger.error('Error when running update:', error);
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
