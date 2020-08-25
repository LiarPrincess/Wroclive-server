import * as fs from '@google-cloud/firestore';

import { CloudPlatform } from './CloudPlatform';
import { Line, Stop } from '../models';

export class FirestoreDatabase {

  private db: fs.Firestore;

  constructor() {
    this.db = new fs.Firestore({
      projectId: CloudPlatform.projectId(),
      keyFilename: CloudPlatform.credentialsFile()
    });
  }

  /* ----- */
  /* Lines */
  /* ----- */

  get linesCollection(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('Lines');
  }

  get allLinesDocument(): fs.DocumentReference<any> {
    return this.linesCollection.doc('all');
  }

  async setAllLinesDocument(timestamp: string, data: Line[]): Promise<void> {
    await this.allLinesDocument.set({ timestamp, data });
  }

  /* ----- */
  /* Stops */
  /* ----- */

  get stopsCollection(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('Stops');
  }

  get allStopsDocument(): fs.DocumentReference<any> {
    return this.stopsCollection.doc('all');
  }

  async setAllStopsDocument(timestamp: string, data: Stop[]): Promise<void> {
    await this.allStopsDocument.set({ timestamp, data });
  }
}
