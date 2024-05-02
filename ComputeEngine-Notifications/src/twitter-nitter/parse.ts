import { createHmac } from "crypto";
import { ResponseModel } from "./ResponseModel";
import { TwitterUser } from "../TwitterClient";
const xml2js = require("xml2js");

export class Tweet {
  public constructor(
    public readonly textHash: string,
    public readonly author: TwitterUser,
    public readonly createdAt: Date,
    public readonly text: string
  ) {}
}

export type ParseResult = { kind: "Success"; tweets: Tweet[] } | { kind: "Failure"; message: string; data: any };

export async function parse(xmlString: string, user: TwitterUser, maxCount: number): Promise<ParseResult> {
  let xml: ResponseModel;

  try {
    xml = (await parseXml(xmlString)) as ResponseModel;
  } catch (error) {
    return {
      kind: "Failure",
      message: "XML parsing failure: xml2js.parseString.",
      data: error,
    };
  }

  const channels = xml.rss.channel;
  if (channels.length !== 1) {
    return {
      kind: "Failure",
      message: `XML content error: invalid channel count: ${channels.length}.`,
      data: xml,
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
      kind: "Failure",
      message: `XML content error: unable to parse tweets.`,
      data: {
        messages: contentErrors,
        xml,
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
