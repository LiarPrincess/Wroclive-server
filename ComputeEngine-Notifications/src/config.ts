import { TwitterUser } from "./TwitterClient";

const second = 1000;
const minute = 60 * second;

export const twitterUser = new TwitterUser("MPK Wrocław", "AlertMPK");
export const tweetCount = 20;
export const loopInterval = {
  min: 4 * minute,
  max: 6 * minute,
};
export const nitterUrl = "http://localhost:8080";
