import { Mpk } from '../mpk';
import { LinesController } from './lines';
import { StopsController } from './stops';

export * from './lines';
export * from './stops';

export interface Controllers {
  readonly mpk: Mpk;
  readonly lines: LinesController;
  readonly stops: StopsController;
}
