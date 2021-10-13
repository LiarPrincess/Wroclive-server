import { LineCollection } from '..';
import { LineLocationsCollection } from './models';
import { VehicleProvider } from './vehicle-providers';
import { DefaultVehicleFilter } from './vehicle-filters';
import { LineLocationsFactory } from './line-locations-factory';
import { VehicleLocationsController } from './VehicleLocationsController';

interface LineProvider {
  /**
   * Get all of the available lines.
   */
  getLines(): LineCollection;
}

export class VehicleLocationsControllerImpl extends VehicleLocationsController {

  private lineProvider: LineProvider;
  /// If provider returns no locations, then try the next one.
  private vehicleProviders: VehicleProvider[];
  private lineLocations: LineLocationsCollection;
  private lineLocationsFactory: LineLocationsFactory;

  /**
   * @param vehicleProviders If provider returns no locations, then try the next one.
   */
  constructor(
    lineProvider: LineProvider,
    vehicleProviders: VehicleProvider[]
  ) {
    super();

    this.lineProvider = lineProvider;
    this.vehicleProviders = vehicleProviders;
    this.lineLocations = {
      timestamp: this.createTimestamp(),
      data: []
    };

    const filter = new DefaultVehicleFilter();
    this.lineLocationsFactory = new LineLocationsFactory(filter);
  }

  getVehicleLocations(lineNamesLowerCase: Set<string>): LineLocationsCollection {
    const { timestamp, data } = this.lineLocations;
    const filteredLocations = data.filter(lineLoc =>
      lineNamesLowerCase.has(lineLoc.line.name.toLowerCase())
    );

    return new LineLocationsCollection(timestamp, filteredLocations);
  }

  async updateVehicleLocations(): Promise<void> {
    const lines = this.lineProvider.getLines();
    if (!lines || lines.data.length === 0) {
      return;
    }

    const timestamp = this.createTimestamp();
    const lineNames = lines.data.map(line => line.name);

    const errors: any[] = [];
    for (const provider of this.vehicleProviders) {
      try {
        const vehicles = await provider.getVehicles(lineNames);
        if (vehicles.length) {
          const lineLocations = this.lineLocationsFactory.create(lines, vehicles);
          this.lineLocations = new LineLocationsCollection(timestamp, lineLocations);
          return; // Do not check other providers
        }
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length) {
      throw new Error(`Failed to obtain current vehicle locations from all providers! Errors: ${errors}`);
    }

    throw new Error('Failed to obtain current vehicle locations from all providers! No errors.');
  }
}
