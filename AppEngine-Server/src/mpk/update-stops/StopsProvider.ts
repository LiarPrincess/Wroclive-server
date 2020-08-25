import { Stop, Timestamped } from '../models';

export interface StopsProvider {
  getStops(): Promise<Timestamped<Stop[]>>;
}
