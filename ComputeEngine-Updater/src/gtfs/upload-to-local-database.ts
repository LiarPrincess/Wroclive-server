import extract from 'extract-zip';
import { promises as fs } from 'fs';
import { join, resolve, parse, dirname } from 'path';

import { Logger } from '../util';
import { LocalDatabase } from '../local-database';

/**
 * Upload all of the GTFS files to SQLite database.
 */
export async function uploadGTFSToLocalDatabase(db: LocalDatabase, gtfsFile: string, logger: Logger): Promise<void> {
  logger.info('Extracting gtfs file');
  const dir = dirname(gtfsFile);
  const dirAbsolute = resolve(dir);
  await extract(gtfsFile, { dir: dirAbsolute });

  const gtfsFiles = await listGtfsFiles(dir);

  logger.info('Removing old data from database');
  for (const file of gtfsFiles) {
    const tableName = toTableName(file);
    await db.dropTable(tableName);
  }

  logger.info('Uploading new GTFS data to database');
  for (const file of gtfsFiles) {
    const tableName = toTableName(file);
    await db.importCsv(file, tableName);
  }

  logger.info('Creating final tables');
  await db.executeMpkCreateSchemaScript();

  logger.info('Filling final tables');
  await db.executeMpkProcessGTFSScript();
}

async function listGtfsFiles(gtfsDir: string): Promise<string[]> {
  const files = await fs.readdir(gtfsDir);
  return files
    .filter(f => f.endsWith('txt'))
    .map(f => join(gtfsDir, f));
}

function toTableName(gtfsFilePath: string) {
  const file = parse(gtfsFilePath);
  return 'gtfs_' + file.name;
}
