import { createLineFromName } from "../createLineFromName";

describe("createLineFromName", function () {
  it("creates artificial trams - regular", function () {
    const lineNames = [
      "0P",
      "0L",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "15",
      "16",
      "17",
      "20",
      "23",
      "31",
      "32",
      "33",
    ];

    for (const name of lineNames) {
      const line = createLineFromName(name);

      expect(line).toEqual({
        name,
        type: "Tram",
        subtype: "Regular",
        stopArrivalTimes: undefined,
      });
    }
  });

  it("creates artificial trams - holidays", function () {
    const lineNames = ["E1", "E2"];

    for (const name of lineNames) {
      const line = createLineFromName(name);

      expect(line).toEqual({
        name,
        type: "Tram",
        subtype: "Regular",
        stopArrivalTimes: undefined,
      });
    }
  });

  it("creates artificial busses - regular", function () {
    const lineNames = [
      "100",
      "101",
      "102",
      "103",
      "104",
      "105",
      "106",
      "107",
      "108",
      "109",
      "110",
      "111",
      "112",
      "113",
      "114",
      "115",
      "116",
      "118",
      "119",
      "120",
      "121",
      "122",
      "124",
      "125",
      "126",
      "127",
      "128",
      "129",
      "130",
      "131",
      "132",
      "133",
      "134",
      "136",
      "140",
      "141",
      "142",
      "143",
      "144",
      "145",
      "146",
      "147",
      "148",
      "149",
      "150",
      "151",
      "319",
      "325",
    ];

    for (const name of lineNames) {
      const line = createLineFromName(name);

      expect(line).toEqual({
        name,
        type: "Bus",
        subtype: "Regular",
        stopArrivalTimes: undefined,
      });
    }
  });

  it("creates artificial busses - express", function () {
    const lineNames = ["A", "C", "D", "K", "N"];

    for (const name of lineNames) {
      const line = createLineFromName(name);

      expect(line).toEqual({
        name,
        type: "Bus",
        subtype: "Express",
        stopArrivalTimes: undefined,
      });
    }
  });

  it("creates artificial busses - night", function () {
    const lineNames = [
      "206",
      "240",
      "241",
      "242",
      "243",
      "245",
      "246",
      "247",
      "248",
      "249",
      "250",
      "251",
      "253",
      "255",
      "257",
      "259",
    ];

    for (const name of lineNames) {
      const line = createLineFromName(name);

      expect(line).toEqual({
        name,
        type: "Bus",
        subtype: "Night",
        stopArrivalTimes: undefined,
      });
    }
  });

  it("creates artificial busses - suburban", function () {
    const lineNames = ["602", "607", "609", "612"];

    for (const name of lineNames) {
      const line = createLineFromName(name);

      expect(line).toEqual({
        name,
        type: "Bus",
        subtype: "Suburban",
        stopArrivalTimes: undefined,
      });
    }
  });

  it("creates artificial busses - temporary", function () {
    const lineNames = ["701", "714"];

    for (const name of lineNames) {
      const line = createLineFromName(name);

      expect(line).toEqual({
        name,
        type: "Bus",
        subtype: "Temporary",
        stopArrivalTimes: undefined,
      });
    }
  });
});
