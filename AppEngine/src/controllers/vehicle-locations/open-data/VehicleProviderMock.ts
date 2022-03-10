import { VehicleProviderType, VehicleLocations } from './VehicleProviderType';

export class VehicleProviderMock implements VehicleProviderType {

  result: VehicleLocations | undefined;

  getVehicleLocations(): Promise<VehicleLocations> {
    if (this.result) {
      return Promise.resolve(this.result);
    }

    throw new Error("'OpenDataProvider.getVehicleLocations' was not expected to be called.");
  }
}
