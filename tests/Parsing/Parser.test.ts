import { Parser } from "../../src/Parsing/Parser";
import { LogosLexer } from "../../src/Lexing/LogosLexer";
import { LogosSignature } from "../../src/Lexing/LogosSignature";
import { TypedTokenRecord } from "../../src/Lexing/TypedTokenRecord";
import { Type } from "../../src/Type/Type";
import { ParseTreeBracketNode } from "../../src/Parsing/ParseTreeBracketNode";
import { FunctionalSymbolsAndOperatorsTable } from "../../src/Parsing/FunctionalSymbolsAndOperatorsTable";
import { LinkedList } from "../../src/Utils/LinkedList";
import { ParseTreeNode } from "../../src/Parsing/ParseTreeNode";
import { Lexer } from "../../src/Lexing/Lexer";
import { Signature } from "../../src/Lexing/Signature";

const lexer = new LogosLexer();
const signature = new LogosSignature();
signature.addRecord("0", new TypedTokenRecord(new Type("i")));
signature.addRecord("1", new TypedTokenRecord(new Type("i")));
signature.addRecord("f", new TypedTokenRecord(new Type("i->i")));
signature.addRecord("+", new TypedTokenRecord(new Type("[i,i]->i")));
const symbolTable = new FunctionalSymbolsAndOperatorsTable();
symbolTable.addFunctionalSymbol("f");
Parser.parse("f(1, f(0))", lexer, signature, symbolTable);

describe("private convertTokenStringToNodeListAndHandleBrackets()", () =>
{
  const lexer = new LogosLexer();
  const signature = new LogosSignature();
  signature.addRecord("0", new TypedTokenRecord(new Type("i")));
  signature.addRecord("1", new TypedTokenRecord(new Type("i")));
  signature.addRecord("+", new TypedTokenRecord(new Type("i")));

  describe("Pre Conditions", () =>
  {
    test("Unmatched brackets", () =>
    {
      expect(() => Parser["convertTokenStringToNodeListAndHandleBrackets"](lexer.lex("1 1 ) (", signature))).toThrow("Brackets at the following indexes are unmatched: 6, 4");
      expect(() => Parser["convertTokenStringToNodeListAndHandleBrackets"](lexer.lex(")))1 1 ) (", signature))).toThrow("Brackets at the following indexes are unmatched: 9, 0, 1, 2, 7");
      expect(() => Parser["convertTokenStringToNodeListAndHandleBrackets"](lexer.lex(") ( )1 1 ) (", signature))).toThrow("Brackets at the following indexes are unmatched: 11, 0, 9");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Bracket iterators are properly set and tokens wrapped", () =>
    {
      const tokenWrapperList = Parser["convertTokenStringToNodeListAndHandleBrackets"](lexer.lex("(((0 + 1) + 1) + ((0 + 1) + 1))", signature));
      for(let index = 0; index < tokenWrapperList.size(); index++)
      {
        expect(tokenWrapperList.at(index).substringBeginOffset).toBe(index);
      }

      expect((tokenWrapperList.at(0) as ParseTreeBracketNode).matchingBracketNodeIterator?.get()).toBe(tokenWrapperList.at(30));
      expect((tokenWrapperList.at(1) as ParseTreeBracketNode).matchingBracketNodeIterator?.get()).toBe(tokenWrapperList.at(13));
      expect((tokenWrapperList.at(2) as ParseTreeBracketNode).matchingBracketNodeIterator?.get()).toBe(tokenWrapperList.at(8));
      expect((tokenWrapperList.at(8) as ParseTreeBracketNode).matchingBracketNodeIterator?.get()).toBe(tokenWrapperList.at(2));
      expect((tokenWrapperList.at(13) as ParseTreeBracketNode).matchingBracketNodeIterator?.get()).toBe(tokenWrapperList.at(1));
      expect((tokenWrapperList.at(17) as ParseTreeBracketNode).matchingBracketNodeIterator?.get()).toBe(tokenWrapperList.at(29));
      expect((tokenWrapperList.at(18) as ParseTreeBracketNode).matchingBracketNodeIterator?.get()).toBe(tokenWrapperList.at(24));
    });
  });
});

describe("private proccessFunctionApplicatons()", () =>
{
  //To make testing simpler
  function processString(string : string, lexer : Lexer, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : LinkedList<ParseTreeNode>
  {
    const tokenString = lexer.lex(string, signature);
    const nodeList = Parser["convertTokenStringToNodeListAndHandleBrackets"](tokenString);
    Parser["reduceFunctionApplications"](nodeList, signature, symbolTable, tokenString);
    return nodeList;
  }

  const lexer = new LogosLexer();
  const signature = new LogosSignature();
  const symbolTable = new FunctionalSymbolsAndOperatorsTable;
  signature.addRecord("0", new TypedTokenRecord(new Type("i")));
  signature.addRecord("1", new TypedTokenRecord(new Type("i")));
  signature.addRecord("f", new TypedTokenRecord(new Type("i->i")));
  signature.addRecord("+", new TypedTokenRecord(new Type("[i,i]->i")));
  symbolTable.addFunctionalSymbol("f");

  describe("Pre Conditions", () =>
  {

  });

  describe("Post Conditions", () =>
  {
    test("Single function, 1 simple argument, no spacing", () =>
    {
      expect(processString("f(1)", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 3,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": "1",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              }
            ]
          ]
        }
      ]);
    });

    test("Single function, 1 simple argument, spacing", () =>
    {
      expect(processString("f( 1)", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f( 1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 4,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": " 1",
                "substringBeginOffset": 2,
                "substringEndOffset": 3,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(1 )", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(1 )",
          "substringBeginOffset": 0,
          "substringEndOffset": 4,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": "1 ",
                "substringBeginOffset": 2,
                "substringEndOffset": 3,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f( 1 )", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f( 1 )",
          "substringBeginOffset": 0,
          "substringEndOffset": 5,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": " 1 ",
                "substringBeginOffset": 2,
                "substringEndOffset": 4,
                "children": []
              }
            ]
          ]
        }
      ]);
  
      expect(processString("f( 1 ) ", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f( 1 )",
          "substringBeginOffset": 0,
          "substringEndOffset": 5,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": " 1 ",
                "substringBeginOffset": 2,
                "substringEndOffset": 4,
                "children": []
              }
            ]
          ]
        },
        {
          "substring": " ",
          "substringBeginOffset": 6,
          "substringEndOffset": 6,
          "children": []
        }
      ]);
  
      expect(processString("  f(  1  )  ", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": " ",
          "substringBeginOffset": 0,
          "substringEndOffset": 0,
          "children": []
        },
        {
          "substring": " ",
          "substringBeginOffset": 1,
          "substringEndOffset": 1,
          "children": []
        },
        {
          "substring": "f(  1  )",
          "substringBeginOffset": 2,
          "substringEndOffset": 9,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              }
            ],
            [
              {
                "substring": "  1  ",
                "substringBeginOffset": 4,
                "substringEndOffset": 8,
                "children": []
              }
            ]
          ]
        },
        {
          "substring": " ",
          "substringBeginOffset": 10,
          "substringEndOffset": 10,
          "children": []
        },
        {
          "substring": " ",
          "substringBeginOffset": 11,
          "substringEndOffset": 11,
          "children": []
        }
      ]);
    });

    test("Single function, many simple arguments", () =>
    {
      expect(processString("f(0,1)", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(0,1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 5,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": "0",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              }
            ],
            [
              {
                "substring": "1",
                "substringBeginOffset": 4,
                "substringEndOffset": 4,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(0, 1)", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(0, 1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 6,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,

                "children": []
              }
            ],
            [
              {
                "substring": "0",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              }
            ],
            [
              {
                "substring": " 1",
                "substringBeginOffset": 4,
                "substringEndOffset": 5,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(0, 0, 1, 1)", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(0, 0, 1, 1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 12,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": "0",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              }
            ],
            [
              {
                "substring": " 0",
                "substringBeginOffset": 4,
                "substringEndOffset": 5,
                "children": []
              }
            ],
            [
              {
                "substring": " 1",
                "substringBeginOffset": 7,
                "substringEndOffset": 8,
                "children": []
              }
            ],
            [
              {
                "substring": " 1",
                "substringBeginOffset": 10,
                "substringEndOffset": 11,
                "children": []
              }
            ]
          ]
        }
      ]);
    });

    test("Single function, simple multi token arguments", () =>
    {
      expect(processString("f(1 + 1)", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(1 + 1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 7,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": "1 + 1",
                "substringBeginOffset": 2,
                "substringEndOffset": 6,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(1 + 1 + 0 + 0 + 1, 1 + 0, 0 + 1)", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(1 + 1 + 0 + 0 + 1, 1 + 0, 0 + 1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 33,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": "1 + 1 + 0 + 0 + 1",
                "substringBeginOffset": 2,
                "substringEndOffset": 18,
                "children": []
              }
            ],
            [
              {
                "substring": " 1 + 0",
                "substringBeginOffset": 20,
                "substringEndOffset": 25,
                "children": []
              }
            ],
            [
              {
                "substring": " 0 + 1",
                "substringBeginOffset": 27,
                "substringEndOffset": 32,
                "children": []
              }
            ]
          ]
        }
      ]);
    });

    test("More than one function", () =>
    {
      expect(processString("f(1 + 1)f(0 + 0)", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(1 + 1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 7,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": "1 + 1",
                "substringBeginOffset": 2,
                "substringEndOffset": 6,
                "children": []
              }
            ]
          ]
        },
        {
          "substring": "f(0 + 0)",
          "substringBeginOffset": 8,
          "substringEndOffset": 15,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 8,
                "substringEndOffset": 8,
                "children": []
              }
            ],
            [
              {
                "substring": "0 + 0",
                "substringBeginOffset": 10,
                "substringEndOffset": 14,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(1 + 1) + f(0 + 0)", lexer, signature, symbolTable).toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(1 + 1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 7,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": "1 + 1",
                "substringBeginOffset": 2,
                "substringEndOffset": 6,
                "children": []
              }
            ]
          ]
        },
        {
          "substring": " ",
          "substringBeginOffset": 8,
          "substringEndOffset": 8,
          "children": []
        },
        {
          "substring": "+",
          "substringBeginOffset": 9,
          "substringEndOffset": 9,
          "children": []
        },
        {
          "substring": " ",
          "substringBeginOffset": 10,
          "substringEndOffset": 10,
          "children": []
        },
        {
          "substring": "f(0 + 0)",
          "substringBeginOffset": 11,
          "substringEndOffset": 18,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 11,
                "substringEndOffset": 11,
                "children": []
              }
            ],
            [
              {
                "substring": "0 + 0",
                "substringBeginOffset": 13,
                "substringEndOffset": 17,
                "children": []
              }
            ]
          ]
        }
      ]);
    });

    test("Nested functions", () =>
    {
      
    });



  });
});