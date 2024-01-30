import { FirestoreDatabaseBase, VehicleIdToAngleData } from "../state";

export type DateProvider = () => Date;

export class Database extends FirestoreDatabaseBase {
  public async getLastVehicleAngleUpdateLocations(): Promise<VehicleIdToAngleData | undefined> {
    try {
      this.logger.info(`[Mpk] Getting last vehicle angle update locations.`);
      const result = await this.database.getMpkLastVehicleAngleUpdateLocations();
      return result?.data;
    } catch (error) {
      this.logger.error(`[Mpk] Failed to get last vehicle angle update locations.`, error);
      return undefined;
    }
  }

  public async saveLastVehicleAngleUpdateLocations(data: VehicleIdToAngleData): Promise<void> {
    try {
      const document = this.createAngleDocument(data);
      await this.database.saveMpkLastVehicleAngleUpdateLocations(document);
    } catch (error) {
      this.logger.error("[Mpk] Failed to store last vehicle angle update locations.", error);
    }
  }
}
