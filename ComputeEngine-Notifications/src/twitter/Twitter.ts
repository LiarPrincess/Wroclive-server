import crypto from 'crypto';
import OAuth, { Token as OAuthToken } from 'oauth-1.0a';

import {
  User,
  GetUserEndpoint,
  GetUserResponse,
  Tweet,
  GetTweetsEndpoint,
  GetTweetsOptions,
  GetTweetsResponse
} from './Endpoints';

export class Twitter {

  private readonly getUserEndpoint: GetUserEndpoint;
  private readonly getTweetsEndpoint: GetTweetsEndpoint;

  public constructor(credentials: {
    consumerKey: string,
    consumerSecret: string,
    accessTokenKey: string,
    accessTokenSecret: string
  }) {
    const oauth = new OAuth({
      consumer: {
        key: credentials.consumerKey,
        secret: credentials.consumerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });

    const oauthToken: OAuthToken = {
      key: credentials.accessTokenKey,
      secret: credentials.accessTokenSecret
    };

    this.getUserEndpoint = new GetUserEndpoint(oauth, oauthToken);
    this.getTweetsEndpoint = new GetTweetsEndpoint(oauth, oauthToken);
  }

  public async getUser(username: string): Promise<GetUserResponse> {
    const result = await this.getUserEndpoint.call(username);
    return result;
  }

  public async getTweets(user: User, options?: GetTweetsOptions): Promise<GetTweetsResponse> {
    const result = await this.getTweetsEndpoint.call(user, options);
    return result;
  }
}
