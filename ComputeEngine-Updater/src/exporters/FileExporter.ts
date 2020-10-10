import { join } from 'path';
import { promises as fs } from 'fs';

import { Exporter } from './Exporter';
import { Logger } from '../util';
import { Line, Stop } from '../local-database';

export class FileExporter extends Exporter {

  private dir: string;

  constructor(dir: string, logger: Logger) {
    super(logger);
    this.dir = dir;
  }

  async exportLines(timestamp: string, lines: Line[]): Promise<void> {
    const file = join(this.dir, 'output_lines.txt');
    const content = this.createFileContent(timestamp, lines);
    await fs.writeFile(file, content, { encoding: 'utf-8' });
  }

  async exportStops(timestamp: string, stops: Stop[]): Promise<void> {
    const file = join(this.dir, 'output_stops.txt');
    const content = this.createFileContent(timestamp, stops);
    await fs.writeFile(file, content, { encoding: 'utf-8' });
  }

  createFileContent<Entry>(timestamp: string, entries: Entry[]): string {
    let result = `timestamp: ${timestamp}\n`;

    result += 'data:\n';
    for (const entry of entries) {
      const json = JSON.stringify(entry);
      result += json + '\n';
    }

    return result;
  }
}
