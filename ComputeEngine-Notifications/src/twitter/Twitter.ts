import OAuth, { Token as OAuthToken } from 'oauth-1.0a';
import crypto from 'crypto';
import { default as axios, AxiosResponse } from 'axios';

import { TwitterUser, GetTwitterUserResponse } from './TwitterUser';
import { Tweet, GetTweetsOptions, GetTweetsResponse } from './Tweet';

export type GetResult =
  { kind: 'Success', data: any } |
  { kind: 'Response with errors', response: AxiosResponse<any, any> } |
  { kind: 'Network error', error: any };

export class Twitter {

  private readonly oauth: OAuth;
  private readonly oauthToken: OAuthToken;

  public constructor(credentials: {
    consumerKey: string,
    consumerSecret: string,
    accessTokenKey: string,
    accessTokenSecret: string
  }) {
    this.oauth = new OAuth({
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

    this.oauthToken = {
      key: credentials.accessTokenKey,
      secret: credentials.accessTokenSecret
    };
  }

  /// https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
  public async getUserByUsername(username: string): Promise<GetTwitterUserResponse> {
    const url = `https://api.twitter.com/2/users/by/username/${username}`;
    const result = await this.get(url);

    switch (result.kind) {
      case 'Success':
        const responseData = result.data;

        const id = responseData.data.id;
        const name = responseData.data.name;
        const username = responseData.data.username;

        const isValid = this.isString(id) && this.isString(name) && this.isString(username);
        if (!isValid) {
          return { kind: 'Invalid response', response: responseData };
        }

        const user = new TwitterUser(id, name, username);
        return { kind: 'Success', user };

      case 'Response with errors':
        return { kind: 'Invalid response', response: result.response };

      case 'Network error':
        return { kind: 'Network error', error: result.error };
    }
  }

  /// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets
  public async getTweets(
    user: TwitterUser,
    options: GetTweetsOptions = {}
  ): Promise<GetTweetsResponse> {
    let url = `https://api.twitter.com/2/users/${user.id}/tweets?tweet.fields=id,conversation_id,created_at,text`;

    if (options.maxResults) {
      url += `&max_results=${options.maxResults}`;
    }

    if (options.excludeRetweets && options.excludeReplies) {
      url += '&exclude=retweets,replies';
    } else if (options.excludeRetweets) {
      url += '&exclude=retweets';
    } else if (options.excludeReplies) {
      url += '&exclude=replies';
    }

    if (options.pagination_token) {
      url += `&pagination_token=${options.pagination_token}`;
    }

    const result = await this.get(url);

    switch (result.kind) {
      case 'Success':
        const responseData = result.data;


        throw new Error("");

      case 'Response with errors':
        return { kind: 'Invalid response', response: result.response };

      case 'Network error':
        return { kind: 'Network error', error: result.error };
    }
  }

  private async get(url: string): Promise<GetResult> {
    const authorizationHeader = this.createAuthorizationHeader('get', url);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authorizationHeader
        }
      });

      const responseData = response.data;
      if (responseData.errors) {
        return { kind: 'Response with errors', response: responseData };
      }

      return { kind: 'Success', data: responseData };
    } catch (error) {
      return { kind: 'Network error', error };
    }
  }

  private createAuthorizationHeader(requestMethod: 'get' | 'POST', url: string): string {
    const oauthAuthorization = this.oauth.authorize(
      {
        url: url.toString(),
        method: requestMethod,
        data: undefined
      },
      this.oauthToken
    );

    const header = this.oauth.toHeader(oauthAuthorization);
    return header.Authorization;
  }

  private isString(o: any): boolean {
    return typeof o === 'string' || o instanceof String;
  }
}
