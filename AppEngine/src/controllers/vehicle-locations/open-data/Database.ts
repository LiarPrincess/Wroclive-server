import { FirestoreDatabaseBase, VehicleIdToAngleData } from "../state";

export type DateProvider = () => Date;

export class Database extends FirestoreDatabaseBase {
  public async getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToAngleData | undefined> {
    try {
      this.logger.info(`[Open data] Getting last vehicle angle update locations.`);
      const document = await this.database.getOpenDataLastVehicleAngleUpdateLocations();
      return document?.data;
    } catch (error) {
      this.logger.error(`[Open data] Failed to get last vehicle angle update locations.`, error);
      return undefined;
    }
  }

  public async saveLastVehicleAngleUpdateLocations(data: VehicleIdToAngleData): Promise<void> {
    try {
      const document = this.createAngleDocument(data);
      await this.database.saveOpenDataLastVehicleAngleUpdateLocations(document);
    } catch (error) {
      this.logger.error("[Open data] Failed to store last vehicle angle update locations.", error);
    }
  }
}
