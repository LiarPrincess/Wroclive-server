import OAuth, { Token as OAuthToken } from "oauth-1.0a";
import { default as axios, AxiosRequestConfig } from "axios";

export class NetworkError {
  constructor(public readonly message: string, public readonly data: any) {}
}

export type GetResult = { kind: "Success"; response: any } | { kind: "Network error"; error: NetworkError };

export class Endpoint {
  protected readonly oauth: OAuth;
  protected readonly oauthToken: OAuthToken;

  public constructor(oauth: OAuth, oauthToken: OAuthToken) {
    this.oauth = oauth;
    this.oauthToken = oauthToken;
  }

  protected async get(url: string): Promise<GetResult> {
    const authorizationHeader = this.createAuthorizationHeader("GET", url);
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: authorizationHeader,
      },
    };

    // Try 2 times, just in case.
    try {
      const response = await axios.get(url, config);
      return { kind: "Success", response: response.data };
    } catch (error) {}

    try {
      const response = await axios.get(url, config);
      return { kind: "Success", response: response.data };
    } catch (axiosError) {
      const statusCode = this.getStatusCode(axiosError);
      const message = statusCode ? `Response with status: ${statusCode}.` : `Unknown request error.`;

      const error = new NetworkError(message, axiosError);
      return { kind: "Network error", error };
    }
  }

  private createAuthorizationHeader(requestMethod: "GET" | "POST", url: string): string {
    const oauthAuthorization = this.oauth.authorize(
      {
        url: url.toString(),
        method: requestMethod,
        data: undefined,
      },
      this.oauthToken
    );

    const header = this.oauth.toHeader(oauthAuthorization);
    return header.Authorization;
  }

  private getStatusCode(error: any): string | undefined {
    return error.statusCode || (error.response && error.response.status);
  }
}

export function isString(o: any): boolean {
  return typeof o === "string" || o instanceof String;
}

export function parseDate(o: any): Date | undefined {
  const argIsString = isString(o);
  if (!argIsString) {
    return undefined;
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
  const millisecondsSince1970 = Date.parse(o);
  return Number.isNaN(millisecondsSince1970) ? undefined : new Date(millisecondsSince1970);
}
