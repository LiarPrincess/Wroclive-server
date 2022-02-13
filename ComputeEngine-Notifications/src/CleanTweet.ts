import { Tweet } from './twitter';

/**
 * Tweet with removed some things.
 */
export class CleanTweet {

  public readonly id: string;
  /**
   * Id of the 1st tweet in the conversation (a series of tweets).
   */
  public readonly conversationId: string;
  public readonly createdAt: Date;
  public readonly text: string;

  constructor(tweet: Tweet);
  constructor(id: string, conversationId: string, createdAt: Date, text: string);
  constructor(arg0: any, arg1?: any, arg2?: any, arg3?: any) {
    if (arg0 instanceof Tweet) {
      this.id = arg0.id;
      this.conversationId = arg0.conversationId;
      this.createdAt = arg0.createdAt;
      this.text = cleanText(arg0.text);
    } else {
      this.id = arg0;
      this.conversationId = arg1;
      this.createdAt = arg2;
      this.text = cleanText(arg3);
    }
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
