import { Line } from '../../lines';
import { VehicleLocationFromApi } from '../models';
import { DepotClassifier } from './DepotClassifier';
import { LineScheduleClassifier } from './LineScheduleClassifier';
import { HasMovedInLastFewMinutesClassifier } from './HasMovedInLastFewMinutesClassifier';

export {
  HasMovedInLastFewMinutesClassifier,
  HasMovedInLastFewMinutesClassifierType
} from './HasMovedInLastFewMinutesClassifier';

export interface VehicleClassifierType {
  prepareForClassification(): void;
  classify(line: Line, vehicle: VehicleLocationFromApi): VehicleClassification;
}

export class VehicleClassification {
  constructor(
    public readonly isInDepot: boolean,
    public readonly isWithinScheduleTimeFrame: boolean,
    public readonly hasMovedInLastFewMinutes: boolean,
  ) { }
}

export class VehicleClassifier implements VehicleClassifierType {

  private readonly depotClassifier = new DepotClassifier();
  private readonly lineScheduleClassifier = new LineScheduleClassifier();
  private readonly hasMovedInLastFewMinutesClassifier = new HasMovedInLastFewMinutesClassifier();

  prepareForClassification(): void {
    this.depotClassifier.prepareForClassification();
    this.lineScheduleClassifier.prepareForClassification();
    this.hasMovedInLastFewMinutesClassifier.prepareForClassification();
  }

  classify(line: Line, vehicle: VehicleLocationFromApi): VehicleClassification {
    const isInDepot = this.depotClassifier.isInDepot(vehicle);
    const isWithinScheduleTimeFrame = this.lineScheduleClassifier.isWithinScheduleTimeFrame(line);
    const hasMovedInLastFewMinutes = this.hasMovedInLastFewMinutesClassifier.hasMovedInLastFewMinutes(vehicle);

    return new VehicleClassification(
      isInDepot,
      isWithinScheduleTimeFrame,
      hasMovedInLastFewMinutes
    );
  }
}
