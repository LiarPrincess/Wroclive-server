// No type definitions?
const htmlEscaper = require("html-escaper");

export class NotificationAuthor {
  public constructor(public readonly name: string, public readonly username: string) {}
}

/** Tweet with removed some things from its body. */
export class Notification {
  public constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly author: NotificationAuthor,
    public readonly createdAt: Date,
    public readonly text: string
  ) {}

  public static cleanText(text: string): string {
    // They start every tweet with tags, we do not need them.
    const replaced = text
      .replace(/#AlertMPK/gi, "")
      .replace(/#TRAM/gi, "")
      .replace(/#BUS/gi, "")
      .replace(/  /g, " "); // Double whitespace
    // They use '&gt;' to denote line direction:
    // 🚋 Tramwaje linii 1, 7&gt;POŚWIĘTNE skierowano przez pl. Staszica, ul. Reymonta, Bałtycką.
    const unescaped = htmlEscaper.unescape(replaced) as string;

    let result = "";

    // They sometimes have a space before new line.
    // Also: '\n\n' (double new line).
    const lines = unescaped.split("\n");
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index].trim();
      if (line) {
        if (result) {
          result += "\n";
        }

        result += line;
      }
    }

    return result;
  }
}
