import { basename, extname, join } from 'path';

import { Event, EventKind } from './Event';
import { CsvRow, parseCsv } from './parse-csv';
import { calculateDowntime } from './calculate-downtime';
import { writeReport } from './write-report';

export async function writeAppEngineLifeCycleReport(inputPath: string, outputDirPath: string) {
  console.log(`=== AppEngine life-cycle report ===`);

  console.log(`Reading: ${inputPath}`);
  const rows = await parseCsv(inputPath);
  console.log(`Found ${rows.length} rows`);
  const events = getEvents(rows);

  const downtimes = calculateDowntime(events);

  const inputName = basename(inputPath);
  const inputExtension = extname(inputPath);
  const outputName = inputName.replace(inputExtension, '.md');
  const outputPath = join(outputDirPath, outputName);
  console.log(`Writing output to: ${outputPath}`);

  await writeReport(events, downtimes, outputPath);
  console.log(`Finished`);
}

function getEvents(rows: CsvRow[]): Event[] {
  const result: Event[] = [];

  for (const row of rows) {
    const id = row.id;
    const kind = getEventKind(row);
    const date = new Date(row.timestamp);

    const event = new Event(id, kind, date);
    result.push(event);
  }

  return result;
}

function getEventKind(row: CsvRow): EventKind {
  const payload = row.payload;

  const protoMethodName = payload.protoMethodName;
  if (protoMethodName === 'google.appengine.v1.Versions.CreateVersion') {
    return 'Create version';
  }

  const text = payload.text;
  if (text.endsWith('Starting app')) {
    return 'Starting app';
  }

  if (text.endsWith('Quitting on terminated signal')) {
    return 'Quitting on terminated signal';
  }

  throw new Error(`Unable to parse event from '${text}' and '${protoMethodName}'.`);
}
