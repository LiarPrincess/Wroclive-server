// const { describe, it } = require('mocha');
// const { assert, assertFloat } = require('../assert.js');
// const { isEqualStr } = require('../../api/helpers');
// const { createCheckpoint, parseResponse } = require('../../api/locations/response.js');

// describe('Locations.Response', function() {
//   describe('#createCheckpoint', function() {
//     const precision = 0.01;
//     const vehicleA = { vehicleId: 'a', lat: 5.0, lng: 5.0, angle: 15.0 };
//     const vehicleB = { vehicleId: 'b', lat: 0.0, lng: 0.0, angle:  0.0 };

//     it('should create new checkpoint if previous value not present', function() {
//       const checkpoint = createCheckpoint('a', 10.0, 15.0, [vehicleB]);
//       assert(isEqualStr(checkpoint.vehicleId, 'a'));
//       assertFloat(checkpoint.lat,  10.0, precision);
//       assertFloat(checkpoint.lng,  15.0, precision);
//       assertFloat(checkpoint.angle, 0.0, precision);
//     });

//     it('should use previous checkpoint if vehicle has not moved', function() {
//       const checkpoint = createCheckpoint('a', 5.0001, 5.0001, [vehicleA, vehicleB]);
//       assert(isEqualStr(checkpoint.vehicleId, 'a'));
//       assertFloat(checkpoint.lat,   vehicleA.lat, precision);
//       assertFloat(checkpoint.lng,   vehicleA.lng, precision);
//       assertFloat(checkpoint.angle, vehicleA.angle, precision);
//     });

//     it('should create new checkpoint if vehicle has moved', function() {
//       const checkpoint = createCheckpoint('a', 6.0, 6.0, [vehicleA, vehicleB]);
//       assert(isEqualStr(checkpoint.vehicleId, 'a'));
//       assertFloat(checkpoint.lat, 6.0, precision);
//       assertFloat(checkpoint.lng, 6.0, precision);
//       assertFloat(checkpoint.angle, 44.82, precision); // almost 45.0
//     });
//   });

//   describe('#parseResponse', function() {
//     it('should work', function(done) {
//       const lines = [{ name: 'line', type: 'bus' }];

//       const response = [
//         { k: 0, name: 'line', type: 'bus', x: 5.0, y: 10.0 }, // angle: 0.0
//         { k: 1, name: 'line', type: 'bus', x: 5.0, y: 10.0 }, // angle: previous
//         { k: 2, name: 'line', type: 'bus', x: 5.0, y: 10.0 }, // angle: calculated
//       ];

//       const checkpoints = [
//         { vehicleId: '1', lat: 5.0, lng: 10.0, angle: 45.0 },
//         { vehicleId: '2', lat: 5.0, lng: 15.0, angle: 45.0 },
//       ];

//       parseResponse(response, lines, checkpoints, (err, result) => {
//         const precision = 0.01;

//         assert(err === null);

//         // line locations
//         assert(result.lineLocations.length === 1);
//         assert(result.lineLocations[0].line === lines[0]);

//         const vehicle0 = result.lineLocations[0].vehicles[0];
//         assert(isEqualStr(vehicle0.id, '0'));
//         assertFloat(vehicle0.lat,   5.0, precision);
//         assertFloat(vehicle0.lng,  10.0, precision);
//         assertFloat(vehicle0.angle, 0.0, precision);

//         const vehicle1 = result.lineLocations[0].vehicles[1];
//         assert(isEqualStr(vehicle1.id, '1'));
//         assertFloat(vehicle1.lat,    5.0, precision);
//         assertFloat(vehicle1.lng,   10.0, precision);
//         assertFloat(vehicle1.angle, 45.0, precision);

//         const vehicle2 = result.lineLocations[0].vehicles[2];
//         assert(isEqualStr(vehicle2.id, '2'));
//         assertFloat(vehicle2.lat,     5.00, precision);
//         assertFloat(vehicle2.lng,    10.00, precision);
//         assertFloat(vehicle2.angle, -89.78, precision);

//         // checkpoints
//         const checkpoint0 = result.vehicleLocations[0];
//         assert(isEqualStr(checkpoint0.vehicleId, '0'));
//         assertFloat(checkpoint0.lat,   5.0, precision);
//         assertFloat(checkpoint0.lng,  10.0, precision);
//         assertFloat(checkpoint0.angle, 0.0, precision);

//         const checkpoint1 = result.vehicleLocations[1];
//         assert(isEqualStr(checkpoint1.vehicleId, '1'));
//         assertFloat(checkpoint1.lat,    5.0, precision);
//         assertFloat(checkpoint1.lng,   10.0, precision);
//         assertFloat(checkpoint1.angle, 45.0, precision);

//         const checkpoint2 = result.vehicleLocations[2];
//         assert(isEqualStr(checkpoint2.vehicleId, '2'));
//         assertFloat(checkpoint2.lat,     5.00,  precision);
//         assertFloat(checkpoint2.lng,    10.00,  precision);
//         assertFloat(checkpoint2.angle, -89.78, precision);

//         done();
//       });
//     });
//   });
// });
