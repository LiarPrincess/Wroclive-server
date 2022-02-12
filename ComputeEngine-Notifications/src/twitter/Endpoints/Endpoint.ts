import OAuth, { Token as OAuthToken } from 'oauth-1.0a';
import { default as axios, AxiosRequestConfig } from 'axios';

export type GetResult =
  { kind: 'Success', response: any } |
  { kind: 'Network error', error: any };

export class Endpoint {

  protected readonly oauth: OAuth;
  protected readonly oauthToken: OAuthToken;

  constructor(oauth: OAuth, oauthToken: OAuthToken) {
    this.oauth = oauth;
    this.oauthToken = oauthToken;
  }

  protected async get(url: string): Promise<GetResult> {
    const authorizationHeader = this.createAuthorizationHeader('get', url);
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: authorizationHeader
      }
    };

    // Try 2 times, just in case.
    try {
      const response = await axios.get(url, config);
      return { kind: 'Success', response: response.data };
    } catch (error) { }

    try {
      const response = await axios.get(url, config);
      return { kind: 'Success', response: response.data };
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

  protected isNumber(o: any): boolean {
    return Number.isFinite(o);
  }

  protected isString(o: any): boolean {
    return typeof o === 'string' || o instanceof String;
  }

  protected parseDate(o: any): Date | undefined {
    const isString = this.isString(o);
    if (!isString) {
      return undefined;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
    const millisecondsSince1970 = Date.parse(o);
    return Number.isNaN(millisecondsSince1970) ?
      undefined :
      new Date(millisecondsSince1970);
  }
}
