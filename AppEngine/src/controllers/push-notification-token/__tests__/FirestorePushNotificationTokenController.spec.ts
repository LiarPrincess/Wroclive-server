import { FirestorePushNotificationTokenController } from '../FirestorePushNotificationTokenController';
import { FirestorePushNotificationToken, FirestorePushNotificationTokenDatabase } from '../../../cloud-platform';

let date: Date = new Date(0);

function getDateMock(): Date {
  return date;
}

class FirestorePushNotificationTokenDatabaseMock implements FirestorePushNotificationTokenDatabase {

  appleToken: FirestorePushNotificationToken | undefined;

  async saveApplePushNotificationToken(token: FirestorePushNotificationToken): Promise<void> {
    this.appleToken = token;
  }
}

describe('FirestorePushNotificationTokenController', function () {

  it('iOS', async function () {
    const db = new FirestorePushNotificationTokenDatabaseMock();
    const controller = new FirestorePushNotificationTokenController(db, getDateMock);

    const platforms = ['iOS', 'ios'];
    for (let index = 0; index < platforms.length; index++) {
      const deviceId = `DEVICE_ID_${index}`;
      const token = `TOKEN_VALUE_${index}`;
      const platform = platforms[index];

      date = new Date(42 + index);
      await controller.save(deviceId, token, platform);
      expect(db.appleToken).toEqual({ deviceId, token, createdAt: date });
    }
  });

  it('android', async function () {
    const db = new FirestorePushNotificationTokenDatabaseMock();
    const controller = new FirestorePushNotificationTokenController(db, getDateMock);

    const platforms = ['Android', 'android'];
    for (let index = 0; index < platforms.length; index++) {
      const deviceId = `DEVICE_ID_${index}`;
      const token = `TOKEN_VALUE_${index}`;
      const platform = platforms[index];

      date = new Date(42 + index);
      await controller.save(deviceId, token, platform);
      expect(db.appleToken).toBeUndefined();
    }
  });
});
