export interface FirestoreVehicleLocation {
  readonly lat: number;
  readonly lng: number;
}

export interface FirestoreVehicleLocationsDocument {
  readonly timestamp: string;
  readonly data: {
    [key: string]: FirestoreVehicleLocation | undefined;
  };
}

export interface FirestoreVehicleLocationsDatabase {
  getOpenDataVehicleLocations(): Promise<FirestoreVehicleLocationsDocument | undefined>;
  saveOpenDataVehicleLocations(document: FirestoreVehicleLocationsDocument): Promise<void>;

  getMpkVehicleLocations(): Promise<FirestoreVehicleLocationsDocument | undefined>;
  saveMpkVehicleLocations(document: FirestoreVehicleLocationsDocument): Promise<void>;
}
