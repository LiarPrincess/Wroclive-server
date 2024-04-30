import { TwitterUser } from "./TwitterClient";

const second = 1000;
const minute = 60 * second;

export const twitterUser = new TwitterUser("MPK Wrocław", "AlertMPK");
export const tweetCount = 20;
export const loopInterval = 5 * minute;
