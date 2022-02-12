import { default as nock } from 'nock';

import { Twitter, User, Tweet } from '..';

/* ============ */
/* === Nock === */
/* ============ */

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

function intercept(user: User, params: string = ''): nock.Interceptor {
  const host = 'https://api.twitter.com';
  const path = `/2/users/${user.id}/tweets?tweet.fields=id,conversation_id,created_at,text${params}`;
  const headers = {
    'authorization': /OAuth oauth_consumer_key=".*", oauth_nonce=".*", oauth_signature=".*", oauth_signature_method="HMAC-SHA1", oauth_timestamp=".*", oauth_token=".*", oauth_version="1.0"/
  };

  return nock(host, { reqheaders: headers }).get(path);
}

/* ============= */
/* === Mocks === */
/* ============= */

const user = new User('id', 'name', 'username');
const meta = {
  oldest_id: '1489487411721736193',
  newest_id: '1491856279974912013',
  result_count: 20,
  next_token: '7140dibdnow9c7btw3z45fi4m7hpkp6vavs7nflr8m8mr',
};

const tweet1Response = {
  id: '1491856279974912013',
  conversation_id: '1491856279974912013',
  text: '#AlertMPK ul. Kosmonautów - ruch przywrócony. Tramwaje wracają na swoje stałe trasy przejazdu.',
  created_at: '2022-02-10T19:27:09.000Z',
};
const tweet2Response = {
  id: '1491832028706357251',
  conversation_id: '1491832028706357251',
  text: '#AlertMPK #TRAM \n⚠️ Brak przejazdu- ul. Kosmonautów (uszkodzony pantograf). \n🚋 Tramwaje linii 3, 10, 20 skrócono do Pilczyc. \n🚍 Kursują autobusy "za tramwaj" w relacji: Pilczyce- Leśnica.\n🚍 Linia 102 kursuje do Pilczyc.',
  created_at: '2022-02-10T17:50:47.000Z',
};

function toTweet(response: any): Tweet {
  return new Tweet(response.id, response.conversation_id, new Date(response.created_at), response.text);
}
const tweet1 = toTweet(tweet1Response);
const tweet2 = toTweet(tweet2Response);

/* ============= */
/* === Tests === */
/* ============= */

describe('Twitter.getTweets', () => {
  it('returns tweets on valid response', async () => {
    intercept(user)
      .reply(200, { data: [tweet1Response, tweet2Response], meta });

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getTweets(user);
    expect(result).toEqual({
      kind: 'Success',
      tweets: [tweet1, tweet2],
      nextPageToken: meta.next_token
    });
  });

  it('returns tweets on valid response with options', async () => {
    intercept(user, '&max_results=20&exclude=retweets,replies')
      .reply(200, { data: [tweet1Response, tweet2Response], meta });

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getTweets(user, {
      maxResults: 20,
      excludeReplies: true,
      excludeRetweets: true
    });

    expect(result).toEqual({
      kind: 'Success',
      tweets: [tweet1, tweet2],
      nextPageToken: meta.next_token
    });
  });

  it('returns invalid when response contains invalid values', async () => {
    const responses = [
      { id: 123, conversation_id: 'conversation_id', text: 'text', created_at: '2022-02-10T19:27:09.000Z' },
      { id: 'id', conversation_id: 123, text: 'text', created_at: '2022-02-10T19:27:09.000Z' },
      { id: 'id', conversation_id: 'conversation_id', text: 123, created_at: '2022-02-10T19:27:09.000Z' },
      { id: 'id', conversation_id: 'conversation_id', text: 'text', created_at: 123 }
    ];

    for (const tweetResponse of responses) {
      intercept(user)
        .reply(200, { data: [tweetResponse], meta });

      const twitter = new Twitter({
        consumerKey: 'CONSUMER_KEY',
        consumerSecret: 'CONSUMER_SECRET',
        accessTokenKey: 'ACCESS_TOKEN_KEY',
        accessTokenSecret: 'ACCESS_TOKEN_SECRET'
      });

      const result = await twitter.getTweets(user);
      expect(result).toEqual({ kind: 'Invalid response', response: [tweetResponse] });
    }
  });

  it('returns errors if response contains errors', async () => {
    const error = {
      value: 'INVALID_USERNAME',
      detail: 'Could not find user with username: [INVALID_USERNAME].',
      title: 'Not Found Error',
      resource_type: 'user',
      parameter: 'username',
      resource_id: 'INVALID_USERNAME',
      type: 'https://api.twitter.com/2/problems/resource-not-found',
    };

    intercept(user)
      .reply(200, {
        data: [tweet1Response, tweet2Response], // Should be ignored!
        errors: [error],
        meta
      });

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getTweets(user);
    expect(result).toEqual({ kind: 'Response with errors', errors: [error] });
  });

  it('returns error when response is empty', async () => {
    intercept(user)
      .reply(200, {});

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getTweets(user);
    expect(result).toEqual({ kind: 'Invalid response', response: undefined });
  });

  it('returns error on network error', async () => {
    intercept(user)
      .twice() // If the request fails then it should be tried again.
      .replyWithError('Some error...');

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getTweets(user);
    switch (result.kind) {
      case 'Network error':
        expect(result.error.message).toEqual('Unknown request error.');
        break;
      default:
        expect(true).toBeFalsy();
        break;
    }
  });

  it('returns error on 404', async () => {
    intercept(user)
      .twice() // If the request fails then it should be tried again.
      .reply(404, {});

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getTweets(user);
    switch (result.kind) {
      case 'Network error':
        expect(result.error.message).toEqual('Response with status: 404.');
        break;
      default:
        expect(true).toBeFalsy();
        break;
    }
  });

  it('returns error on json parsing error', async () => {
    intercept(user)
      .reply(200, 'invalid json');

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getTweets(user);
    expect(result).toEqual({ kind: 'Invalid response', response: undefined });
  });
});
