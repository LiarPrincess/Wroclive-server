import { TimestampedLines } from '..';
import { TimestampedLineLocations } from './models';
import { VehicleProvider } from './vehicle-providers';
import { DefaultVehicleFilter } from './vehicle-filters';
import { LineLocationsFactory } from './line-locations-factory';
import { VehicleLocationsController } from './VehicleLocationsController';

interface LineProvider {
  /**
   * Get all of the available lines.
   */
  getLines(): TimestampedLines;
}

export class VehicleLocationsControllerImpl extends VehicleLocationsController {

  private lineProvider: LineProvider;
  /// If provider returns no locations, then try the next one.
  private vehicleProviders: VehicleProvider[];
  private lineLocations: TimestampedLineLocations;
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

  getVehicleLocations(lineNamesLowerCase: Set<string>): TimestampedLineLocations {
    const { timestamp, data } = this.lineLocations;
    const filteredLocations = data.filter(lineLoc =>
      lineNamesLowerCase.has(lineLoc.line.name.toLowerCase())
    );

    return { timestamp, data: filteredLocations };
  }

  async updateVehicleLocations(): Promise<void> {
    const lines = this.lineProvider.getLines();
    if (!lines || lines.data.length === 0) {
      return;
    }

    const ts = this.createTimestamp();
    const lineNames = lines.data.map(line => line.name);

    for (const provider of this.vehicleProviders) {
      const vehicles = await provider.getVehicles(lineNames);
      const hasResponse = vehicles.length;

      if (hasResponse) {
        const lineLocations = this.lineLocationsFactory.create(lines, vehicles);
        this.lineLocations = { timestamp: ts, data: lineLocations };
        return; // Do not check other providers
      }
    }

    throw new Error('Failed to obtain current vehicle locations from all providers!');
  }
}
