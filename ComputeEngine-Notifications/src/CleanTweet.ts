import { Tweet } from './twitter';

/** Tweet with removed some things */
export class CleanTweet {

  public readonly id: string;
  /** Parent tweet id. It is the same as 'this.id' if there is no parent. */
  public readonly conversationId: string;
  public readonly createdAt: Date;
  public readonly text: string;

  constructor(tweet: Tweet) {
    this.id = tweet.id;
    this.conversationId = tweet.conversationId;
    this.createdAt = tweet.createdAt;
    this.text = cleanText(tweet.text);
  }
}

function cleanText(text: string): string {
  return text
    .replace(/#AlertMPK/gi, '')
    .replace(/#TRAM/gi, '')
    .replace(/#BUS/gi, '')
    .replace(/  /g, ' ')
    .trim(); // Double whitespace
}
