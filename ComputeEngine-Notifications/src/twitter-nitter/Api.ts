import { createHmac } from "crypto";
import { default as axios, AxiosResponse, AxiosRequestConfig } from "axios";
import { ResponseModel } from "./ResponseModel";
import { TwitterUser } from "../TwitterClient";
const xml2js = require("xml2js");

// https://rss.app/feed/BeCZy2G8hbxynlRS
// https://rss.app/feeds/BeCZy2G8hbxynlRS.xml
// https://nitter.poast.org/AlertMPK/rss
// https://nitter.privacydev.net/AlertMpk/rss

export class NetworkError {
  constructor(public readonly message: string, public readonly data: any) {}
}

export class Tweet {
  public constructor(
    public readonly textHash: string,
    public readonly author: TwitterUser,
    public readonly createdAt: Date,
    public readonly text: string
  ) {}
}

export type GetTweetsResponse =
  | { kind: "Success"; tweets: Tweet[] }
  | { kind: "Invalid response"; error: any }
  | { kind: "Network error"; error: NetworkError };

export class Api {
  public constructor(private readonly baseUrl: string) {}

  public async getTweets(user: TwitterUser, maxCount: number): Promise<GetTweetsResponse> {
    const url = `${this.baseUrl}/${user.username}/rss`;
    let response: AxiosResponse<any, any>;

    try {
      response = await axios.get(url);
    } catch (axiosError) {
      const statusCode = this.getStatusCode(axiosError);
      const message = statusCode ? `Response with status: ${statusCode}.` : `Unknown request error.`;
      const error = new NetworkError(message, axiosError);
      return { kind: "Network error", error };
    }

    const xmlString = response.data;
    const result = await parse(response, xmlString, user, maxCount);
    return result;
  }

  private getStatusCode(error: any): string | undefined {
    return error.statusCode || (error.response && error.response.status);
  }
}

export type ParseResult = { kind: "Success"; tweets: Tweet[] } | { kind: "Invalid response"; error: any };

export async function parse(
  response: any,
  xmlString: string,
  user: TwitterUser,
  maxCount: number
): Promise<ParseResult> {
  let xml: ResponseModel;

  try {
    xml = (await parseXml(xmlString)) as ResponseModel;
  } catch (error) {
    return {
      kind: "Invalid response",
      error: {
        message: "XML parsing error.",
        parsingError: error,
        response,
      },
    };
  }

  const channels = xml.rss.channel;
  if (channels.length !== 1) {
    return {
      kind: "Invalid response",
      error: {
        message: `XML content error: invalid channel count: ${channels.length}.`,
        xml,
        response,
      },
    };
  }

  const mpk = channels[0];
  const tweets: Tweet[] = [];
  const contentErrors: string[] = [];

  for (let index = 0; index < mpk.item.length; index++) {
    const item = mpk.item[index];

    if (tweets.length === maxCount) {
      break;
    }

    if (item.title.length !== 1) {
      contentErrors.push(`item[${index}]: multiple 'title' nodes.`);
      continue;
    }

    let text = item.title[0];
    const replyPrefix = `R to @${user.username}:`;

    if (text.startsWith(replyPrefix)) {
      text = text.substring(replyPrefix.length).trim();
    }

    const secret = "Access-Twitter-by-Nitter-to-avoid-$100";
    const hmac = createHmac("sha256", secret);
    hmac.update(text);
    const id = hmac.digest("hex");

    if (item.pubDate.length !== 1) {
      contentErrors.push(`item[${index}]: multiple 'pubDate' nodes.`);
      continue;
    }

    const createdAtString = item.pubDate[0];
    const createdAtNum = Date.parse(createdAtString);
    const createdAt = new Date(createdAtNum);

    const tweet = new Tweet(id, user, createdAt, text);
    tweets.push(tweet);
  }

  if (contentErrors.length !== 0) {
    return {
      kind: "Invalid response",
      error: {
        messages: contentErrors,
        xml,
        response,
      },
    };
  }

  return { kind: "Success", tweets };
}

function parseXml(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, function (err: any, result: any) {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}
