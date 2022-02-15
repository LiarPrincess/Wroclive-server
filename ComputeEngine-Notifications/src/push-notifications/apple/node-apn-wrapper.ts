import { DeviceToken, SendResult, SendError } from './ApplePushNotificationsType';

const apn = require('@parse/node-apn');

export type Environment = 'development' | 'production';

// https://github.com/parse-community/node-apn/blob/master/doc/provider.markdown
export interface Options {
  /**
   *  Configuration for Provider Authentication Tokens.
   */
  readonly token: {
    /**
     * The filename of the provider token key (as supplied by Apple) to load from disk,
     * or a Buffer/String containing the key data.
     */
    readonly key: string;
    /**
     * The ID of the key issued by Apple.
     */
    readonly keyId: string;
    /**
     * ID of the team associated with the provider token key.
     */
    readonly teamId: string;
  };
  /**
   * Specifies which environment to connect to: Production or Sandbox.
   * The hostname will be set automatically.
   */
  readonly environment: Environment;
  readonly appBundle: string;
}

export interface Notification {
  /**
   * https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification
   */
  readonly aps: {
    readonly alert: {
      readonly title: string | undefined;
      readonly subtitle: string | undefined;
      readonly body: string | undefined;
    };
    readonly 'thread-id': string | undefined;
  };
  /**
   * This Object is JSON encoded and sent as the notification payload.
   * When properties have been set on notification.aps (either directly or with
   * convenience setters) these are added to the payload just before it is sent.
   * If payload already contains an aps property it is replaced.
   */
  readonly payload: any | undefined;
  // https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
  readonly pushType: 'alert';
}

interface APNProvider {
  send(notification: any, recipients: string[]): Promise<any>;
  shutdown(): void;
}

export class Provider {

  private readonly apnProvider: APNProvider;
  private readonly appBundle: string;

  public constructor(options: Options) {
    const apnOptions = {
      token: {
        key: options.token.key,
        keyId: options.token.keyId,
        teamId: options.token.teamId,
      },
      production: options.environment === 'production'
    };

    this.apnProvider = new apn.Provider(apnOptions);
    this.appBundle = options.appBundle;
  }

  public async send(notification: Notification, tokens: DeviceToken[]): Promise<SendResult> {
    const apnNotification = new apn.Notification();
    apnNotification.aps = notification.aps;
    apnNotification.topic = this.appBundle;
    apnNotification.pushType = notification.pushType;
    apnNotification.payload = notification.payload;

    const apnResult = await this.apnProvider.send(apnNotification, tokens);
    const delivered = this.parseSent(apnResult.sent) || ['PARSING_ERROR'];
    const failed = this.parseFailed(apn.failed) || [new SendError('PARSING_ERROR', JSON.stringify(apn.failed))];

    return new SendResult(delivered, failed);
  }

  private parseSent(sent: any): DeviceToken[] | undefined {
    // {
    //   sent: [{ device: "xxx" }],
    //   failed: [],
    // }

    try {
      const result: DeviceToken[] = [];
      for (const obj of sent) {
        if (Object.prototype.hasOwnProperty.call(obj, 'device')) {
          result.push(obj.device);
        } else {
          result.push(obj);
        }
      }

      return result;
    } catch (error) {
      return undefined;
    }
  }

  private parseFailed(failed: any): SendError[] | undefined {
    // {
    //   sent: [],
    //   failed: [
    //     { device: "xxx", status: 403, response: { reason: "InvalidProviderToken" } },
    //   ],
    // }

    try {
      // https://github.com/parse-community/node-apn/blob/master/doc/provider.markdown#failed
      const result: SendError[] = [];
      for (const obj of failed) {
        const device = obj.device;
        if (obj.error) {
          const reason = obj.error.message || JSON.stringify(obj.error);
          result.push(new SendError(device, reason));
        } else {
          const status = obj.status;
          const message = obj.response?.reason;
          const reason = `Status: '${status}', message: '${message}'`;
          result.push(new SendError(device, reason));
        }
      }

      return result;
    } catch (error) {
      return undefined;
    }
  }

  public shutdown() {
    this.apnProvider.shutdown();
  }
}
