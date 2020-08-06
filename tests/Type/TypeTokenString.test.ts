import { TypeTokenString } from "../../src/Type/TypeTokenString";

describe("constructor", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Empty TypeTokenString", () =>
    {
      expect(() => {new TypeTokenString("");}).not.toThrow();
    });
  
    test("Handling Whitespace", () =>
    {
      expect(() => {new TypeTokenString("i -> o");}).not.toThrow();
      expect(() => {new TypeTokenString("i-> o");}).not.toThrow();
      expect(() => {new TypeTokenString("asdasdasd              -> o");}).not.toThrow();
      expect(() => {new TypeTokenString("[Prim -> -> Dobs ( ) ) ) )]");}).not.toThrow();
      expect(() => {new TypeTokenString("(A -> B) -> \n C");}).not.toThrow();
      expect(() => {new TypeTokenString("[D,E,F] ->\t A");}).not.toThrow();
      expect(() => {new TypeTokenString("   ");}).not.toThrow();
    });
  
    test("Incomplete Composition Operator", () =>
    {
      const regex = /The composition operator is incomplete!/;
      expect(() => {new TypeTokenString("c-d");}).toThrow(regex);
      expect(() => {new TypeTokenString("Prop - > Prop");}).toThrow(regex);
      expect(() => {new TypeTokenString("A  -");}).toThrow(regex);
    });
  
    test("Invalid TypeTokens", () =>
    {
      const regex = /is not a suitable TypeToken!/;
      expect(() => {new TypeTokenString("Prop > Prop");}).toThrow(regex);
      expect(() => {new TypeTokenString("[a.b]->c");}).toThrow(regex);
      expect(() => {new TypeTokenString(";");}).toThrow(regex);
      expect(() => {new TypeTokenString("Prop > Prop");})
        .toThrow(`Invalid Argument!\n">" is not a suitable TypeToken!\nProp > Prop\n     ^     `);
      expect(() => {new TypeTokenString("[a.b]->c");})
        .toThrow(`Invalid Argument!\n"a.b" is not a suitable TypeToken!\n[a.b]->c\n ^^^    `);
    });
  
    
  });

  describe("Post Conditions", () =>
  {
    test("Empty TypeTokenString", () =>
    {
      expect(new TypeTokenString("")["tokenList"].map(t => t.toString()).join("")).toBe("");
    });

    test("Lexing Correctly", () =>
    {
      expect(new TypeTokenString("i -> o")["tokenList"]
        .map(t => t.toString()).join("")).toBe("i->o");

      expect(new TypeTokenString("i-> o")["tokenList"]
        .map(t => t.toString()).join("")).toBe("i->o");

      expect(new TypeTokenString("asdasdasd              -> o")["tokenList"]
        .map(t => t.toString()).join("")).toBe("asdasdasd->o");

      expect(new TypeTokenString("[Prim -> -> Dobs ( ) ) ) )]")["tokenList"]
        .map(t => t.toString()).join("")).toBe("[Prim->->Dobs())))]");
        
      expect(new TypeTokenString("   ")["tokenList"]
        .map(t => t.toString()).join("")).toBe("");
    });

    test("Handling Whitespace", () =>
    {
      expect(new TypeTokenString("i -> o")["tokenList"]
        .map(t => t.toString()).join("")).toBe("i->o");

      expect(new TypeTokenString("i-> o")["tokenList"]
        .map(t => t.toString()).join("")).toBe("i->o");

      expect(new TypeTokenString("asdasdasd              -> o")["tokenList"]
        .map(t => t.toString()).join("")).toBe("asdasdasd->o");

      expect(new TypeTokenString("[Prim -> -> Dobs ( ) ) ) )]")["tokenList"]
        .map(t => t.toString()).join("")).toBe("[Prim->->Dobs())))]");

      expect(new TypeTokenString("   ")["tokenList"]
        .map(t => t.toString()).join("")).toBe("");

      expect(new TypeTokenString(" [     i  , i   ]  ->  o     ")["tokenList"]
        .map(t => t.toString()).join("")).toBe("[i,i]->o");
    });
  });
});

describe("toString()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Generic cases", () =>
    {
      expect(new TypeTokenString("i -> o")
        .toString()).toBe("i->o");

      expect(new TypeTokenString("i-> o")
        .toString()).toBe("i->o");

      expect(new TypeTokenString("asdasdasd              -> o")
        .toString()).toBe("asdasdasd->o");

      expect(new TypeTokenString("[Prim -> -> Dobs ( ) ) ) )]")
        .toString()).toBe("[Prim->->Dobs())))]");

      expect(new TypeTokenString("   ")
        .toString()).toBe("");

      expect(new TypeTokenString(" [     i  , i   ]  ->  o     ")
        .toString()).toBe("[i,i]->o");
    });

    test("Adjacent primitive tokens are spaced up correctly", () =>
    {
      expect(new TypeTokenString("[SomePrimitiveType OtherPrimitiveType] -> o")
        .toString()).toBe("[SomePrimitiveType OtherPrimitiveType]->o");
    });
  });
});

describe("getTokenList()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Mutating the retrieved array doesn't afffect the original", () =>
    {
      const string = new TypeTokenString("[i,i]->i");
      const tokenList = string.getTokenList();
      tokenList.reverse();
      expect(tokenList.map(t => t.toString()).join("")).toBe("i->]i,i[");
      expect(string.toString()).toBe("[i,i]->i");
    });
  });
});

describe("size()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Default", () =>
    {
      expect(new TypeTokenString("Dubbets->Dobbets").size()).toBe(3);
    });
  });
});

describe("isEqual()", () =>
{
  describe("Post Conditions", () =>
  {
    expect(new TypeTokenString("Prop -> Prop -> Prop").isEqual(new TypeTokenString("Prop->Prop->Prop"))).toBe(true);

    expect(new TypeTokenString("Prop -> Pro -> Prop").isEqual(new TypeTokenString("Prop->Prop->Prop"))).toBe(false);
  });
});

describe("slice()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("beginOffset must be an integer", () =>
    {
      expect(() => {new TypeTokenString("[i,i,o]->o->o").slice(1.2, 2);}).toThrow(/beginOffset is expected to be an integer/);
    });

    test("endOffset must be an integer", () => 
    {
      expect(() => {new TypeTokenString("[i,i,o]->o->o").slice(1, 5.7);}).toThrow(/endOffset is expected to be an integer/);
    });
  
    test("beginOffset must be >= 0", () =>
    {
      expect(() => {new TypeTokenString("[i,i,o]->o->o").slice(-2, 3);}).toThrow(/beginOffset is expected to be a positive number/);
    });

    test("endOffset must be >= 0", () =>
    {
      expect(() => {new TypeTokenString("[i,i,o]->o->o").slice(2, -3);}).toThrow(/endOffset is expected to be a positive number/);
    });

    test("endOffset must be <= tokenString.length", () =>
    {
      expect(() => {new TypeTokenString("[i,i,o]->o->o").slice(0, 20);}).toThrow(/endOffset is expected to be <= tokenList/);
    });
  });

  describe("Post Conditions", () =>
  {
    test("", () =>
    {
      expect(new TypeTokenString("[i,i,o]->o->o").slice(0, 7).toString()).toBe("[i,i,o]");
      expect(new TypeTokenString("[i,i,o]->o->o").slice(7, 8).toString()).toBe("->");
      expect(new TypeTokenString("[i,i,o]->o->o").slice(8, 11).toString()).toBe("o->o");
    });
  });
});

describe("tokenAt()", () =>
{
  describe("Pre Conditions", () =>
  {
    const dummyString = new TypeTokenString("[i,o]->o");
    expect(() => {dummyString.tokenAt(-1);}).toThrow();
    expect(() => {dummyString.tokenAt(2.3);}).toThrow();
    expect(() => {dummyString.tokenAt(222);}).toThrow();
  });
});