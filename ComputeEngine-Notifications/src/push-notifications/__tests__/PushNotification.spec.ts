import { PushNotification } from "../PushNotification";
import { Notification, NotificationAuthor } from "../../Notification";

describe("PushNotification", () => {
  it("creates from Tweet", async () => {
    const date = new Date("2022-03-07T15:34:31.000Z");
    const tweet = new Notification(
      "1500857433622732808",
      "https://twitter.com/AlertMPK/status/1500857433622732808",
      new NotificationAuthor("MPK Wrocław", "AlertMPK"),
      date,
      "ul. Żmigrodzka - ruch przywrócony. Tramwaje wracają na swoje stałe trasy przejazdu."
    );

    const result = PushNotification.fromNotification(tweet);
    expect(result).toEqual({
      id: "1500857433622732808",
      threadId: "2022-03-07", // Group by day
      url: "https://twitter.com/AlertMPK/status/1500857433622732808",
      author: "https://twitter.com/AlertMPK",
      createdAt: date,
      body: "ul. Żmigrodzka - ruch przywrócony. Tramwaje wracają na swoje stałe trasy przejazdu.",
    });
  });
});
