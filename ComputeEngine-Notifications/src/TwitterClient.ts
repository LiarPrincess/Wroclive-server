import { Notification } from "./Notification";

export interface GetTweetsOptions {
  readonly count: number;
  readonly includeReplies: boolean;
  readonly includeRetweets: boolean;
}

export interface TwitterClient {
  /** Get latests tweets from a given user. */
  getTweets(username: string, options: GetTweetsOptions): Promise<Notification[] | undefined>;
}
