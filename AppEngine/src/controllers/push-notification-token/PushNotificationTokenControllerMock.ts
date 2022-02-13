import {
  SaveResult,
  PushNotificationTokenControllerType
} from './PushNotificationTokenControllerType';

class SaveArg {
  constructor(
    public readonly deviceId: string,
    public readonly token: string,
    public readonly platform: string
  ) { }
}

export class PushNotificationTokenControllerMock extends PushNotificationTokenControllerType {

  public saveResult: SaveResult = { kind: 'Success' };
  public saveArg: SaveArg | undefined;

  public async save(deviceId: string, token: string, platform: string): Promise<SaveResult> {
    this.saveArg = new SaveArg(deviceId, token, platform);
    return this.saveResult;
  }
}
