import { WhitespaceTokenRecord } from "../../src/Lexing/WhitespaceTokenRecord";

describe("", () =>
{
  describe("Post Conditions", () =>
  {
    test("Token sort is correct", () =>
    {
      expect(new WhitespaceTokenRecord().sort()).toBe("WhitespaceToken");
    });
  });
});