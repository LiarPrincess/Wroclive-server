import { LinesControllerType } from './lines';
import { StopsControllerType } from './stops';
import { VehicleLocationsControllerType } from './vehicle-locations';
import { PushNotificationTokenControllerType } from './push-notification-token';
import { NotificationsControllerType } from './notifications';

export class Controllers {
  constructor(
    public readonly lines: LinesControllerType,
    public readonly stops: StopsControllerType,
    public readonly vehicleLocation: VehicleLocationsControllerType,
    public readonly notifications: NotificationsControllerType,
    public readonly pushNotificationToken: PushNotificationTokenControllerType
  ) { }
}
