export interface FirestoreStop {
  readonly code: string;
  readonly name: string;
  readonly lat: number;
  readonly lng: number;
}

export interface FirestoreAllStopsDocument {
  readonly timestamp: string;
  readonly data: FirestoreStop[];
}

export interface FirestoreStopsDatabase {
  getAllStops(): Promise<FirestoreAllStopsDocument | undefined>;
}
