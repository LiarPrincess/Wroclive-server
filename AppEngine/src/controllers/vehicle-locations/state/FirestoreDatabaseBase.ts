import { DatabaseType, VehicleIdToAngleData } from "./DatabaseType";
import { LineCollection, Line } from "../models";
import { Logger } from "../../../util";
import { FirestoreVehicleLocationsDatabase, FirestoreVehicleLocationsDocument } from "../../../cloud-platform";

export type DateProvider = () => Date;

export abstract class FirestoreDatabaseBase implements DatabaseType {
  protected readonly database: FirestoreVehicleLocationsDatabase;
  protected readonly logger: Logger;
  private readonly dateProvider: DateProvider;

  private lines: Line[] = [];

  public constructor(database: FirestoreVehicleLocationsDatabase, logger: Logger, dateProvider?: DateProvider) {
    this.database = database;
    this.logger = logger;
    this.dateProvider = dateProvider || (() => new Date());
  }

  public async getLines(): Promise<Line[]> {
    return this.lines;
  }

  public async setLines(lines: LineCollection): Promise<void> {
    this.lines = lines.data;
  }

  public abstract getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToAngleData | undefined>;
  public abstract saveLastVehicleAngleUpdateLocations(data: VehicleIdToAngleData): Promise<void>;

  protected createAngleDocument(data: VehicleIdToAngleData): FirestoreVehicleLocationsDocument {
    const now = this.dateProvider();
    const timestamp = now.toISOString();
    return { timestamp, data };
  }
}
