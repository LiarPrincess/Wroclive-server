import { default as nock } from 'nock';

import { Twitter } from '../Twitter';

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

function intercept(username: string): nock.Interceptor {
  const host = 'https://api.twitter.com';
  const path = `/2/users/by/username/${username}`;
  const headers = {
    'authorization': /OAuth oauth_consumer_key=".*", oauth_nonce=".*", oauth_signature=".*", oauth_signature_method="HMAC-SHA1", oauth_timestamp=".*", oauth_token=".*", oauth_version="1.0"/
  };

  return nock(host, { reqheaders: headers }).get(path);
}

/* ============= */
/* === Tests === */
/* ============= */

describe('MpkApi', () => {
  it('returns user on valid response', async () => {
    const username = 'USERNAME';
    const user = { id: '123456789', name: 'NAME', username: 'USERNAME_RESPONSE' };

    intercept(username)
      .reply(200, { data: user, });

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getUser(username);
    expect(result).toEqual({ kind: 'Success', user });
  });

  it('returns invalid when response contains invalid values', async () => {
    const username = 'USERNAME';
    const responses = [
      { id: 123456789, name: 'NAME', username: 'USERNAME_RESPONSE' },
      { id: '123456789', name: 1234, username: 'USERNAME_RESPONSE' },
      { id: '123456789', name: 'NAME', username: 123456789_12345 }
    ];

    for (const user of responses) {
      intercept(username)
        .reply(200, { data: user });

      const twitter = new Twitter({
        consumerKey: 'CONSUMER_KEY',
        consumerSecret: 'CONSUMER_SECRET',
        accessTokenKey: 'ACCESS_TOKEN_KEY',
        accessTokenSecret: 'ACCESS_TOKEN_SECRET'
      });

      const result = await twitter.getUser(username);
      expect(result).toEqual({ kind: 'Invalid response', response: user });
    }
  });

  it('returns errors if response contains errors', async () => {
    const username = 'INVALID_USERNAME';
    const error = {
      value: 'INVALID_USERNAME',
      detail: 'Could not find user with username: [INVALID_USERNAME].',
      title: 'Not Found Error',
      resource_type: 'user',
      parameter: 'username',
      resource_id: 'INVALID_USERNAME',
      type: 'https://api.twitter.com/2/problems/resource-not-found',
    };

    intercept(username)
      .reply(200, {
        data: { // Should be ignored!
          id: '123456789',
          name: 'NAME',
          username: 'INVALID_USERNAME_RESPONSE'
        },
        errors: [error],
      });

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getUser(username);
    expect(result).toEqual({ kind: 'Response with errors', errors: [error] });
  });

  it('returns error when response is empty', async () => {
    const username = 'USERNAME';
    intercept(username)
      .reply(200, {});

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getUser(username);
    expect(result).toEqual({ kind: 'Invalid response', response: undefined });
  });

  it('returns error on network error', async () => {
    const username = 'USERNAME';
    intercept(username)
      .twice() // If the request fails then it should be tried again.
      .replyWithError('Some error...');

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getUser(username);
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
    const username = 'USERNAME';
    intercept(username)
      .twice() // If the request fails then it should be tried again.
      .reply(404, {});

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getUser(username);
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
    const username = 'USERNAME';

    intercept(username)
      .reply(200, 'invalid json');

    const twitter = new Twitter({
      consumerKey: 'CONSUMER_KEY',
      consumerSecret: 'CONSUMER_SECRET',
      accessTokenKey: 'ACCESS_TOKEN_KEY',
      accessTokenSecret: 'ACCESS_TOKEN_SECRET'
    });

    const result = await twitter.getUser(username);
    expect(result).toEqual({ kind: 'Invalid response', response: undefined });
  });
});
