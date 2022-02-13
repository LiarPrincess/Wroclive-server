import { PushNotificationTokenControllerType } from './PushNotificationTokenControllerType';

class SaveArg {
  constructor(
    public readonly deviceId: string,
    public readonly token: string,
    public readonly platform: string
  ) { }
}

export class PushNotificationTokenControllerMock extends PushNotificationTokenControllerType {

  public saveArg: SaveArg | undefined;

  public async save(deviceId: string, token: string, platform: string) {
    this.saveArg = new SaveArg(deviceId, token, platform);
  }
}
