export interface FirestoreVehicleLocation {
  readonly lat: number;
  readonly lng: number;
  readonly angle: number;
}

export interface FirestoreVehicleLocationsDocument {
  readonly timestamp: string;
  readonly data: {
    [key: string]: FirestoreVehicleLocation | undefined;
  };
}

export interface FirestoreVehicleLocationsDatabase {
  getOpenDataLastVehicleAngleUpdateLocations(): Promise<FirestoreVehicleLocationsDocument | undefined>;
  saveOpenDataLastVehicleAngleUpdateLocations(document: FirestoreVehicleLocationsDocument): Promise<void>;

  getMpkLastVehicleAngleUpdateLocations(): Promise<FirestoreVehicleLocationsDocument | undefined>;
  saveMpkLastVehicleAngleUpdateLocations(document: FirestoreVehicleLocationsDocument): Promise<void>;
}
