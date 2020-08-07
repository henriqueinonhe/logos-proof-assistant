import { TokenString } from "../../src/Token/TokenString";
import { Token } from "../../src/Token/Token";

describe("constructor", () =>
{
  describe("Post Conditions", () =>
  {
    test("Internal tokenList is initialized to input tokenList", () =>
    {
      const tokenList = ["a", "+", "b"].map(string => new Token(string));
      expect(new TokenString(tokenList)["tokenList"].map(token => token.toString()).join(" ")).toBe("a + b");
    });

    test("Token list argument is passed by value", () =>
    {
      const tokenList = ["A", "->", "B"].map(string => new Token(string));
      const tokenString = new TokenString(tokenList);
      tokenList[0] = new Token("X");
      expect(tokenString["tokenList"][0].toString()).toBe("A");
    });
  });
});

describe("toString()", () =>
{
  describe("Post Conditions", () =>
  {
    const tokenList = ["A", " ", "->", " ", "B"].map(string => new Token(string));
    expect(new TokenString(tokenList).toString()).toBe("A -> B");
  });
});

describe("getTokenList()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Modifying returned token list doesn't affect internal token list", () =>
    {
      const tokenList = ["f", "(", "a", ")"].map(string => new Token(string));
      const tokenString = new TokenString(tokenList);
      tokenString.getTokenList()[0] = new Token("g");
      expect(tokenString.toString()).toBe("f(a)");
    });
  });
});

describe("fromStringArray()", () =>
{
  describe("Post Conditions", () =>
  {
    test("TokenString is constructed correctly", () =>
    {
      expect(TokenString.fromStringArray(["x", "-", "y"]).toString()).toBe("x-y");
    });
  });
});

describe("isEmpty()", () =>
{
  describe("Post Conditions", () =>
  {
    test("True", () =>
    {
      expect(new TokenString([]).isEmpty()).toBe(true);
    });

    test("False", () =>
    {
      expect(TokenString.fromStringArray(["j"]).isEmpty()).toBe(false);
    });
  });
});

describe("tokenAt", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Index out of bounds", () =>
    {
      expect(() => TokenString.fromStringArray(["a", "b"]).tokenAt(3)).toThrow("associated with");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Happy path", () =>
    {
      expect(TokenString.fromStringArray(["a", "b", "c"]).tokenAt(1).toString()).toBe("b");
    });
  });
});


describe("isEqual()", () =>
{
  describe("Post Conditions", () =>
  {
    test("One is substring of the other", () =>
    {
      expect(TokenString.fromStringArray(["a", "b", "c"]).isEqual(TokenString.fromStringArray(["a", "b"]))).toBe(false);
      expect(TokenString.fromStringArray(["a", "b"]).isEqual(TokenString.fromStringArray(["a", "b", "c"]))).toBe(false);
    });

    test("True", () =>
    {
      expect(TokenString.fromStringArray(["a", "b", "c"]).isEqual(TokenString.fromStringArray(["a", "b", "c"]))).toBe(true);
    });

    test("Same string representation, but different tokenization", () =>
    {
      expect(TokenString.fromStringArray(["ab", "c"]).isEqual(TokenString.fromStringArray(["a", "bc"]))).toBe(false);
    });
  });
});

describe("size()", () =>
{
  describe("Post Conditions", () =>
  {
    test("", () =>
    {
      expect(TokenString.fromStringArray(["Dobs", "dubs"]).size()).toBe(2);
    });
  });
});

describe("slice()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("startIndex out of bounds", () =>
    {
      expect(() => TokenString.fromStringArray(["a", "b", "c"]).slice(3, 2)).toThrow("no element associated");
    });

    test("endIndex out of bounds", () =>
    {
      expect(() => TokenString.fromStringArray(["a", "b", "c"]).slice(2, 4)).toThrow("out of bounds");
    });
  });

  describe("Post Conditions", () =>
  {
    const tokenString = TokenString.fromStringArray(["Proposition", "->", "Proposition"]);
    test("No arguments", () =>
    {
      expect(tokenString.slice().isEqual(tokenString)).toBe(true);
    });

    test("Single argument", () =>
    {
      expect(tokenString.slice(1).toString()).toBe("->Proposition");
    });

    test("Two arguments", () =>
    {
      expect(tokenString.slice(1, 2).toString()).toBe("->");
    });
  });
});

describe("startsWith()", () =>
{
  describe("Post Conditions", () =>
  {
    test("This is substring of other", () =>
    {
      const tokenString1 = TokenString.fromStringArray(["a", "b", "c"]);
      const tokenString2 = TokenString.fromStringArray(["a", "b", "c", "d"]);
      expect(tokenString1.startsWith(tokenString2)).toBe(false);
    });

    test("True", () =>
    {
      const tokenString1 = TokenString.fromStringArray(["a", "b", "c"]);
      const tokenString2 = TokenString.fromStringArray(["a", "b", "c", "d"]);
      expect(tokenString2.startsWith(tokenString1)).toBe(true);
    });

    test("False", () =>
    {
      const tokenString1 = TokenString.fromStringArray(["ads", "dsd"]);
      const tokenString2 = TokenString.fromStringArray(["ass", "dsd"]);
      expect(tokenString1.startsWith(tokenString2)).toBe(false);
    });
  });
});

describe("endsWith()", () =>
{
  describe("Post Conditions", () =>
  {
    test("This is substring of other", () =>
    {
      const tokenString1 = TokenString.fromStringArray(["b", "c", "d"]);
      const tokenString2 = TokenString.fromStringArray(["a", "b", "c", "d"]);
      expect(tokenString1.endsWith(tokenString2)).toBe(false);
    });

    test("True", () =>
    {
      const tokenString1 = TokenString.fromStringArray(["b", "c", "d"]);
      const tokenString2 = TokenString.fromStringArray(["a", "b", "c", "d"]);
      expect(tokenString2.endsWith(tokenString1)).toBe(true);
    });

    test("False", () =>
    {
      const tokenString1 = TokenString.fromStringArray(["ada", "dad"]);
      const tokenString2 = TokenString.fromStringArray(["ada", "dsd"]);
      expect(tokenString1.endsWith(tokenString2)).toBe(false);
    });
  });
});

describe("clone()", () =>
{
  describe("Post Conditions", () =>
  {
    test("TokenString is deep copied", () =>
    {
      expect(TokenString.fromStringArray(["Dobs", "dibs"]).clone().toString()).toBe("Dobsdibs");
    });

    test("Modifying clone doesn't affect original", () =>
    {
      const original = TokenString.fromStringArray(["x", "*", "y"]);
      const clone = original.clone();

      clone["tokenList"][0] = new Token("S");
      expect(original.tokenAt(0).toString()).toBe("x");
    });
  });
});

describe("includes()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Start index must be within bounds", () =>
    {
      expect(() => TokenString.fromStringArray(["a", "b", "c"]).includes(TokenString.fromStringArray(["c", "d"]), 3)).toThrow("associated with");
    });
  });

  describe("Post Conditions", () =>
  {
    test("True", () =>
    {
      expect(TokenString.fromStringArray(["y", "a", "d", "d", "a", "D", "u", "d", "a", "d", "a", "b", "a"]).includes(TokenString.fromStringArray(["y"]))).toBe(true);
      expect(TokenString.fromStringArray(["y", "a", "d", "d", "a", "D", "u", "d", "a", "d", "a", "b", "a"]).includes(TokenString.fromStringArray(["y", "a"]))).toBe(true);
      expect(TokenString.fromStringArray(["y", "a", "d", "d", "a", "D", "u", "d", "a", "d", "a", "b", "a"]).includes(TokenString.fromStringArray(["y", "a", "d", "d", "a"]))).toBe(true);
      expect(TokenString.fromStringArray(["Prop", "->", "Prop", "->", "Individual"]).includes(TokenString.fromStringArray(["Individual"]))).toBe(true);
      expect(TokenString.fromStringArray(["Prop", "->", "Prop", "->", "Individual"]).includes(TokenString.fromStringArray(["Prop",  "->", "Individual"]))).toBe(true);
      expect(TokenString.fromStringArray(["Prop", "->", "Prop", "->", "Individual"]).includes(TokenString.fromStringArray(["Prop", "->", "Prop", "->", "Individual"]))).toBe(true);
      expect(TokenString.fromStringArray(["A", "A", "B", "B", "A", "A"]).includes(TokenString.fromStringArray(["A", "B", "B", "A"]))).toBe(true);
    });

    test("False", () =>
    {
      expect(TokenString.fromStringArray(["y", "a", "d", "d", "a", "D", "u", "d", "a", "d", "a", "b", "a"]).includes(TokenString.fromStringArray(["a", "y"]))).toBe(false);
      expect(TokenString.fromStringArray(["y", "a", "d", "d", "a", "D", "u", "d", "a", "d", "a", "b", "a"]).includes(TokenString.fromStringArray(["d", "a", "a", "a"]))).toBe(false);
    });
  });
});