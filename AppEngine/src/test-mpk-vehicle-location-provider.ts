import { MpkVehicleLocationProvider } from './mpk/update-vehicle-locations';

(async () => {
  try {
    const provider = new MpkVehicleLocationProvider();
    const response = await provider.getVehicleLocations(['A', '4']);

    for (const vehicle of response) {
      console.log(vehicle);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
