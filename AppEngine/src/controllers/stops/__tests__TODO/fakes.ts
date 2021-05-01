/*
export class FakeStopsProvider implements StopsProvider {

  data: Timestamped<Stop[]> = { timestamp: '', data: [] };
  callCount = 0;

  getStops(): Promise<Timestamped<Stop[]>> {
    this.callCount += 1;
    return Promise.resolve(this.data);
  }
}
*/
