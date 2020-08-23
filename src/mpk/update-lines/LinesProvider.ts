import { Line, Timestamped } from '../models';

export interface LinesProvider {
  getLines(): Promise<Timestamped<Line[]>>;
}
