import { User } from '../User';
import { Tweet, TweetAuthor } from '../Tweet';
import { Endpoint, NetworkError, isString, parseDate } from './Endpoint';

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

  public async call(user: User, options: GetTweetsOptions | undefined): Promise<GetTweetsResponse> {
    const url = this.createUrl(user, options);
    const result = await this.get(url);

    switch (result.kind) {
      case 'Success':
        const response = result.response as ResponseModel;

        if (response.errors) {
          return { kind: 'Response with errors', errors: response.errors };
        }

        const tweetModels = response.data;
        if (!Array.isArray(tweetModels)) {
          return { kind: 'Invalid response', response: tweetModels };
        }

        // If the users are invalid we can deal with it (no need for error).
        const userModels = response.includes?.users;
        const authors = new AuthorCollection(user, userModels);

        const tweets: Tweet[] = [];
        for (const model of tweetModels) {
          const tweet = this.createTweet(model, authors);
          if (tweet) {
            tweets.push(tweet);
          } else {
            return { kind: 'Invalid response', response: tweetModels };
          }
        }

        const nextPageToken = response.meta.next_token;
        return { kind: 'Success', tweets, nextPageToken };

      case 'Network error':
        return { kind: 'Network error', error: result.error };
    }
  }

  private createUrl(user: User, options: GetTweetsOptions | undefined): string {
    let url = `https://api.twitter.com/2/users/${user.id}/tweets?expansions=author_id&tweet.fields=id,conversation_id,text,created_at&user.fields=id,name,username`;

    if (options?.maxResults) {
      url += `&max_results=${options.maxResults}`;
    }

    if (options?.excludeRetweets && options?.excludeReplies) {
      url += '&exclude=retweets,replies';
    } else if (options?.excludeRetweets) {
      url += '&exclude=retweets';
    } else if (options?.excludeReplies) {
      url += '&exclude=replies';
    }

    if (options?.pagination_token) {
      url += `&pagination_token=${options.pagination_token}`;
    }

    return url;
  }

  private createTweet(model: ResponseTweetModel, authors: AuthorCollection): Tweet | undefined {
    // {
    //   id: "1489487411721736193",
    //   conversation_id: "1489487411721736193",
    //   text: "#AlertMPK #BUS\n⚠ Brak przejazdu- ul. Świeradowska (awaria tramwaju).",
    //   created_at: "2022-02-04T06:34:06.000Z",
    //   author_id: "296212741"
    // }

    const id = model?.id;
    const conversationId = model?.conversation_id;
    const text = model?.text;
    const createdAt = model?.created_at;
    const authorId = model?.author_id;

    const isValid = isString(id)
      && isString(conversationId)
      && isString(authorId)
      && isString(createdAt)
      && isString(text);

    if (!isValid) {
      return undefined;
    }

    const createdAtDate = parseDate(createdAt);
    if (!createdAtDate) {
      return undefined;
    }

    const author = authors.getById(authorId);
    return new Tweet(id, conversationId, author, createdAtDate, text);
  }
}

class AuthorCollection {

  private readonly originalAuthor: TweetAuthor;
  private readonly responseAuthors: TweetAuthor[] = [];

  public constructor(originalUser: User, responseUsers: ResponseUserModel[] | undefined) {
    this.originalAuthor = TweetAuthor.fromUser(originalUser);

    if (Array.isArray(responseUsers)) {
      for (const model of responseUsers) {
        const id = model.id;
        const name = model.name;
        const username = model.username;

        const isValid = isString(id) && isString(name) && isString(username);
        if (isValid) {
          const author = new TweetAuthor(id, name, username);
          this.responseAuthors.push(author);
        }
      }
    }
  }

  public getById(id: string): TweetAuthor {
    for (const author of this.responseAuthors) {
      if (author.id === id) {
        return author;
      }
    }

    // We will assume that original user was the author.
    return this.originalAuthor;
  }
}

interface ResponseTweetModel {
  readonly id: string;
  readonly conversation_id: string;
  readonly author_id: string;
  readonly created_at: string;
  readonly text: string;
}

interface ResponseUserModel {
  readonly id: string;
  readonly name: string;
  readonly username: string;
}

interface ResponseModel {
  data: ResponseTweetModel[];
  includes?: {
    users: ResponseUserModel[]
  };
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
