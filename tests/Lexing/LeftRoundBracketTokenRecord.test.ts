import { LeftRoundBracketTokenRecord } from "../../src/Lexing/LeftRoundBracketTokenRecord";

describe("", () =>
{
  describe("Post Conditions", () =>
  {
    test("Token sort is correct", () =>
    {
      expect(new LeftRoundBracketTokenRecord().sort()).toBe("LeftRoundBracketToken");
    });
  });
});