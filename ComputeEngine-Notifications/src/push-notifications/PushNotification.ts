export class PushNotification {
  constructor(
    public readonly id: string,
    /**
     * An app-specific identifier for grouping related notifications.
     */
    public readonly threadId: string,
    public readonly body: string
  ) { }
}
