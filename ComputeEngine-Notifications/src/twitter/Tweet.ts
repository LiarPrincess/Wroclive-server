export class TweetAuthor {
  public constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly username: string
  ) { }
}

export class Tweet {

  public readonly url: string;
  public readonly conversationUrl: string;

  public constructor(
    public readonly id: string,
    /**
     * Id of the 1st tweet in the conversation (a series of tweets).
     */
    public readonly conversationId: string,
    public readonly author: TweetAuthor,
    public readonly createdAt: Date,
    public readonly text: string
  ) {
    this.url = this.createUrl(this.id);
    this.conversationUrl = this.createUrl(this.conversationId);
  }

  private createUrl(id: string): string {
    // https://twitter.com/AlertMPK/status/1491029797811548167
    return `https://twitter.com/${this.author.username}/status/${id}`;
  }
}
