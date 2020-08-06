import { Type } from "../../src/Type/Type";

describe("constructor", () =>
{
  //These pre and post conditions are exactly the same as the TypeParser parse method
  //ones, so both sections will be the same.
  describe("Pre Conditions", () =>
  {
    //Fail
    test("Empty string", () =>
    {
      expect(() => new Type("")).toThrow("Type string cannot be empty!");
      expect(() => new Type(" ")).toThrow("Type string cannot be empty!");
    });
    
    test("Premature end of string", () =>
    {
      expect(() => new Type("i -> ")).toThrow(`Premature end of string where a primitive type, or a "(" was expected!`);
      expect(() => new Type("[i, o]")).toThrow(`Premature end of string where a "->" was expected!`);
    });

    test("String should have ended", () =>
    {
      expect(() => new Type("i -> o a")).toThrow("String should have ended!");
      expect(() => new Type("i -> o ,")).toThrow("String should have ended!");
      expect(() => new Type("i -> o (")).toThrow("String should have ended!");
      expect(() => new Type("i -> o )")).toThrow("String should have ended!");
    });

    test("Missing composition operator", () =>
    {
      expect(() => new Type("i o")).toThrow(`Found a "o" where a "->" was expected!`);
      expect(() => new Type("(i]->o")).toThrow(`Found a "]" where a "->" was expected!`);
    });

    test("<prim> -> <comp>)", () =>
    {
      expect(() => new Type("i -> i -> i)")).toThrow("String should have ended!");
    });
    
    test("<prim> -> (<comp>", () =>
    {
      expect(() => new Type("i -> (i -> i")).toThrow(`Premature end of string where a ")" was expected!`);
    });

    test("<prim> -> <comp>", () =>
    {
      expect(() => new Type("i -> i -> i")).toThrow("String should have ended!");
    });

    test("Missing closing right square bracket", () =>
    {
      expect(() => new Type("[i, o -> o")).toThrow(`Premature end of string where a ",", or a "]" was expected!`);
    });

    test("Missing opening left square bracket", () =>
    {
      expect(() => new Type("i, o] -> o")).toThrow(`Found a "," where a "->" was expected!`);
    });

    test("Missing comma", () =>
    {
      expect(() => new Type("[i -> i o] -> o")).toThrow();
    });

    test("Product types must have at least two arguments", () =>
    {
      expect(() => new Type("[i]->o")).toThrow("2 arguments");
    });

    test("Other weird stuff", () =>
    {
      expect(() => new Type("[,]->o")).toThrow(`Found a "," where a primitive type, "(", or a "[" was expected!`);
      expect(() => new Type("((o->o))->o")).toThrow(`Found a ")" where a "->" was expected!`);
      expect(() => new Type("o->([a,b,c->d])")).toThrow(`Found a ")" where a "->" was expected!`);
    });

    //Pass
    test("<prim>", () =>
    {
      expect(() => new Type("i")).not.toThrow();
      expect(() => new Type("o")).not.toThrow();
      expect(() => new Type("  Dobs  ")).not.toThrow();
      expect(() => new Type("  __isdsa_disa8 ")).not.toThrow();
    });

    test("<prim> -> <prim>", () =>
    {
      expect(() => new Type("i -> o")).not.toThrow();
      expect(() => new Type("Proposition -> Proposition")).not.toThrow();
    });

    test("<prim> -> (<comp>)", () =>
    {
      expect(() => new Type("i -> (i -> i)")).not.toThrow();
    });

    test("(<comp>) -> <prim>", () =>
    {
      expect(() => new Type("(o -> o) -> o")).not.toThrow();
    });

    test("(<comp>) -> (<comp>)", () =>
    {
      expect(() => new Type("(o -> o) -> (i -> o)")).not.toThrow();
    });

    test("<prod> -> <prim>", () =>
    {
      expect(() => new Type("[i, i] -> i")).not.toThrow();
    });

    test("<prod> -> (<comp>)", () =>
    {
      expect(() => new Type("[o, o] -> (o -> o)")).not.toThrow();
    });

    test("Complex product types", () =>
    {
      expect(() => new Type("[i -> i, o -> (i -> o), i, i, a] -> i")).not.toThrow();
      expect(() => new Type("[[i, i, (i -> o) -> o] -> i, o -> o] -> i")).not.toThrow();
    });

    test("Complex composition types", () =>
    {
      expect(() => new Type("(((i->i)->i)->o)->a")).not.toThrow();
    });

  });

  describe("Post Conditions", () =>
  {
    test("<prim>", () =>
    {
      expect(new Type("i").getParseTree().getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "i",
        "mainOperator": "Primitive",
        "substringBeginOffset": 0,
        "substringEndOffset": 0,
        "children": []
      });
      expect(new Type("o").getParseTree().getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "o",
        "mainOperator": "Primitive",
        "substringBeginOffset": 0,
        "substringEndOffset": 0,
        "children": []
      });
      expect(new Type("  Dobs  ").getParseTree().getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "Dobs",
        "mainOperator": "Primitive",
        "substringBeginOffset": 0,
        "substringEndOffset": 0,
        "children": []
      });
      expect(new Type("  __isdsa_disa8 ").getParseTree().getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "__isdsa_disa8",
        "mainOperator": "Primitive",
        "substringBeginOffset": 0,
        "substringEndOffset": 0,
        "children": []
      });
    });

    test("<prim> -> <prim>", () =>
    {
      expect(new Type("i -> o").getParseTree().getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "i->o",
        "mainOperator": "Composition",
        "substringBeginOffset": 0,
        "substringEndOffset": 2,
        "children": [
          {
            "typeString": "i",
            "mainOperator": "Primitive",
            "substringBeginOffset": 0,
            "substringEndOffset": 0,
            "children": []
          },
          {
            "typeString": "o",
            "mainOperator": "Primitive",
            "substringBeginOffset": 2,
            "substringEndOffset": 2,
            "children": []
          }
        ]
      });
      expect(new Type("Proposition -> Proposition").getParseTree().getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "Proposition->Proposition",
        "mainOperator": "Composition",
        "substringBeginOffset": 0,
        "substringEndOffset": 2,
        "children": [
          {
            "typeString": "Proposition",
            "mainOperator": "Primitive",
            "substringBeginOffset": 0,
            "substringEndOffset": 0,
            "children": []
          },
          {
            "typeString": "Proposition",
            "mainOperator": "Primitive",
            "substringBeginOffset": 2,
            "substringEndOffset": 2,
            "children": []
          }
        ]
      });
    });

    test("<prim> -> (<comp>)", () =>
    {
      expect(new Type("i -> (i -> i)").getParseTree().getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "i->(i->i)",
        "mainOperator": "Composition",
        "substringBeginOffset": 0,
        "substringEndOffset": 6,
        "children": [
          {
            "typeString": "i",
            "mainOperator": "Primitive",
            "substringBeginOffset": 0,
            "substringEndOffset": 0,
            "children": []
          },
          {
            "typeString": "i->i",
            "mainOperator": "Composition",
            "substringBeginOffset": 3,
            "substringEndOffset": 5,
            "children": [
              {
                "typeString": "i",
                "mainOperator": "Primitive",
                "substringBeginOffset": 3,
                "substringEndOffset": 3,
                "children": []
              },
              {
                "typeString": "i",
                "mainOperator": "Primitive",
                "substringBeginOffset": 5,
                "substringEndOffset": 5,
                "children": []
              }
            ]
          }
        ]
      });
    });

    test("(<comp>) -> <prim>", () =>
    {
      expect(new Type("(o -> o) -> o").getParseTree().getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "(o->o)->o",
        "mainOperator": "Composition",
        "substringBeginOffset": 0,
        "substringEndOffset": 6,
        "children": [
          {
            "typeString": "o->o",
            "mainOperator": "Composition",
            "substringBeginOffset": 1,
            "substringEndOffset": 3,
            "children": [
              {
                "typeString": "o",
                "mainOperator": "Primitive",
                "substringBeginOffset": 1,
                "substringEndOffset": 1,
                "children": []
              },
              {
                "typeString": "o",
                "mainOperator": "Primitive",
                "substringBeginOffset": 3,
                "substringEndOffset": 3,
                "children": []
              }
            ]
          },
          {
            "typeString": "o",
            "mainOperator": "Primitive",
            "substringBeginOffset": 6,
            "substringEndOffset": 6,
            "children": []
          }
        ]
      });
    });

    test("<prod> -> <prim>", () =>
    {
      expect(new Type("[i, i] -> i").getParseTree().getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "[i,i]->i",
        "mainOperator": "Composition",
        "substringBeginOffset": 0,
        "substringEndOffset": 6,
        "children": [
          {
            "typeString": "[i,i]",
            "mainOperator": "Product",
            "substringBeginOffset": 0,
            "substringEndOffset": 4,
            "children": [
              {
                "typeString": "i",
                "mainOperator": "Primitive",
                "substringBeginOffset": 1,
                "substringEndOffset": 1,
                "children": []
              },
              {
                "typeString": "i",
                "mainOperator": "Primitive",
                "substringBeginOffset": 3,
                "substringEndOffset": 3,
                "children": []
              }
            ]
          },
          {
            "typeString": "i",
            "mainOperator": "Primitive",
            "substringBeginOffset": 6,
            "substringEndOffset": 6,
            "children": []
          }
        ]
      });
    });

    test("<prod> -> (<comp>)", () =>
    {
      expect(new Type("[o, o] -> (o -> o)").getParseTree().getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "[o,o]->(o->o)",
        "mainOperator": "Composition",
        "substringBeginOffset": 0,
        "substringEndOffset": 10,
        "children": [
          {
            "typeString": "[o,o]",
            "mainOperator": "Product",
            "substringBeginOffset": 0,
            "substringEndOffset": 4,
            "children": [
              {
                "typeString": "o",
                "mainOperator": "Primitive",
                "substringBeginOffset": 1,
                "substringEndOffset": 1,
                "children": []
              },
              {
                "typeString": "o",
                "mainOperator": "Primitive",
                "substringBeginOffset": 3,
                "substringEndOffset": 3,
                "children": []
              }
            ]
          },
          {
            "typeString": "o->o",
            "mainOperator": "Composition",
            "substringBeginOffset": 7,
            "substringEndOffset": 9,
            "children": [
              {
                "typeString": "o",
                "mainOperator": "Primitive",
                "substringBeginOffset": 7,
                "substringEndOffset": 7,
                "children": []
              },
              {
                "typeString": "o",
                "mainOperator": "Primitive",
                "substringBeginOffset": 9,
                "substringEndOffset": 9,
                "children": []
              }
            ]
          }
        ]
      });
    });
  });
});

describe("toString()", () =>
{
  describe("Post Conditions", () =>
  {
    test("", () =>
    {
      expect(new Type("[[i, i] -> i, i, i] -> i").toString()).toBe("[[i,i]->i,i,i]->i");
    });
  });
});

describe("isPrimitive()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Primitive Types", () =>
    {
      expect(new Type("i").isPrimitive()).toBe(true);
      expect(new Type("o").isPrimitive()).toBe(true);
      expect(new Type("Proposition").isPrimitive()).toBe(true);
      expect(new Type("Number").isPrimitive()).toBe(true);
    });

    test("Composite Types", () =>
    {
      expect(new Type("i -> o").isPrimitive()).toBe(false);
      expect(new Type("o -> o").isPrimitive()).toBe(false);
      expect(new Type("[i, i] -> o").isPrimitive()).toBe(false);
    });
  });
});

describe("getReturnType()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Primitive Types", () =>
    {
      expect(() => new Type("i").getReturnType()).toThrow("Primitive types have no return type!");
      expect(() => new Type("o").getReturnType()).toThrow("Primitive types have no return type!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Primitive Types", () =>
    {
      expect(new Type("i -> o").getReturnType().toString()).toBe("o");
      expect(new Type("[i, i] -> o").getReturnType().toString()).toBe("o");
    });

    test("Composite Types", () =>
    {
      expect(new Type("i -> (o -> (o -> o))").getReturnType().toString()).toBe("o->(o->o)");
      expect(new Type("i -> ([i, i, i] -> i)").getReturnType().toString()).toBe("[i,i,i]->i");
    });
  });
});

describe("getArgumentTypes()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Primitive Types", () =>
    {
      expect(() => new Type("i").getArgumentTypes()).toThrow("Primitive types take no arguments!");
      expect(() => new Type("o").getArgumentTypes()).toThrow("Primitive types take no arguments!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Primitive Types", () =>
    {
      expect(new Type("i -> o").getArgumentTypes().join(",")).toBe("i");
    });

    test("Composite Types", () =>
    {
      expect(new Type("(i -> i) -> o").getArgumentTypes().join(",")).toBe("i->i");
      expect(new Type("(i -> (o -> i)) -> o").getArgumentTypes().join(",")).toBe("i->(o->i)");
    });

    test("Product Types", () =>
    {
      expect(new Type("[[i, i] -> i, i, i] -> i").getArgumentTypes().join(",")).toBe("[i,i]->i,i,i");
    });
  });

  describe("apply()", () =>
  {
    describe("Pre Conditions", () =>
    {
      test("Primitive Types", () =>
      {
        expect(() => new Type("i").apply(new Type("i"))).toThrow("Primitive types take no arguments!");
        expect(() => new Type("o").apply(new Type("i"))).toThrow("Primitive types take no arguments!");
      });

      test("Argument types do not conform", () =>
      {
        expect(() => new Type("i->o").apply(new Type("o"))).toThrow("This type expected");
        expect(() => new Type("[i,i]->o").apply(new Type("i"), new Type("o"))).toThrow("This type expected");
      });
    });
  
    describe("Post Conditions", () =>
    {
      test("Single argument", () =>
      {
        expect(new Type("i -> o").apply(new Type("i")).toString()).toBe("o");
        expect(new Type("(i -> i) -> o").apply(new Type("i ->i")).toString()).toBe("o");
      });

      test("Multiple arguments", () =>
      {
        expect(new Type("[[i,i] -> i, i, i] ->i ").apply(new Type("[i,i]->i"), new Type("i"), new Type("i")).toString()).toBe("i");
      });
    });
  });
});