import { TwitterApiClient } from "..";
import { User } from "../User";
import { ApiBase } from "../Api";
import { Tweet, TweetAuthor } from "../Tweet";
import { GetUserResponse, GetTweetsOptions, GetTweetsResponse, NetworkError } from "../endpoints";
import { LoggerFake } from "../../util";
import { Notification } from "Notification";

/* ============ */
/* === Data === */
/* ============ */

const user = new User("123456789", "NAME", "USERNAME_RESPONSE");
const username = user.username;
const userResponse: GetUserResponse = { kind: "Success", user };

const tweetAuthor = new TweetAuthor("AUTHOR_ID", "NAME", "USERNAME");
const tweetDate = new Date("2022-02-09T11:39:29.000Z");

const tweetsResponse_empty: GetTweetsResponse = {
  kind: "Success",
  tweets: [],
  nextPageToken: "NEXT_PAGE_TOKEN",
};

const tweetsResponse: GetTweetsResponse = {
  kind: "Success",
  tweets: [
    new Tweet("ID", "CON_ID", tweetAuthor, tweetDate, "TEXT_1"),
    new Tweet("ID", "CON_ID", tweetAuthor, tweetDate, "TEXT_2"),
    new Tweet("ID", "CON_ID", tweetAuthor, tweetDate, "TEXT_3"),
    new Tweet("ID", "CON_ID", tweetAuthor, tweetDate, "TEXT_4"),
  ],
  nextPageToken: "NEXT_PAGE_TOKEN",
};
const tweets: Notification[] = tweetsResponse.tweets.map((t) => TwitterApiClient.createNotification(t));

const options = {
  count: 20,
  includeReplies: false,
  includeRetweets: false,
};
const getTweetsArg = {
  user,
  options: {
    maxResults: options.count,
    excludeRetweets: !options.includeRetweets,
    excludeReplies: !options.includeReplies,
    pagination_token: undefined,
  },
};

class ApiFake extends ApiBase {
  public getUserArgs: string[] = [];
  public getTweetsArgs: { user: User; options: GetTweetsOptions | undefined }[] = [];

  public constructor(private readonly user: GetUserResponse, private readonly tweets: GetTweetsResponse) {
    super();
  }

  public async getUser(username: string): Promise<GetUserResponse> {
    this.getUserArgs.push(username);
    return this.user;
  }

  public async getTweets(user: User, options?: GetTweetsOptions | undefined): Promise<GetTweetsResponse> {
    this.getTweetsArgs.push({ user, options });
    return this.tweets;
  }
}

/* ============= */
/* === Tests === */
/* ============= */

describe("TwitterApiClient", () => {
  it("caches user on 1st call", async () => {
    const api = new ApiFake(userResponse, tweetsResponse_empty);
    const logger = new LoggerFake();
    const client = new TwitterApiClient(api, logger);

    const result1 = await client.getTweets(user, options);
    expect(result1).toEqual([]);
    expect(api.getUserArgs).toEqual([username]);
    expect(api.getTweetsArgs).toEqual([getTweetsArg]);

    const result2 = await client.getTweets(user, options);
    expect(result2).toEqual([]);
    expect(api.getUserArgs).toEqual([username]); // Only 1 entry!
    expect(api.getTweetsArgs).toEqual([getTweetsArg, getTweetsArg]);
  });

  it("handles get user error", async () => {
    const responses: GetUserResponse[] = [
      { kind: "Response with errors", errors: ["ERROR_1", "ERROR_2"] },
      { kind: "Invalid response", response: "RESPONSE" },
      { kind: "Network error", error: new NetworkError("NETWORK_ERROR", "DATA") },
    ];

    for (const r of responses) {
      const api = new ApiFake(r, tweetsResponse_empty);
      const logger = new LoggerFake();
      const client = new TwitterApiClient(api, logger);

      const result = await client.getTweets(user, options);
      expect(result).toBeUndefined();
      expect(logger.errorArgs.length).toEqual(1);
    }
  });

  it("returns notifications", async () => {
    const api = new ApiFake(userResponse, tweetsResponse);
    const logger = new LoggerFake();
    const client = new TwitterApiClient(api, logger);

    const result = await client.getTweets(user, options);
    expect(result).toEqual(tweets);
  });

  it("handles get tweets error", async () => {
    const responses: GetTweetsResponse[] = [
      { kind: "Response with errors", errors: ["ERROR_1", "ERROR_2"] },
      { kind: "Invalid response", response: "RESPONSE" },
      { kind: "Network error", error: new NetworkError("NETWORK_ERROR", "DATA") },
    ];

    for (const r of responses) {
      const api = new ApiFake(userResponse, r);
      const logger = new LoggerFake();
      const client = new TwitterApiClient(api, logger);

      const result = await client.getTweets(user, options);
      expect(result).toBeUndefined();
      expect(logger.errorArgs.length).toEqual(1);
    }
  });
});
