import { PunctuationTokenRecord } from "../../src/Lexing/PunctuationTokenRecord";

describe("sort()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      expect(new PunctuationTokenRecord().sort()).toBe("PunctuationToken");
    });
  });
});