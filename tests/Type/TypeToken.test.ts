import {TypeToken, TypeTokenSort} from "../../src/Type/TypeToken";

describe("constructor", () => 
{
  describe("Pre Conditions", () =>
  {
    test("Punctuations and Operators", () =>
    {
      //Valid
      expect(() => {new TypeToken("(");}).not.toThrow();
      expect(() => {new TypeToken(")");}).not.toThrow();
      expect(() => {new TypeToken("[");}).not.toThrow();
      expect(() => {new TypeToken("]");}).not.toThrow();
      expect(() => {new TypeToken(",");}).not.toThrow();
      expect(() => {new TypeToken("->");}).not.toThrow();
  
      //Invalid
      expect(() => {new TypeToken("-");}).toThrow();
      expect(() => {new TypeToken(".");}).toThrow();
      expect(() => {new TypeToken("/");}).toThrow();
      expect(() => {new TypeToken("+");}).toThrow();
    });

    test("Primitive Tokens", () =>
    {
      //Valid
      expect(() => {new TypeToken("i");}).not.toThrow();
      expect(() => {new TypeToken("o");}).not.toThrow();
      expect(() => {new TypeToken("Something");}).not.toThrow();
      expect(() => {new TypeToken("something");}).not.toThrow();
      expect(() => {new TypeToken("var923");}).not.toThrow();
      expect(() => {new TypeToken("SoMeThiNG");}).not.toThrow();
      
      //Invalid
      expect(() => {new TypeToken("123asd");}).toThrow();
      expect(() => {new TypeToken("\n");}).toThrow();
      expect(() => {new TypeToken("\t");}).toThrow();
      expect(() => {new TypeToken("with space");}).toThrow();
    });
  });

  describe("Post Conditions", () =>
  {
    test("Internal string is set properly", () =>
    {
      expect(new TypeToken("(")["string"]).toBe("(");
      expect(new TypeToken(")")["string"]).toBe(")");
      expect(new TypeToken("[")["string"]).toBe("[");
      expect(new TypeToken("]")["string"]).toBe("]");
      expect(new TypeToken(",")["string"]).toBe(",");
      expect(new TypeToken("->")["string"]).toBe("->");
      expect(new TypeToken("i")["string"]).toBe("i");
      expect(new TypeToken("o")["string"]).toBe("o");
      expect(new TypeToken("Something")["string"]).toBe("Something");
      expect(new TypeToken("something")["string"]).toBe("something");
      expect(new TypeToken("var923")["string"]).toBe("var923");
      expect(new TypeToken("SoMeThiNG")["string"]).toBe("SoMeThiNG");
    });

    test("Sort is set properly", () =>
    {
      expect(new TypeToken("(")["sort"]).toBe(TypeTokenSort.LeftRoundBracket);
      expect(new TypeToken(")")["sort"]).toBe(TypeTokenSort.RightRoundBracket);
      expect(new TypeToken("[")["sort"]).toBe(TypeTokenSort.LeftSquareBracket);
      expect(new TypeToken("]")["sort"]).toBe(TypeTokenSort.RightSquareBracket);
      expect(new TypeToken(",")["sort"]).toBe(TypeTokenSort.Comma);
      expect(new TypeToken("->")["sort"]).toBe(TypeTokenSort.CompositionOperator);
      expect(new TypeToken("i")["sort"]).toBe(TypeTokenSort.PrimitiveType);
      expect(new TypeToken("o")["sort"]).toBe(TypeTokenSort.PrimitiveType);
      expect(new TypeToken("Something")["sort"]).toBe(TypeTokenSort.PrimitiveType);
      expect(new TypeToken("something")["sort"]).toBe(TypeTokenSort.PrimitiveType);
      expect(new TypeToken("var923")["sort"]).toBe(TypeTokenSort.PrimitiveType);
      expect(new TypeToken("SoMeThiNG")["sort"]).toBe(TypeTokenSort.PrimitiveType);
    });
  });
});

describe("sort() - private", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Invalid Tokens", () =>
    {
      expect(() => {TypeToken["sort"]("123asd");}).toThrow();
      expect(() => {TypeToken["sort"]("\n");}).toThrow();
      expect(() => {TypeToken["sort"]("\t");}).toThrow();
      expect(() => {TypeToken["sort"]("with space");}).toThrow();
    });
  });

  describe("Post Conditions", () =>
  {
    test("Punctuation and Operator", () => 
    {
      expect(TypeToken["sort"]("(")).toBe(TypeTokenSort.LeftRoundBracket);
      expect(TypeToken["sort"](")")).toBe(TypeTokenSort.RightRoundBracket);
      expect(TypeToken["sort"]("[")).toBe(TypeTokenSort.LeftSquareBracket);
      expect(TypeToken["sort"]("]")).toBe(TypeTokenSort.RightSquareBracket);
      expect(TypeToken["sort"](",")).toBe(TypeTokenSort.Comma);
      expect(TypeToken["sort"]("->")).toBe(TypeTokenSort.CompositionOperator);
    });

    test("Primitive Types", () =>
    {
      expect(TypeToken["sort"]("i")).toBe(TypeTokenSort.PrimitiveType);
      expect(TypeToken["sort"]("o")).toBe(TypeTokenSort.PrimitiveType);
      expect(TypeToken["sort"]("Something")).toBe(TypeTokenSort.PrimitiveType);
      expect(TypeToken["sort"]("something")).toBe(TypeTokenSort.PrimitiveType);
      expect(TypeToken["sort"]("var923")).toBe(TypeTokenSort.PrimitiveType);
      expect(TypeToken["sort"]("SoMeThiNG")).toBe(TypeTokenSort.PrimitiveType);
    });
  });
});

describe("toString()", () =>
{
  describe("Post Condtions", () =>
  {
    test("", () =>
    {
      expect(new TypeToken("simple").toString()).toBe("simple");
    });
  });
});

describe("getSort()", () => 
{
  describe("Post Conditions", () =>
  {
    test("", () =>
    {
      expect(new TypeToken("simple").getSort()).toBe(TypeTokenSort.PrimitiveType);
    });
  });
});

describe("isEqual", () =>
{
  describe("Post Conditions", () =>
  {
    test("Equal tokens", () =>
    {
      expect(new TypeToken("simple").isEqual(new TypeToken("simple"))).toBe(true);
    });

    test("Comparing TypeToken with arbitrary object", () =>
    {
      expect(new TypeToken("simple").isEqual({string: "simple", sort: TypeTokenSort.PrimitiveType} as any)).toBe(false);
    });
  });
});


