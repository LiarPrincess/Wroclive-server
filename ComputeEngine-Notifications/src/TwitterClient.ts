import { Notification } from "./Notification";

export interface GetTweetsOptions {
  readonly count: number;
  readonly includeReplies: boolean;
  readonly includeRetweets: boolean;
}

export class TwitterUser {
  public constructor(public readonly name: string, public readonly username: string) {}
}

export interface TwitterClient {
  /** Get latests tweets from a given user. */
  getTweets(user: TwitterUser, options: GetTweetsOptions): Promise<Notification[] | undefined>;
}
