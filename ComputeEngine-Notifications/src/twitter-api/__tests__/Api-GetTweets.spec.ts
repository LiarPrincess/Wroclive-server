import { default as nock } from "nock";

import { User } from "../User";
import { Api } from "../Api";
import { Tweet, TweetAuthor } from "../Tweet";
import { GetTweetsOptions } from "../endpoints";

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

function intercept(user: User, params: string = ""): nock.Interceptor {
  const host = "https://api.twitter.com";
  const path = `/2/users/${user.id}/tweets?expansions=author_id&tweet.fields=id,conversation_id,text,created_at&user.fields=id,name,username${params}`;
  const headers = {
    authorization:
      /OAuth oauth_consumer_key=".*", oauth_nonce=".*", oauth_signature=".*", oauth_signature_method="HMAC-SHA1", oauth_timestamp=".*", oauth_token=".*", oauth_version="1.0"/,
  };

  return nock(host, { reqheaders: headers }).get(path);
}

/* ============= */
/* === Mocks === */
/* ============= */

const mpk = new User("296212741", "MPK Wrocław", "@AlertMPK");
const otherUser = new User("other_user_id", "other_user_name", "@other_user");

const meta = {
  oldest_id: "1489487411721736193",
  newest_id: "1491856279974912013",
  result_count: 20,
  next_token: "7140dibdnow9c7btw3z45fi4m7hpkp6vavs7nflr8m8mr",
};

const includes = {
  users: [otherUser],
};

const tweetFromMpkResponse = {
  id: "1491856279974912013",
  conversation_id: "1491856279974912013",
  text: "#AlertMPK ul. Kosmonautów - ruch przywrócony. Tramwaje wracają na swoje stałe trasy przejazdu.",
  created_at: "2022-02-10T19:27:09.000Z",
  author_id: "296212741",
};
const tweetFromOtherUserResponse = {
  id: "1491832028706357251",
  conversation_id: "1491832028706357251",
  text: '#AlertMPK #TRAM \n⚠️ Brak przejazdu- ul. Kosmonautów (uszkodzony pantograf). \n🚋 Tramwaje linii 3, 10, 20 skrócono do Pilczyc. \n🚍 Kursują autobusy "za tramwaj" w relacji: Pilczyce- Leśnica.\n🚍 Linia 102 kursuje do Pilczyc.',
  created_at: "2022-02-10T17:50:47.000Z",
  author_id: "other_user_id",
};

function toTweet(response: any, author?: User): Tweet {
  const u = author || (response.author_id === mpk.id ? mpk : otherUser);

  return new Tweet(
    response.id,
    response.conversation_id,
    TweetAuthor.fromUser(u),
    new Date(response.created_at),
    response.text
  );
}

const tweetFromMpk = toTweet(tweetFromMpkResponse);
const tweetFromOther = toTweet(tweetFromOtherUserResponse);

function createApi(): Api {
  return new Api({
    consumerKey: "CONSUMER_KEY",
    consumerSecret: "CONSUMER_SECRET",
    accessTokenKey: "ACCESS_TOKEN_KEY",
    accessTokenSecret: "ACCESS_TOKEN_SECRET",
  });
}

/* ============= */
/* === Tests === */
/* ============= */

describe("TwitterApi.getTweets", () => {
  it("returns tweets on valid response", async () => {
    intercept(mpk).reply(200, {
      data: [tweetFromMpkResponse, tweetFromOtherUserResponse],
      includes,
      meta,
    });

    const api = createApi();
    const result = await api.getTweets(mpk);

    expect(result).toEqual({
      kind: "Success",
      tweets: [tweetFromMpk, tweetFromOther],
      nextPageToken: meta.next_token,
    });
  });

  it("returns tweets with author from argument when response does not contain users", async () => {
    intercept(mpk).reply(200, {
      data: [tweetFromMpkResponse, tweetFromOtherUserResponse],
      // includes, <= no users
      meta,
    });

    const api = createApi();
    const result = await api.getTweets(mpk);

    expect(result).toEqual({
      kind: "Success",
      tweets: [tweetFromMpk, toTweet(tweetFromOtherUserResponse, mpk)],
      nextPageToken: meta.next_token,
    });
  });

  it("returns tweets on valid response with options", async () => {
    const presets: { options: GetTweetsOptions; params: string }[] = [
      { options: { maxResults: 20 }, params: "&max_results=20" },
      { options: { excludeReplies: true }, params: "&exclude=replies" },
      { options: { excludeRetweets: true }, params: "&exclude=retweets" },
      { options: { pagination_token: "TOKEN" }, params: "&pagination_token=TOKEN" },
      {
        options: { maxResults: 20, excludeReplies: true, excludeRetweets: true },
        params: "&max_results=20&exclude=retweets,replies",
      },
    ];

    for (const preset of presets) {
      intercept(mpk, preset.params).reply(200, {
        data: [tweetFromMpkResponse, tweetFromOtherUserResponse],
        includes,
        meta,
      });

      const api = createApi();
      const result = await api.getTweets(mpk, preset.options);

      expect(result).toEqual({
        kind: "Success",
        tweets: [tweetFromMpk, tweetFromOther],
        nextPageToken: meta.next_token,
      });
    }
  });

  it("returns invalid when response contains invalid values", async () => {
    const responses = [
      { id: 123, conversation_id: "conversation_id", text: "text", created_at: "2022-02-10T19:27:09.000Z" },
      { id: "id", conversation_id: 123, text: "text", created_at: "2022-02-10T19:27:09.000Z" },
      { id: "id", conversation_id: "conversation_id", text: 123, created_at: "2022-02-10T19:27:09.000Z" },
      { id: "id", conversation_id: "conversation_id", text: "text", created_at: 123 },
      { id: "id", conversation_id: "conversation_id", text: "text", created_at: "INVALID_DATE" },
    ];

    for (const tweetResponse of responses) {
      intercept(mpk).reply(200, { data: [tweetResponse], includes, meta });

      const api = createApi();
      const result = await api.getTweets(mpk);
      expect(result).toEqual({ kind: "Invalid response", response: [tweetResponse] });
    }
  });

  it("returns errors if response contains errors", async () => {
    const error = {
      value: "INVALID_USERNAME",
      detail: "Could not find user with username: [INVALID_USERNAME].",
      title: "Not Found Error",
      resource_type: "user",
      parameter: "username",
      resource_id: "INVALID_USERNAME",
      type: "https://api.twitter.com/2/problems/resource-not-found",
    };

    intercept(mpk).reply(200, {
      data: [tweetFromMpkResponse, tweetFromOtherUserResponse], // Should be ignored!
      errors: [error],
      meta,
    });

    const api = createApi();
    const result = await api.getTweets(mpk);
    expect(result).toEqual({ kind: "Response with errors", errors: [error] });
  });

  it("returns error when response is empty", async () => {
    intercept(mpk).reply(200, {});

    const api = createApi();
    const result = await api.getTweets(mpk);
    expect(result).toEqual({ kind: "Invalid response", response: undefined });
  });

  it("returns error on network error", async () => {
    intercept(mpk)
      .twice() // If the request fails then it should be tried again.
      .replyWithError("Some error...");

    const api = createApi();
    const result = await api.getTweets(mpk);

    switch (result.kind) {
      case "Network error":
        expect(result.error.message).toEqual("Unknown request error.");
        break;
      default:
        expect(true).toBeFalsy();
        break;
    }
  });

  it("returns error on 404", async () => {
    intercept(mpk)
      .twice() // If the request fails then it should be tried again.
      .reply(404, {});

    const api = createApi();
    const result = await api.getTweets(mpk);

    switch (result.kind) {
      case "Network error":
        expect(result.error.message).toEqual("Response with status: 404.");
        break;
      default:
        expect(true).toBeFalsy();
        break;
    }
  });

  it("returns error on json parsing error", async () => {
    intercept(mpk).reply(200, "invalid json");

    const api = createApi();
    const result = await api.getTweets(mpk);
    expect(result).toEqual({ kind: "Invalid response", response: undefined });
  });
});
