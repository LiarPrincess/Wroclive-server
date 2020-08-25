import { join } from 'path';
import { promises as fs } from 'fs';

import { Exporter } from './Exporter';
import { Logger } from '../util';
import { Line, Stop } from '../models';

export class CsvExporter extends Exporter {

  private dir: string;

  constructor(dir: string, logger: Logger) {
    super(logger);
    this.dir = dir;
  }

  async exportLines(timestamp: string, lines: Line[]): Promise<void> {
    let data = timestamp + '\n';
    for (const line of lines) {
      data += `${line.name};${line.type};${line.subtype}\n`;
    }

    const file = join(this.dir, 'output_lines.csv');
    await fs.writeFile(file, data, { encoding: 'utf-8' });
  }

  async exportStops(timestamp: string, stops: Stop[]): Promise<void> {
    let data = timestamp + '\n';
    for (const stop of stops) {
      data += `${stop.code};${stop.name};${stop.lat};${stop.lon}\n`;
    }

    const file = join(this.dir, 'output_stops.csv');
    await fs.writeFile(file, data, { encoding: 'utf-8' });
  }
}
