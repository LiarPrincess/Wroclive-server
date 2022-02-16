import { Tweet, TweetAuthor } from './twitter';

/**
 * Tweet with removed some things from its body.
 */
export class CleanTweet {

  public constructor(
    public readonly id: string,
    public readonly url: string,
    /** Id of the 1st tweet in the conversation (a series of tweets). */
    public readonly conversationId: string,
    public readonly conversationUrl: string,
    public readonly author: TweetAuthor,
    public readonly createdAt: Date,
    public readonly text: string,
  ) { }

  public static fromTweet(tweet: Tweet): CleanTweet {
    const text = cleanText(tweet.text);
    return new CleanTweet(
      tweet.id,
      tweet.url,
      tweet.conversationId,
      tweet.conversationUrl,
      tweet.author,
      tweet.createdAt,
      text
    );
  }
}

function cleanText(text: string): string {
  return text
    .replace(/#AlertMPK/gi, '')
    .replace(/#TRAM/gi, '')
    .replace(/#BUS/gi, '')
    .replace(/  /g, ' ') // Double whitespace
    .trim();
}
