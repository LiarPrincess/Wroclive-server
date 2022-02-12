import { User } from './GetUserEndpoint';
import { Endpoint, NetworkError } from './Endpoint';

export class Tweet {
  public constructor(
    public readonly id: string,
    /**
     * Parent tweet id.
     *
     * It is the same as 'this.id' if there is no parent.
     */
    public readonly conversationId: string,
    public readonly createdAt: Date,
    public readonly text: string
  ) { }
}

export interface GetTweetsOptions {
  readonly maxResults?: number;
  readonly excludeRetweets?: boolean;
  readonly excludeReplies?: boolean;
  readonly pagination_token?: string;
}

export type GetTweetsResponse =
  { kind: 'Success', tweets: Tweet[], nextPageToken: string } |
  { kind: 'Response with errors', errors: any[] } |
  { kind: 'Invalid response', response: any } |
  { kind: 'Network error', error: NetworkError };

/// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets
export class GetTweetsEndpoint extends Endpoint {

  public async call(user: User, options: GetTweetsOptions): Promise<GetTweetsResponse> {
    const url = this.createUrl(user, options);
    const result = await this.get(url);

    switch (result.kind) {
      case 'Success':
        const response = result.response as ResponseModel;

        if (response.errors) {
          return { kind: 'Response with errors', errors: response.errors };
        }

        const tweets: Tweet[] = [];
        for (const model of response.data) {
          const tweet = this.createTweet(model);
          if (tweet) {
            tweets.push(tweet);
          } else {
            return { kind: 'Invalid response', response: response.data };
          }
        }

        const nextPageToken = response.meta.next_token;
        return { kind: 'Success', tweets, nextPageToken };

      case 'Network error':
        return { kind: 'Network error', error: result.error };
    }
  }

  private createUrl(user: User, options: GetTweetsOptions): string {
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

    return url;
  }

  private createTweet(model: ResponseTweetModel): Tweet | undefined {
    // {
    //   id: "1489487411721736193",
    //   conversation_id: "1489487411721736193",
    //   text: "#AlertMPK #BUS\n⚠ Brak przejazdu- ul. Świeradowska (awaria tramwaju).",
    //   created_at: "2022-02-04T06:34:06.000Z",
    // }

    const id = model.id;
    const conversationId = model.conversation_id;
    const text = model.text;
    const createdAt = model.created_at;

    const isValid = this.isString(id)
      && this.isString(conversationId)
      && this.isString(text)
      && this.isString(createdAt);

    if (!isValid) {
      return undefined;
    }

    const createdAtDate = this.parseDate(createdAt);
    if (!createdAtDate) {
      return undefined;
    }

    return new Tweet(id, conversationId, createdAtDate, text);
  }
}

interface ResponseTweetModel {
  readonly id: string;
  readonly conversation_id: string;
  readonly text: string;
  readonly created_at: string;
}

interface ResponseModel {
  data: ResponseTweetModel[];
  meta: {
    readonly oldest_id: string;
    readonly newest_id: string;
    readonly result_count: number;
    readonly next_token: string;
  };
  errors?: {
    readonly title: string;
    readonly detail: string;
    readonly type: string;
  }[];
}
