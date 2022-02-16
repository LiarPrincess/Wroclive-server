import { Tweet, TweetAuthor } from '../twitter';
import { CleanTweet } from '../CleanTweet';

const author = new TweetAuthor('296212741', 'MPK Wrocław', 'AlertMPK');

function createTweet(text: string): Tweet {
  const createdAt = new Date('2022-02-09T11:39:29.000Z');
  return new Tweet('id', 'conversationId', author, createdAt, text);
}

describe('CleanTweet', () => {

  it('takes id, conversationId, createdAt etc. from original tweet', async () => {
    const tweet = new Tweet(
      '1491376201558261760',
      '1491376197611433993',
      author,
      new Date('2022-02-09T11:39:29.000Z'),
      `\
🚋 Tramwaje linii 74 zostały skierowane do pętli GRABISZYŃSKA(CMENTARZ).
Zadysponowano autobusy 'za tramwaj" w relacji FAT - ul. Powstańców Śląskich - FAT.`
    );

    const result = CleanTweet.fromTweet(tweet);
    expect(result.id).toEqual(tweet.id);
    expect(result.url).toEqual(tweet.url);
    expect(result.conversationId).toEqual(tweet.conversationId);
    expect(result.conversationUrl).toEqual(tweet.conversationUrl);
    expect(result.author).toEqual(tweet.author);
    expect(result.createdAt).toEqual(tweet.createdAt);
  });

  it('does not change already clean text', async () => {
    const text = `\
🚋 Tramwaje linii 74 zostały skierowane do pętli GRABISZYŃSKA(CMENTARZ).
Zadysponowano autobusy 'za tramwaj" w relacji FAT - ul. Powstańców Śląskich - FAT.`;

    const tweet = createTweet(text);

    const result = CleanTweet.fromTweet(tweet);
    expect(result.text).toEqual(text);
  });

  it("cleans prefixes like: '#AlertMPK', '#TRAM' and '#BUS'", async () => {
    const prefixes: string[] = [
      '#AlertMPK', '#alertmpk',
      '#TRAM', '#tram',
      '#AlertMPK #TRAM', '#alertmpk #tram',
      '#BUS', '#bus',
      '#AlertMPK #BUS', '#alertmpk #bus',
      '#AlertMPK #TRAM #BUS', '#alertmpk #tram #bus',
    ];

    const separators = [' ', '\t', '\n'];

    const originalText = `\
⚠ Brak przejazdu - al. Hallera (kolizja tramwajów).
🚋 Tramwaje linii 20 w obu kierunkach zostały skierowane objazdem przez ul. Grabiszyńską.
🚋 Tramwaje linii 70 zostały skierowane przez ul. Powstańców Śląskich do Zajezdni BOREK, gdzie zawracają.`;

    for (const prefix of prefixes) {
      for (const separator of separators) {
        const text = prefix + separator + originalText;
        const tweet = createTweet(text);

        const result = CleanTweet.fromTweet(tweet);
        expect(result.text).toEqual(originalText);
      }
    }
  });
});
