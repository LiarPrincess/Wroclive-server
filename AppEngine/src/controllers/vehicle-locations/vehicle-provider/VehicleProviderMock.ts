import { VehicleProviderBase, VehicleLocations } from "./VehicleProviderBase";

export class VehicleProviderMock extends VehicleProviderBase {
  result: VehicleLocations | undefined;

  getVehicleLocations(): Promise<VehicleLocations> {
    if (this.result) {
      return Promise.resolve(this.result);
    }

    throw new Error("'getVehicleLocations' was not expected to be called.");
  }
}
