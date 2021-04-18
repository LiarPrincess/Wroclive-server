import { sleep, second } from './util';
import { MpkVehicleLocationProvider } from './mpk/update-vehicle-locations';

(async () => {
  try {
    const provider = new MpkVehicleLocationProvider();

    while (true) {
      const now = new Date();
      const response = await provider.getVehicleLocations(['A']);

      console.log(now.toISOString());
      for (const vehicle of response) {
        console.log(' ', vehicle);
      }

      await sleep(5 * second);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
