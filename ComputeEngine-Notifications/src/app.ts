import { join } from 'path';

import { Twitter } from './twitter';
import { createLogger, getRootDir } from './util';

const username = 'AlertMPK';
(async function () {
  const logger = createLogger('CE-Notifications');
  const twitter = await createTwitterClient();

  try {
    const userResult = await twitter.getUser(username);
    switch (userResult.kind) {
      case 'Success':
        const user = userResult.user;
        const tweets = await twitter.getTweets(user, {
          maxResults: 20,
          excludeReplies: true,
          excludeRetweets: true
        });

        break;

      default:
        break;
    }
  } catch (error) {
  }
})();

async function createTwitterClient() {
  const rootDir = await getRootDir();
  const credentialsPath = join(rootDir, 'Twitter-Credentials.json');
  const credentials = require(credentialsPath);
  return new Twitter(credentials);
}
