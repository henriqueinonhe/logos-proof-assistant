import { TypeParser } from "../../src/Type/TypeParser";
import { TypeTokenString } from "../../src/Type/TypeTokenString";
import fs from "fs";
import { TypeParseTreeNode } from "../../src/Type/TypeParseTreeNode";

TypeParser.parse("[o, o] -> (o -> o)");


// const tree = TypeParser.parse("[o, o] -> (o -> o)");
// fs.writeFileSync("./test.json", JSON.stringify(tree.getRoot()["reducedNodeObject"](), null, 2));

describe("typeStringIsPrimitiveType() - private", () =>
{
  const typeStringIsPrimitiveType = TypeParser["typeStringIsPrimitiveType"];
  
  describe("Post Conditions", () =>
  {
    test("Single character tokens", () =>
    {
      expect(typeStringIsPrimitiveType(new TypeTokenString("i"))).toBe(true);
      expect(typeStringIsPrimitiveType(new TypeTokenString("o"))).toBe(true);
      expect(typeStringIsPrimitiveType(new TypeTokenString("k"))).toBe(true);
    });

    test("Multiple character tokens", () =>
    {
      expect(typeStringIsPrimitiveType(new TypeTokenString("Proposition"))).toBe(true);
      expect(typeStringIsPrimitiveType(new TypeTokenString("Fred"))).toBe(true);
    });

    test("Composotional Types", () =>
    {
      expect(typeStringIsPrimitiveType(new TypeTokenString("i -> o"))).toBe(false);
      expect(typeStringIsPrimitiveType(new TypeTokenString("i -> i -> o"))).toBe(false);
    });

    test("Product Incomplete Types", () =>
    {
      expect(typeStringIsPrimitiveType(new TypeTokenString("[i,o]"))).toBe(false);
    });

    test ("Malformed", () =>
    {
      expect(typeStringIsPrimitiveType(new TypeTokenString(","))).toBe(false);
      expect(typeStringIsPrimitiveType(new TypeTokenString("[]"))).toBe(false);
      expect(typeStringIsPrimitiveType(new TypeTokenString("("))).toBe(false);
    });
  });
});

describe("parse()", () =>
{
  describe("Pre Conditions", () =>
  {
    //Fail
    test("Empty string", () =>
    {
      expect(() => TypeParser.parse("")).toThrow("Type string cannot be empty!");
      expect(() => TypeParser.parse(" ")).toThrow("Type string cannot be empty!");
    });
    
    test("Premature end of string", () =>
    {
      expect(() => TypeParser.parse("i -> ")).toThrow(`Premature end of string where a primitive type, or a "(" was expected!`);
      expect(() => TypeParser.parse("[i, o]")).toThrow(`Premature end of string where a "->" was expected!`);
    });

    test("String should have ended", () =>
    {
      expect(() => TypeParser.parse("i -> o a")).toThrow("String should have ended!");
      expect(() => TypeParser.parse("i -> o ,")).toThrow("String should have ended!");
      expect(() => TypeParser.parse("i -> o (")).toThrow("String should have ended!");
      expect(() => TypeParser.parse("i -> o )")).toThrow("String should have ended!");
    });

    test("Missing composition operator", () =>
    {
      expect(() => TypeParser.parse("i o")).toThrow(`Found a "o" where a "->" was expected!`);
      expect(() => TypeParser.parse("(i]->o")).toThrow(`Found a "]" where a "->" was expected!`);
    });

    test("<prim> -> <comp>)", () =>
    {
      expect(() => TypeParser.parse("i -> i -> i)")).toThrow("String should have ended!");
    });
    
    test("<prim> -> (<comp>", () =>
    {
      expect(() => TypeParser.parse("i -> (i -> i")).toThrow(`Premature end of string where a ")" was expected!`);
    });

    test("<prim> -> <comp>", () =>
    {
      expect(() => TypeParser.parse("i -> i -> i")).toThrow("String should have ended!");
    });

    test("Missing closing right square bracket", () =>
    {
      expect(() => TypeParser.parse("[i, o -> o")).toThrow(`Premature end of string where a ",", or a "]" was expected!`);
    });

    test("Missing opening left square bracket", () =>
    {
      expect(() => TypeParser.parse("i, o] -> o")).toThrow(`Found a "," where a "->" was expected!`);
    });

    test("Missing comma", () =>
    {
      expect(() => TypeParser.parse("[i -> i o] -> o")).toThrow();
    });

    test("Product types must have at least two arguments", () =>
    {
      expect(() => TypeParser.parse("[i]->o")).toThrow("2 arguments");
    });

    test("Other weird stuff", () =>
    {
      expect(() => TypeParser.parse("[,]->o")).toThrow(`Found a "," where a primitive type, "(", or a "[" was expected!`);
      expect(() => TypeParser.parse("((o->o))->o")).toThrow(`Found a ")" where a "->" was expected!`);
      expect(() => TypeParser.parse("o->([a,b,c->d])")).toThrow(`Found a ")" where a "->" was expected!`);
    });

    //Pass
    test("<prim>", () =>
    {
      expect(() => TypeParser.parse("i")).not.toThrow();
      expect(() => TypeParser.parse("o")).not.toThrow();
      expect(() => TypeParser.parse("  Dobs  ")).not.toThrow();
      expect(() => TypeParser.parse("  __isdsa_disa8 ")).not.toThrow();
    });

    test("<prim> -> <prim>", () =>
    {
      expect(() => TypeParser.parse("i -> o")).not.toThrow();
      expect(() => TypeParser.parse("Proposition -> Proposition")).not.toThrow();
    });

    test("<prim> -> (<comp>)", () =>
    {
      expect(() => TypeParser.parse("i -> (i -> i)")).not.toThrow();
    });

    test("(<comp>) -> <prim>", () =>
    {
      expect(() => TypeParser.parse("(o -> o) -> o")).not.toThrow();
    });

    test("(<comp>) -> (<comp>)", () =>
    {
      expect(() => TypeParser.parse("(o -> o) -> (i -> o)")).not.toThrow();
    });

    test("<prod> -> <prim>", () =>
    {
      expect(() => TypeParser.parse("[i, i] -> i")).not.toThrow();
    });

    test("<prod> -> (<comp>)", () =>
    {
      expect(() => TypeParser.parse("[o, o] -> (o -> o)")).not.toThrow();
    });

    test("Complex product types", () =>
    {
      expect(() => TypeParser.parse("[i -> i, o -> (i -> o), i, i, a] -> i")).not.toThrow();
      expect(() => TypeParser.parse("[[i, i, (i -> o) -> o] -> i, o -> o] -> i")).not.toThrow();
    });

    test("Complex composition types", () =>
    {
      expect(() => TypeParser.parse("(((i->i)->i)->o)->a")).not.toThrow();
    });
  });

  describe("Post Conditions", () =>
  {
    test("<prim>", () =>
    {
      expect(TypeParser.parse("i").getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "i",
        "mainOperator": "Primitive",
        "substringBeginOffset": 0,
        "substringEndOffset": 0,
        "children": []
      });
      expect(TypeParser.parse("o").getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "o",
        "mainOperator": "Primitive",
        "substringBeginOffset": 0,
        "substringEndOffset": 0,
        "children": []
      });
      expect(TypeParser.parse("  Dobs  ").getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "Dobs",
        "mainOperator": "Primitive",
        "substringBeginOffset": 0,
        "substringEndOffset": 0,
        "children": []
      });
      expect(TypeParser.parse("  __isdsa_disa8 ").getRoot()["reducedNodeObject"]()).toStrictEqual({
        "typeString": "__isdsa_disa8",
        "mainOperator": "Primitive",
        "substringBeginOffset": 0,
        "substringEndOffset": 0,
        "children": []
      });
    });

    test("<prim> -> <prim>", () =>
    {
      expect(TypeParser.parse("i -> o").getRoot()["reducedNodeObject"]()).toStrictEqual({
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
      expect(TypeParser.parse("Proposition -> Proposition").getRoot()["reducedNodeObject"]()).toStrictEqual({
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
      expect(TypeParser.parse("i -> (i -> i)").getRoot()["reducedNodeObject"]()).toStrictEqual({
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
      expect(TypeParser.parse("(o -> o) -> o").getRoot()["reducedNodeObject"]()).toStrictEqual({
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
      expect(TypeParser.parse("[i, i] -> i").getRoot()["reducedNodeObject"]()).toStrictEqual({
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
      expect(TypeParser.parse("[o, o] -> (o -> o)").getRoot()["reducedNodeObject"]()).toStrictEqual({
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

