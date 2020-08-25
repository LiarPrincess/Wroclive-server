import { join, resolve } from 'path';
import { promises as fs } from 'fs';

import { downloadGTFS, uploadGTFSToLocalDatabase } from './gtfs';
import { ConsoleLogger } from './util';
import { LocalDatabase } from './local-database';
import { Exporter, CsvExporter, FirestoreExporter } from './exporters';
import { FirestoreDatabase } from './cloud-platform';

(async function() {
  const logger =  new ConsoleLogger();
  const isLocal = process.argv.includes('run-local');

  let db: LocalDatabase | undefined;
  try {
    const dir = './data';
    const gtfsFile = join(dir, 'gtfs.zip');
    const databaseFile = resolve(join(dir, 'database.db'));

    logger.info('Starting data update');
    await ensureThatDirIsEmpty(dir);
    await downloadGTFS(gtfsFile, logger);

    db = new LocalDatabase(databaseFile, logger);
    await uploadGTFSToLocalDatabase(db, gtfsFile, logger);

    let exporter: Exporter;
    if (isLocal) {
      exporter = new CsvExporter(dir, logger);
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

    logger.error(error);
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
