import { TypeParseTree } from "../../src/Type/TypeParseTree";
import { TypeTokenString } from "../../src/Type/TypeTokenString";

describe("constructor", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Type string cannot be empty!", () =>
    {
      expect(() => new TypeParseTree("")).toThrow("Type string cannot be empty!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Type string is initialized correctly", () =>
    {
      expect(new TypeParseTree("[i,o]->[i,o]->o").getTypeString()
        .isEqual(new TypeTokenString("[i,o]->[i,o]->o"))).toBe(true);
    });

    test("Offsets are initialized correctly", () =>
    {
      const tree = new TypeParseTree("[i,o]->[i,o]->o");
      expect(tree.getRoot().getSubstringBeginOffset()).toBe(0);
      expect(tree.getRoot().getSubstringEndOffset()).toBe(12);
    });
  });
  
});