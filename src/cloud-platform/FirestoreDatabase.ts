import * as fs from '@google-cloud/firestore';

import { CloudPlatform } from './CloudPlatform';
import { Line, Stop, Timestamped } from '../mpk/models';

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

  private get linesCollection(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('Lines');
  }

  private get allLinesDocument(): fs.DocumentReference<any> {
    return this.linesCollection.doc('all');
  }

  async getAllLinesDocument(): Promise<Timestamped<Line[]>> {
    const doc = await this.allLinesDocument.get();
    const data =  doc.data() as Timestamped<Line[]>
    return data;
  }

  async setAllLinesDocument(timestamp: string, data: Line[]): Promise<void> {
    await this.allLinesDocument.set({ timestamp, data });
  }

  /* ----- */
  /* Stops */
  /* ----- */

  private get stopsCollection(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('Stops');
  }

  private get allStopsDocument(): fs.DocumentReference<any> {
    return this.stopsCollection.doc('all');
  }

  async getAllStopsDocument(): Promise<Timestamped<Stop[]>> {
    const doc = await this.allStopsDocument.get();
    const data =  doc.data() as Timestamped<Stop[]>
    return data;
  }

  async setAllStopsDocument(timestamp: string, data: Stop[]): Promise<void> {
    await this.allStopsDocument.set({ timestamp, data });
  }
}
