// const { describe, it } = require('mocha');
// const { assert } = require('../assert.js');
// const { filterByLine } = require('../../api/locations/filters');

// describe('Locations.Filters', function() {
//   describe('#filterByLine', function() {
//     const line1 = { name: 'line1', type: 'bus' };
//     const line2 = { name: 'line2', type: 'bus' };
//     const locations = [{ line: line1, data: 'a' }, { line: line2, data: 'b' }];

//     it('should work with empty locations', function() {
//       const result = filterByLine([], [line1, line2]);
//       assert(result.length === 0);
//     });

//     it('should work with empty lines', function() {
//       const result = filterByLine(locations, []);
//       assert(result.length === 0);
//     });

//     it('should find line', function() {
//       const result = filterByLine(locations, [line1]);
//       assert(result.length === 1);
//       assert(result[0].line.name === 'line1');
//       assert(result[0].line.type === 'bus');
//       assert(result[0].data === 'a');
//     });

//     it('should skip missing lines', function() {
//       const lines = [{ name: 'line3', type: 'bus' }, { name: 'line1', type: 'tram' }];
//       const result = filterByLine(locations, lines);
//       assert(result.length === 0);
//     });
//   });
// });
