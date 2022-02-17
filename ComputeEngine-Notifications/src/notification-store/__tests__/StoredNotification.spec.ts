import { StoredNotification } from '../StoredNotification';
import { TweetAuthor } from '../../twitter';
import { CleanTweet } from '../../CleanTweet';

describe('StoredNotification', () => {

  it('properly reads tweet', async () => {
    const date = new Date(123);
    const tweet = new CleanTweet(
      'id_1',
      'url_1',
      'conversationId_1',
      'conversationUrl_1',
      new TweetAuthor('author_id__1', 'author_name_1', 'author_username_1'),
      date,
      'text_1'
    );

    const notification = StoredNotification.fromTweet(tweet);
    expect(notification).toEqual({
      id: 'id_1',
      url: 'url_1',
      author: 'https://twitter.com/author_username_1',
      date,
      body: 'text_1'
    });
  });
});
