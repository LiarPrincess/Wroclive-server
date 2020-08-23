import { Line, Timestamped } from '../models';

export interface LineProvider {
  getLines(): Promise<Timestamped<Line[]>>;
}
