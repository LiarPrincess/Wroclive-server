import { MPKVehicleLocationProvider } from './mpk/update-vehicle-locations';

(async () => {
  try {
    const provider = new MPKVehicleLocationProvider();
    const response = await provider.getVehicleLocations();

    for (const vehicle of response) {
      console.log(vehicle);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
