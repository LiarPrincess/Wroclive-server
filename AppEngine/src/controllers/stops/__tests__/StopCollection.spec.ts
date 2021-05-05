import { Stop, StopCollection } from '../models';

describe('calculateVehicleLocationUpdates', function () {

  it('properly serializes to JSON', function () {
    const timestamp = 'TIMESTAMP';
    const data = [
      new Stop('Code1', 'Name1', 1, 2),
      new Stop('Code2', 'Name2', 3, 4),
      new Stop('Code3', 'Name3', 5, 6)
    ];

    const collection = new StopCollection(timestamp, data);
    const json = JSON.stringify(collection);
    const expected = `{"timestamp":"TIMESTAMP","data":[{"code":"Code1","name":"Name1","lat":1,"lng":2},{"code":"Code2","name":"Name2","lat":3,"lng":4},{"code":"Code3","name":"Name3","lat":5,"lng":6}]}`;
    expect(json).toEqual(expected);
  });
});
