import { Tweet, TweetAuthor } from './twitter';

// No type definitions?
const htmlEscaper = require('html-escaper');

export { TweetAuthor } from './twitter';

/**
 * Tweet with removed some things from its body.
 *
 * We could re-use Tweet, but this gives us an type-system level security.
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
  // They start every tweet with tags, we do not need them.
  const replaced = text
    .replace(/#AlertMPK/gi, '')
    .replace(/#TRAM/gi, '')
    .replace(/#BUS/gi, '')
    .replace(/  /g, ' ') // Double whitespace
    ;

  // They use '&gt;' to denote line direction:
  // 🚋 Tramwaje linii 1, 7&gt;POŚWIĘTNE skierowano przez pl. Staszica, ul. Reymonta, Bałtycką.
  const unescaped = htmlEscaper.unescape(replaced) as string;

  let result = '';

  // They sometimes have a space before new line.
  // Also: '\n\n' (double new line).
  const lines = unescaped.split('\n');
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim();
    if (line) {
      if (result) {
        result += '\n';
      }

      result += line;
    }
  }

  return result;
}
