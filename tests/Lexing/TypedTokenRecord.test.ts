import { TypedTokenRecord } from "../../src/Lexing/TypedTokenRecord";
import { Type } from "../../src/Type/Type";

describe("constructor", () =>
{
  describe("Post Conditions", () =>
  {
    test("Internal type is properly initialized to input type", () =>
    {
      expect(new TypedTokenRecord(new Type("i -> o"))["type"].toString()).toBe("i->o");
    });
  });
});

describe("sort()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      expect(new TypedTokenRecord(new Type("Dummy")).sort()).toBe("TypedToken");
    });
  });
});

describe("getType()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      expect(new TypedTokenRecord(new Type("[i,i]->o")).getType().toString()).toBe("[i,i]->o");
    });
  });
});