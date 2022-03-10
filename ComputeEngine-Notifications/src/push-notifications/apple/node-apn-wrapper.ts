import * as apn from '@parse/node-apn';

import { DeviceToken, SendResult, SendError } from './ApplePushNotificationsType';

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

export class Provider {

  private readonly apnProvider: apn.Provider;
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
    const result = parseResult(apnResult);
    return result;
  }

  public shutdown() {
    this.apnProvider.shutdown();
  }
}

export function parseResult(result: apn.Responses): SendResult {
  let delivered = parseSent(result.sent);
  if (delivered === undefined) {
    delivered = ['PARSING_ERROR'];
  }

  let failed = parseFailed(result.failed);
  if (failed === undefined) {
    failed = [new SendError('PARSING_ERROR', JSON.stringify(result.failed))];
  }

  return new SendResult(delivered, failed);
}

function parseSent(sentResponses: apn.ResponseSent[]): DeviceToken[] | undefined {
  // {
  //   sent: [{ device: "xxx" }],
  //   failed: [],
  // }

  const result: DeviceToken[] = [];
  for (const response of sentResponses) {
    const deviceToken = response.device;

    if (deviceToken !== undefined) {
      result.push(deviceToken);
    } else {
      const json = JSON.stringify(response);
      result.push(json);
    }
  }

  return result;
}

function parseFailed(failedResponses: apn.ResponseFailure[]): SendError[] | undefined {
  // {
  //   sent: [],
  //   failed: [
  //     { device: "xxx", status: 403, response: { reason: "InvalidProviderToken" } },
  //   ],
  // }

  const result: SendError[] = [];
  for (const response of failedResponses) {
    try {
      // https://github.com/parse-community/node-apn/blob/master/doc/provider.markdown#failed
      const deviceToken = response.device;

      if (response.error) {
        const reason = response.error?.message || JSON.stringify(response.error);
        result.push(new SendError(deviceToken, reason));
      } else {
        const status = response.status;
        const message = response.response?.reason;

        const isAnyUndefined = status === undefined || message === undefined;
        const reason = isAnyUndefined ?
          JSON.stringify(response) :
          `Status: '${status}', message: '${message}'`;

        result.push(new SendError(deviceToken, reason));
      }
    } catch (error) {
      return undefined;
    }
  }

  return result;
}
