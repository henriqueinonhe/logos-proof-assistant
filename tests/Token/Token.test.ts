import { Token } from "../../src/Token/Token";

describe("constructor", () =>
{
  describe("Post Conditions", () =>
  {
    test("Internal string is initialized properly", () =>
    {
      expect(new Token("Dobs")["string"]).toBe("Dobs");
    });
  });
});

describe("toString()", () =>
{
  describe("Post Conditions", () =>
  {
    test("", () =>
    {
      expect(new Token("Proposition").toString()).toBe("Proposition");
    });
  });
});

describe("isEqual()", () =>
{
  describe("Post Conditions", () =>
  {
    test("True", () =>
    {
      expect(new Token("x").isEqual(new Token("x"))).toBe(true);
    });

    test("False", () =>
    {
      expect(new Token("y").isEqual(new Token("x"))).toBe(false);
    });
  });
});