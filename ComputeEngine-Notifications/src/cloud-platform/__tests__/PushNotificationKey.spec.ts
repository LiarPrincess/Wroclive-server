import {
  createPushNotificationKey,
  getPushNotificationIdFromKey
} from '../FirestoreDatabase';

describe('PushNotificationKey', () => {

  it('key without 0 padding', async () => {
    const id = '1491029797811548168';
    const date = '2020-10-11T13:54:28.999Z';

    const key = createPushNotificationKey(id, date);
    expect(key).toEqual('201011_1354_1491029797811548168');

    const idResult = getPushNotificationIdFromKey(key);
    expect(idResult).toEqual(id);
  });

  it('key with 0 padding', async () => {
    const id = '1491029797811548167';
    const date = '2022-01-02T03:04:05.999Z';

    const key = createPushNotificationKey(id, date);
    expect(key).toEqual('220102_0304_1491029797811548167');

    const idResult = getPushNotificationIdFromKey(key);
    expect(idResult).toEqual(id);
  });
});
