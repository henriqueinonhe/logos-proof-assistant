import { CommaTokenRecord } from "../../src/Lexing/CommaTokenRecord";

describe("", () =>
{
  describe("Post Conditions", () =>
  {
    test("Token sort is correct", () =>
    {
      expect(new CommaTokenRecord().sort()).toBe("CommaToken");
    });
  });
});