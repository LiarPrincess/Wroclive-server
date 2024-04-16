import { StoredNotification } from "../StoredNotification";
import { Notification, NotificationAuthor } from "../../Notification";

describe("StoredNotification", () => {
  it("properly reads tweet", async () => {
    const date = "2020-10-11T13:54:28.999Z";
    const tweet = new Notification(
      "id_1",
      "url_1",
      new NotificationAuthor("author_name_1", "author_username_1"),
      new Date("2020-10-11T13:54:28.999Z"),
      "text_1"
    );

    const notification = StoredNotification.fromNotification(tweet);
    expect(notification).toEqual({
      id: "id_1",
      url: "url_1",
      author: {
        name: "author_name_1",
        username: "author_username_1",
      },
      date,
      body: "text_1",
    });
  });
});
