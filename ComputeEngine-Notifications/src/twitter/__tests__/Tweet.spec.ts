import { Tweet, TweetAuthor } from '../Tweet';

const tweet = new Tweet(
  '1493451597833293824',
  '1493451594809192450',
  new TweetAuthor('296212741', 'MPK Wrocław', 'AlertMPK'),
  new Date(0),
  '🚍Autobusy linii 122, 125 skierowano od ul. Swobodnej przez ul. Ślężną, Dyrekcyjną, Peronową.'
);

describe('Tweet', () => {
  it('returns valid url', async () => {
    const result = tweet.url;
    expect(result).toEqual('https://twitter.com/AlertMPK/status/1493451597833293824');
  });

  it('returns valid conversation url', async () => {
    const result = tweet.conversationUrl;
    expect(result).toEqual('https://twitter.com/AlertMPK/status/1493451594809192450');
  });
});
