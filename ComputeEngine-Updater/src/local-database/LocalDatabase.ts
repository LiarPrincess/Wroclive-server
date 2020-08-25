import { EOL } from 'os';
import { resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Database as SQLiteDatabase, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';

import { Logger } from '../util';

export interface Query {
  readonly sql: string;
  readonly params: any;
}

export class LocalDatabase {

  private path: string;
  private database?: SQLiteDatabase;
  private logger: Logger;

  constructor(path: string, logger: Logger) {
    this.path = path;
    this.logger = logger;
  }

  async first(query: Query): Promise<any> {
    const db = await this.openIfNeeded();
    const inner = (cb: (err: Error | null, row: any) => void) => db.get(query.sql, query.params, cb);
    return promisify(inner)();
  }

  async all(query: Query): Promise<any[]> {
    const db = await this.openIfNeeded();
    const inner = (cb: (err: Error | null, rows: any[]) => void) => db.all(query.sql, query.params, cb);
    return promisify(inner)();
  }

  async exec(query: Query): Promise<any> {
    const db = await this.openIfNeeded();
    const inner = (cb: (err: Error | null, row: any) => void) => db.run(query.sql, query.params, cb);
    return promisify(inner)();
  }

  async execFile(file: string): Promise<any> {
    const cmd = `echo .read '${file}'`;
    return await this.executeCommandLine(cmd);
  }

  async importCsv(csvPath: string, table: string): Promise<string> {
    const cmd = `echo .separator ,; echo .import '${csvPath}' ${table}`;
    return await this.executeCommandLine(cmd);
  }

  private openIfNeeded(): Promise<SQLiteDatabase> {
    if (!!this.database) {
      return Promise.resolve(this.database);
    }

    const absolutePath = resolve(this.path);
    this.logger.info(`Creating database at: '${absolutePath}'`);
    return new Promise((resolve, reject) => {
      this.database = new SQLiteDatabase(absolutePath, OPEN_CREATE | OPEN_READWRITE, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(this.database);
      });
    });
  }

  private async executeCommandLine(command: string): Promise<string> {
    let { stdout, stderr } = await promisify(exec)(`(${command}) | sqlite3 '${this.path}'`);

    stdout = stdout.trim();
    stderr = stderr.trim();

    if (!!stderr)
      throw new Error(stdout ? stdout + EOL + stderr : stderr);

    return stdout || '';
  }

  async close(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (this.database) {
          this.database.close(err => {
            if (err) {
              return reject(err);
            }
            return resolve();
          });
        } else {
          resolve();
        }
    });
  }
}
