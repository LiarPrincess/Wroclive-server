import { Line } from '../models';

export interface LineProvider {
  getLines(): Promise<Line[]>;
}
