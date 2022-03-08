import { createReadStream } from 'fs';
import { finished } from 'stream/promises';

import { parse } from 'csv-parse';

export class CsvRow {
  public constructor(
    public readonly id: string,
    public readonly logName: string,
    public readonly timestamp: string,
    public readonly payload: {
      readonly text: string,
      readonly protoMethodName: string
    },
    public readonly projectId: string,
    public readonly appEngineInstance: string,
    public readonly appEngineZone: string,
    public readonly appEngineVersion: string
  ) { }
}

interface FileCsvRow {
  insertId: string;
  'labels.clone_id': string;
  logName: string;
  'operation.first': string;
  'operation.id': string;
  'operation.last': string;
  'operation.producer': string;
  'protoPayload.authenticationInfo.principalEmail': string;
  'protoPayload.authorizationInfo.granted': string;
  'protoPayload.authorizationInfo.permission': string;
  'protoPayload.authorizationInfo.resource': string;
  'protoPayload.authorizationInfo.resourceAttributes': string;
  'protoPayload.methodName': string;
  'protoPayload.requestMetadata.callerIp': string;
  'protoPayload.requestMetadata.destinationAttributes': string;
  'protoPayload.requestMetadata.requestAttributes.auth': string;
  'protoPayload.requestMetadata.requestAttributes.time': string;
  'protoPayload.resourceLocation.currentLocations': string;
  'protoPayload.resourceName': string;
  'protoPayload.serviceData': string;
  'protoPayload.serviceName': string;
  'protoPayload.status': string;
  receiveTimestamp: string;
  'resource.labels.module_id': string;
  'resource.labels.project_id': string;
  'resource.labels.version_id': string;
  'resource.labels.zone': string;
  'resource.type': string;
  severity: string;
  textPayload: string;
  timestamp: string;
}

export async function parseCsv(path: string): Promise<CsvRow[]> {
  const parser = createReadStream(path, { encoding: 'utf-8' })
    .pipe(parse({
      autoParse: false,
      autoParseDate: false,
      columns: true,
      delimiter: ',',
      trim: true
    }));

  const records: CsvRow[] = [];
  parser.on('readable', () => {
    let record: FileCsvRow;
    while ((record = parser.read()) !== null) {
      const resourceType = record['resource.type'];
      if (resourceType !== 'gae_app') {
        throw new Error(`Unexpected resource type '${resourceType}'. Only AppEngine entries ('gae_app') are supported.`);
      }

      const row = new CsvRow(
        record.insertId, // id
        record.logName, // logName
        record.timestamp, // timestamp
        {
          text: record.textPayload,
          protoMethodName: record['protoPayload.methodName']
        }, // payload
        record['resource.labels.project_id'], // projectId
        record['resource.labels.module_id'], // appEngineInstance
        record['resource.labels.zone'], // appEngineZone
        record['resource.labels.version_id'], // appEngineVersion
      );

      records.push(row);
    }
  });

  await finished(parser);
  return records;
}
