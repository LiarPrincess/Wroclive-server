import * as fs from '@google-cloud/firestore';

import { CloudPlatform } from './CloudPlatform';

/* ============= */
/* === Types === */
/* ============= */

export interface FirestoreLine {
  readonly name: string;
  readonly type: string;
  readonly subtype: string;
}

export interface FirestoreStop {
  readonly code: string;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
}

export interface Timestamped<T> {
  readonly timestamp: string;
  readonly data: T;
}

export type FirestoreAllLinesDocument = Timestamped<FirestoreLine[]>;
export type FirestoreAllStopsDocument = Timestamped<FirestoreStop[]>;

/* ================ */
/* === Database === */
/* ================ */

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

  private get linesCollectionRef(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('Lines');
  }

  private get allLinesDocumentRef(): fs.DocumentReference<any> {
    return this.linesCollectionRef.doc('all');
  }

  async getAllLines(): Promise<FirestoreAllLinesDocument> {
    const doc = await this.allLinesDocumentRef.get();
    const data = doc.data() as FirestoreAllLinesDocument;
    return data;
  }

  async saveAllLines(document: FirestoreAllLinesDocument): Promise<void> {
    await this.allLinesDocumentRef.set(document);
  }

  /* ----- */
  /* Stops */
  /* ----- */

  private get stopsCollectionRef(): fs.CollectionReference<fs.DocumentData> {
    return this.db.collection('Stops');
  }

  private get allStopsDocumentRef(): fs.DocumentReference<any> {
    return this.stopsCollectionRef.doc('all');
  }

  async getAllStops(): Promise<FirestoreAllStopsDocument> {
    const doc = await this.allStopsDocumentRef.get();
    const data = doc.data() as FirestoreAllStopsDocument;
    return data;
  }

  async saveAllStops(document: FirestoreAllStopsDocument): Promise<void> {
    await this.allStopsDocumentRef.set(document);
  }
}
