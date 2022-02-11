import { AxiosResponse } from 'axios';

export class Tweet {
  public constructor(
    public readonly id: string,
    public readonly conversation_id: string,
    public readonly created_at: string,
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
  { kind: 'Invalid response', response: AxiosResponse<any, any> } |
  { kind: 'Network error', error: any };
