import { StopsController } from './stops';
import { Mpk } from '../mpk';

export * from './stops';

export interface Controllers {
  readonly mpk: Mpk;
  readonly stops: StopsController;
}
