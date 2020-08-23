import { MMPVehicleLocationProvider } from './mpk/vehicle-update';

(async () => {
  try {
    const provider = new MMPVehicleLocationProvider();
    const response = await provider.getVehicleLocations(['a', '4']);

    for (const vehicle of response) {
      console.log(vehicle);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
