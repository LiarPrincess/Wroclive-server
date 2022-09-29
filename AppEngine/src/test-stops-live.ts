import { getNextArrivals } from './controllers/stops-live/api';

const arkady = '10365';
const wiejska = '17104';

(async () => {
  try {
    const result = await getNextArrivals(wiejska);

    switch (result.kind) {
      case 'Success':
        const arrivals = result.arrivals;
        const invalidRecords = result.invalidRecords;

        if (arrivals.length) {
          console.log(`Arrivals:`);
          for (const a of result.arrivals) {
            console.log(`  ${a.time} | ${a.line} -> ${a.dir} | ac: ${a.ac}, lowFloor: ${a.lowFloor}`);
          }
        } else {
          console.log('No arrivals');
        }

        if (invalidRecords.length) {
          console.log(`Invalid records:`);

          for (const i of invalidRecords) {
            console.log(`  ${JSON.stringify(i)}`);
          }
        }
        break;

      case 'Error':
        console.log(result.error.message);
        break;
    }

  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
