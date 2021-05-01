import { sleep } from './util';
import { OpenDataVehicleProvider } from './controllers';

const second = 1000;

(async () => {
  try {
    const provider = new OpenDataVehicleProvider();

    while (true) {
      const now = new Date();
      const response = await provider.getVehicles([]);

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
