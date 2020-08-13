import { RightRoundBracketTokenRecord } from "../../src/Lexing/RightRoundBracketTokenRecord";

describe("", () =>
{
  describe("Post Conditions", () =>
  {
    test("Token sort is correct", () =>
    {
      expect(new RightRoundBracketTokenRecord().sort()).toBe("RightRoundBracketToken");
    });
  });
});