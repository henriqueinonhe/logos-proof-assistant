import { Parser } from "../../src/Parsing/Parser";
import { LogosLexer } from "../../src/Lexing/LogosLexer";
import { LogosSignature } from "../../src/Lexing/LogosSignature";
import { TypedTokenRecord } from "../../src/Lexing/TypedTokenRecord";
import { Type } from "../../src/Type/Type";
import { ParseTreeBracketNode } from "../../src/Parsing/ParseTreeBracketNode";
import { FunctionalSymbolsAndOperatorsTable } from "../../src/Parsing/FunctionalSymbolsAndOperatorsTable";
import { LinkedList, LinkedListIterator } from "../../src/Utils/LinkedList";
import { ParseTreeNode } from "../../src/Parsing/ParseTreeNode";
import { Lexer } from "../../src/Lexing/Lexer";
import { Signature } from "../../src/Lexing/Signature";
import { ParseTree } from "../../src/Parsing/ParseTree";
import { OperatorAssociativity } from "../../src/Parsing/OperatorRecord";

const lexer = new LogosLexer();
const signature = new LogosSignature();
signature.addRecord("0", new TypedTokenRecord(new Type("i")));
signature.addRecord("1", new TypedTokenRecord(new Type("i")));
signature.addRecord("f", new TypedTokenRecord(new Type("i->i")));
signature.addRecord("+", new TypedTokenRecord(new Type("[i,i]->i")));
signature.addRecord("*", new TypedTokenRecord(new Type("[i,i]->i")));
signature.addRecord("-", new TypedTokenRecord(new Type("[i,i]->i")));
signature.addRecord(":", new TypedTokenRecord(new Type("[i,i]->i")));
signature.addRecord("^", new TypedTokenRecord(new Type("[i,i]->i")));

const symbolTable = new FunctionalSymbolsAndOperatorsTable();
symbolTable.addFunctionalSymbol("f");
symbolTable.addOperatorSymbol("^", 2, 1, 10, OperatorAssociativity.Left);
symbolTable.addOperatorSymbol("*", 2, 1, 20, OperatorAssociativity.Left);
symbolTable.addOperatorSymbol(":", 2, 1, 30, OperatorAssociativity.Left);
symbolTable.addOperatorSymbol("+", 2, 1, 40, OperatorAssociativity.Right);
symbolTable.addOperatorSymbol("-", 2, 1, 50, OperatorAssociativity.Left);

Parser.parse("f(0 + 1, f(1 + 1, f(0)) + 1)(1 + 1)(0 + 0) + 1", lexer, signature, symbolTable);

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

describe("private generateOperatorsIteratorQueue()", () =>
{
  function processString(string : string, lexer : Lexer, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : Array<LinkedListIterator<ParseTreeNode>>
  {
    const tokenString = lexer.lex(string, signature);
    const nodeList = Parser["convertTokenStringToNodeListAndHandleBrackets"](tokenString);
    return Parser["generateOperatorsIteratorQueue"](nodeList, symbolTable);
  }

  const lexer = new LogosLexer();
  const signature = new LogosSignature();
  signature.addRecord("0", new TypedTokenRecord(new Type("i")));
  signature.addRecord("1", new TypedTokenRecord(new Type("i")));
  signature.addRecord("f", new TypedTokenRecord(new Type("i->i")));
  signature.addRecord("+", new TypedTokenRecord(new Type("[i,i]->i")));
  signature.addRecord("*", new TypedTokenRecord(new Type("[i,i]->i")));
  signature.addRecord("-", new TypedTokenRecord(new Type("[i,i]->i")));
  signature.addRecord(":", new TypedTokenRecord(new Type("[i,i]->i")));
  signature.addRecord("^", new TypedTokenRecord(new Type("[i,i]->i")));

  const symbolTable = new FunctionalSymbolsAndOperatorsTable();
  symbolTable.addFunctionalSymbol("f");
  symbolTable.addOperatorSymbol("^", 2, 1, 10, OperatorAssociativity.Left);
  symbolTable.addOperatorSymbol("*", 2, 1, 20, OperatorAssociativity.Right);
  symbolTable.addOperatorSymbol(":", 2, 1, 30, OperatorAssociativity.Left);
  symbolTable.addOperatorSymbol("+", 2, 1, 40, OperatorAssociativity.Left);
  symbolTable.addOperatorSymbol("-", 2, 1, 50, OperatorAssociativity.Left);

  describe("Post Conditions", () =>
  {
    test("Queue is setup correctly", () =>
    {
      expect(processString("1 + 0 + 1 + 0", lexer, signature, symbolTable).map(iter => iter.get().substringBeginOffset)).toStrictEqual([2, 6, 10]);

      expect(processString("1 ^ 1 * 1 + 1 : 1 - 1 ^ 1 ^ 1 : 1 * 0 * 0", lexer, signature, symbolTable).map(iter => iter.get().substringBeginOffset)).toStrictEqual([2, 22, 26, 38, 34, 6, 14, 30, 10, 18]);
    });
  });
});

describe("private proccessFunctionApplicatons()", () =>
{
  //To make testing simpler
  function processString(string : string, lexer : Lexer, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : [LinkedList<ParseTreeNode>, Array<LinkedListIterator<ParseTreeNode>>]
  {
    const tokenString = lexer.lex(string, signature);
    const nodeList = Parser["convertTokenStringToNodeListAndHandleBrackets"](tokenString);
    const operatorsQueue = Parser["generateOperatorsIteratorQueue"](nodeList, symbolTable);
    Parser["reduceFunctionApplications"](nodeList, signature, symbolTable, tokenString);
    return [nodeList, operatorsQueue];
  }

  const lexer = new LogosLexer();
  const signature = new LogosSignature();
  signature.addRecord("0", new TypedTokenRecord(new Type("i")));
  signature.addRecord("1", new TypedTokenRecord(new Type("i")));
  signature.addRecord("f", new TypedTokenRecord(new Type("i->i")));
  signature.addRecord("+", new TypedTokenRecord(new Type("[i,i]->i")));
  signature.addRecord("*", new TypedTokenRecord(new Type("[i,i]->i")));
  signature.addRecord("-", new TypedTokenRecord(new Type("[i,i]->i")));
  signature.addRecord(":", new TypedTokenRecord(new Type("[i,i]->i")));
  signature.addRecord("^", new TypedTokenRecord(new Type("[i,i]->i")));

  const symbolTable = new FunctionalSymbolsAndOperatorsTable();
  symbolTable.addFunctionalSymbol("f");
  symbolTable.addOperatorSymbol("^", 2, 1, 10, OperatorAssociativity.Left);
  symbolTable.addOperatorSymbol("*", 2, 1, 20, OperatorAssociativity.Right);
  symbolTable.addOperatorSymbol(":", 2, 1, 30, OperatorAssociativity.Left);
  symbolTable.addOperatorSymbol("+", 2, 1, 40, OperatorAssociativity.Left);
  symbolTable.addOperatorSymbol("-", 2, 1, 50, OperatorAssociativity.Left);

  describe("Pre Conditions", () =>
  {

  });

  describe("Post Conditions", () =>
  {
    test("Single function, 1 simple argument, no spacing", () =>
    {
      expect(processString("f(1)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
      expect(processString("f( 1)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "1",
                "substringBeginOffset": 3,
                "substringEndOffset": 3,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(1 )", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "1",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f( 1 )", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "1",
                "substringBeginOffset": 3,
                "substringEndOffset": 3,
                "children": []
              }
            ]
          ]
        }
      ]);
  
      expect(processString("f( 1 ) ", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "1",
                "substringBeginOffset": 3,
                "substringEndOffset": 3,
                "children": []
              }
            ]
          ]
        }
      ]);
  
      expect(processString("  f(  1  )  ", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "1",
                "substringBeginOffset": 6,
                "substringEndOffset": 6,
                "children": []
              }
            ]
          ]
        }
      ]);
    });

    test("Single function, many simple arguments", () =>
    {
      expect(processString("f(0,1)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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

      expect(processString("f(0, 1)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "1",
                "substringBeginOffset": 5,
                "substringEndOffset": 5,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(0, 0, 1, 1)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "0",
                "substringBeginOffset": 5,
                "substringEndOffset": 5,
                "children": []
              }
            ],
            [
              {
                "substring": "1",
                "substringBeginOffset": 8,
                "substringEndOffset": 8,
                "children": []
              }
            ],
            [
              {
                "substring": "1",
                "substringBeginOffset": 11,
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
      expect(processString("f(1 + 1)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "1",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 4,
                "substringEndOffset": 4,
                "children": []
              },
              {
                "substring": "1",
                "substringBeginOffset": 6,
                "substringEndOffset": 6,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(1 + 1 + 0 + 0 + 1, 1 + 0, 0 + 1)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "1",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 4,
                "substringEndOffset": 4,
                "children": []
              },
              {
                "substring": "1",
                "substringBeginOffset": 6,
                "substringEndOffset": 6,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 8,
                "substringEndOffset": 8,
                "children": []
              },
              {
                "substring": "0",
                "substringBeginOffset": 10,
                "substringEndOffset": 10,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 12,
                "substringEndOffset": 12,
                "children": []
              },
              {
                "substring": "0",
                "substringBeginOffset": 14,
                "substringEndOffset": 14,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 16,
                "substringEndOffset": 16,
                "children": []
              },
              {
                "substring": "1",
                "substringBeginOffset": 18,
                "substringEndOffset": 18,
                "children": []
              }
            ],
            [
              {
                "substring": "1",
                "substringBeginOffset": 21,
                "substringEndOffset": 21,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 23,
                "substringEndOffset": 23,
                "children": []
              },
              {
                "substring": "0",
                "substringBeginOffset": 25,
                "substringEndOffset": 25,
                "children": []
              }
            ],
            [
              {
                "substring": "0",
                "substringBeginOffset": 28,
                "substringEndOffset": 28,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 30,
                "substringEndOffset": 30,
                "children": []
              },
              {
                "substring": "1",
                "substringBeginOffset": 32,
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
      expect(processString("f(1 + 1)f(0 + 0)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "1",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 4,
                "substringEndOffset": 4,
                "children": []
              },
              {
                "substring": "1",
                "substringBeginOffset": 6,
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
                "substring": "0",
                "substringBeginOffset": 10,
                "substringEndOffset": 10,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 12,
                "substringEndOffset": 12,
                "children": []
              },
              {
                "substring": "0",
                "substringBeginOffset": 14,
                "substringEndOffset": 14,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(1 + 1) + f(0 + 0)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
                "substring": "1",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 4,
                "substringEndOffset": 4,
                "children": []
              },
              {
                "substring": "1",
                "substringBeginOffset": 6,
                "substringEndOffset": 6,
                "children": []
              }
            ]
          ]
        },
        {
          "substring": "+",
          "substringBeginOffset": 9,
          "substringEndOffset": 9,
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
                "substring": "0",
                "substringBeginOffset": 13,
                "substringEndOffset": 13,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 15,
                "substringEndOffset": 15,
                "children": []
              },
              {
                "substring": "0",
                "substringBeginOffset": 17,
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
      expect(processString("f(0, f(1, 1))", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(0, f(1, 1))",
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
                "substring": "f(1, 1)",
                "substringBeginOffset": 5,
                "substringEndOffset": 11,
                "children": [
                  [
                    {
                      "substring": "f",
                      "substringBeginOffset": 5,
                      "substringEndOffset": 5,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "1",
                      "substringBeginOffset": 7,
                      "substringEndOffset": 7,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "1",
                      "substringBeginOffset": 10,
                      "substringEndOffset": 10,
                      "children": []
                    }
                  ]
                ]
              }
            ]
          ]
        }
      ]);

      expect(processString("f(0, 1 + f(1, 1) + 0)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(0, 1 + f(1, 1) + 0)",
          "substringBeginOffset": 0,
          "substringEndOffset": 20,
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
                "substringBeginOffset": 5,
                "substringEndOffset": 5,
                "children": []
              },
              {
                "substring": "+",
                "substringBeginOffset": 7,
                "substringEndOffset": 7,
                "children": []
              },
              {
                "substring": "f(1, 1)",
                "substringBeginOffset": 9,
                "substringEndOffset": 15,
                "children": [
                  [
                    {
                      "substring": "f",
                      "substringBeginOffset": 9,
                      "substringEndOffset": 9,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "1",
                      "substringBeginOffset": 11,
                      "substringEndOffset": 11,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "1",
                      "substringBeginOffset": 14,
                      "substringEndOffset": 14,
                      "children": []
                    }
                  ]
                ]
              },
              {
                "substring": "+",
                "substringBeginOffset": 17,
                "substringEndOffset": 17,
                "children": []
              },
              {
                "substring": "0",
                "substringBeginOffset": 19,
                "substringEndOffset": 19,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(f(f(f(1))))", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(f(f(f(1))))",
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
                "substring": "f(f(f(1)))",
                "substringBeginOffset": 2,
                "substringEndOffset": 11,
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
                      "substring": "f(f(1))",
                      "substringBeginOffset": 4,
                      "substringEndOffset": 10,
                      "children": [
                        [
                          {
                            "substring": "f",
                            "substringBeginOffset": 4,
                            "substringEndOffset": 4,
                            "children": []
                          }
                        ],
                        [
                          {
                            "substring": "f(1)",
                            "substringBeginOffset": 6,
                            "substringEndOffset": 9,
                            "children": [
                              [
                                {
                                  "substring": "f",
                                  "substringBeginOffset": 6,
                                  "substringEndOffset": 6,
                                  "children": []
                                }
                              ],
                              [
                                {
                                  "substring": "1",
                                  "substringBeginOffset": 8,
                                  "substringEndOffset": 8,
                                  "children": []
                                }
                              ]
                            ]
                          }
                        ]
                      ]
                    }
                  ]
                ]
              }
            ]
          ]
        }
      ]);
    });

    test("Currying", () =>
    {
      expect(processString("f(0)(1)(0)(1)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(0)(1)(0)(1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 12,
          "children": [
            [
              {
                "substring": "f(0)(1)(0)",
                "substringBeginOffset": 0,
                "substringEndOffset": 9,
                "children": [
                  [
                    {
                      "substring": "f(0)(1)",
                      "substringBeginOffset": 0,
                      "substringEndOffset": 6,
                      "children": [
                        [
                          {
                            "substring": "f(0)",
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
                                  "substring": "0",
                                  "substringBeginOffset": 2,
                                  "substringEndOffset": 2,
                                  "children": []
                                }
                              ]
                            ]
                          }
                        ],
                        [
                          {
                            "substring": "1",
                            "substringBeginOffset": 5,
                            "substringEndOffset": 5,
                            "children": []
                          }
                        ]
                      ]
                    }
                  ],
                  [
                    {
                      "substring": "0",
                      "substringBeginOffset": 8,
                      "substringEndOffset": 8,
                      "children": []
                    }
                  ]
                ]
              }
            ],
            [
              {
                "substring": "1",
                "substringBeginOffset": 11,
                "substringEndOffset": 11,
                "children": []
              }
            ]
          ]
        }
      ]);

      expect(processString("f(0 + 1, f(0, 1)(0)  + 0)(1)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(0 + 1, f(0, 1)(0)  + 0)(1)",
          "substringBeginOffset": 0,
          "substringEndOffset": 27,
          "children": [
            [
              {
                "substring": "f(0 + 1, f(0, 1)(0)  + 0)",
                "substringBeginOffset": 0,
                "substringEndOffset": 24,
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
                    },
                    {
                      "substring": "+",
                      "substringBeginOffset": 4,
                      "substringEndOffset": 4,
                      "children": []
                    },
                    {
                      "substring": "1",
                      "substringBeginOffset": 6,
                      "substringEndOffset": 6,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "f(0, 1)(0)",
                      "substringBeginOffset": 9,
                      "substringEndOffset": 18,
                      "children": [
                        [
                          {
                            "substring": "f(0, 1)",
                            "substringBeginOffset": 9,
                            "substringEndOffset": 15,
                            "children": [
                              [
                                {
                                  "substring": "f",
                                  "substringBeginOffset": 9,
                                  "substringEndOffset": 9,
                                  "children": []
                                }
                              ],
                              [
                                {
                                  "substring": "0",
                                  "substringBeginOffset": 11,
                                  "substringEndOffset": 11,
                                  "children": []
                                }
                              ],
                              [
                                {
                                  "substring": "1",
                                  "substringBeginOffset": 14,
                                  "substringEndOffset": 14,
                                  "children": []
                                }
                              ]
                            ]
                          }
                        ],
                        [
                          {
                            "substring": "0",
                            "substringBeginOffset": 17,
                            "substringEndOffset": 17,
                            "children": []
                          }
                        ]
                      ]
                    },
                    {
                      "substring": "+",
                      "substringBeginOffset": 21,
                      "substringEndOffset": 21,
                      "children": []
                    },
                    {
                      "substring": "0",
                      "substringBeginOffset": 23,
                      "substringEndOffset": 23,
                      "children": []
                    }
                  ]
                ]
              }
            ],
            [
              {
                "substring": "1",
                "substringBeginOffset": 26,
                "substringEndOffset": 26,
                "children": []
              }
            ]
          ]
        }
      ]);
    });

    test("Relevant Whitespace", () =>
    {
      expect(processString("(+ f (1 + 0))", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "(",
          "substringBeginOffset": 0,
          "substringEndOffset": 0,
          "children": []
        },
        {
          "substring": "+",
          "substringBeginOffset": 1,
          "substringEndOffset": 1,
          "children": []
        },
        {
          "substring": "f",
          "substringBeginOffset": 3,
          "substringEndOffset": 3,
          "children": []
        },
        {
          "substring": "(",
          "substringBeginOffset": 5,
          "substringEndOffset": 5,
          "children": []
        },
        {
          "substring": "1",
          "substringBeginOffset": 6,
          "substringEndOffset": 6,
          "children": []
        },
        {
          "substring": "+",
          "substringBeginOffset": 8,
          "substringEndOffset": 8,
          "children": []
        },
        {
          "substring": "0",
          "substringBeginOffset": 10,
          "substringEndOffset": 10,
          "children": []
        },
        {
          "substring": ")",
          "substringBeginOffset": 11,
          "substringEndOffset": 11,
          "children": []
        },
        {
          "substring": ")",
          "substringBeginOffset": 12,
          "substringEndOffset": 12,
          "children": []
        }
      ]);

      expect(processString("f(1) (0) (1)", lexer, signature, symbolTable)[0].toArray().map(element => element["reducedNodeObject"]())).toStrictEqual([
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
        },
        {
          "substring": "(",
          "substringBeginOffset": 5,
          "substringEndOffset": 5,
          "children": []
        },
        {
          "substring": "0",
          "substringBeginOffset": 6,
          "substringEndOffset": 6,
          "children": []
        },
        {
          "substring": ")",
          "substringBeginOffset": 7,
          "substringEndOffset": 7,
          "children": []
        },
        {
          "substring": "(",
          "substringBeginOffset": 9,
          "substringEndOffset": 9,
          "children": []
        },
        {
          "substring": "1",
          "substringBeginOffset": 10,
          "substringEndOffset": 10,
          "children": []
        },
        {
          "substring": ")",
          "substringBeginOffset": 11,
          "substringEndOffset": 11,
          "children": []
        }
      ]);
    });

    test("Iterators are preserved", () =>
    {
      const [nodeList, iteratorsQueue] = processString("f(0 + 1, f(1 + 1, f(0)) + 1)(1 + 1)(0 + 0) + 1", lexer, signature, symbolTable);
      expect(iteratorsQueue.map(iter => iter.get().substringBeginOffset)).toStrictEqual([4, 13, 24, 31, 38, 43]);
      iteratorsQueue.forEach(iter => iter.getList().remove(iter));
      expect(nodeList.toArray().map(node => node["reducedNodeObject"]())).toStrictEqual([
        {
          "substring": "f(0 + 1, f(1 + 1, f(0)) + 1)(1 + 1)(0 + 0)",
          "substringBeginOffset": 0,
          "substringEndOffset": 41,
          "children": [
            [
              {
                "substring": "f(0 + 1, f(1 + 1, f(0)) + 1)(1 + 1)",
                "substringBeginOffset": 0,
                "substringEndOffset": 34,
                "children": [
                  [
                    {
                      "substring": "f(0 + 1, f(1 + 1, f(0)) + 1)",
                      "substringBeginOffset": 0,
                      "substringEndOffset": 27,
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
                          },
                          {
                            "substring": "1",
                            "substringBeginOffset": 6,
                            "substringEndOffset": 6,
                            "children": []
                          }
                        ],
                        [
                          {
                            "substring": "f(1 + 1, f(0))",
                            "substringBeginOffset": 9,
                            "substringEndOffset": 22,
                            "children": [
                              [
                                {
                                  "substring": "f",
                                  "substringBeginOffset": 9,
                                  "substringEndOffset": 9,
                                  "children": []
                                }
                              ],
                              [
                                {
                                  "substring": "1",
                                  "substringBeginOffset": 11,
                                  "substringEndOffset": 11,
                                  "children": []
                                },
                                {
                                  "substring": "1",
                                  "substringBeginOffset": 15,
                                  "substringEndOffset": 15,
                                  "children": []
                                }
                              ],
                              [
                                {
                                  "substring": "f(0)",
                                  "substringBeginOffset": 18,
                                  "substringEndOffset": 21,
                                  "children": [
                                    [
                                      {
                                        "substring": "f",
                                        "substringBeginOffset": 18,
                                        "substringEndOffset": 18,
                                        "children": []
                                      }
                                    ],
                                    [
                                      {
                                        "substring": "0",
                                        "substringBeginOffset": 20,
                                        "substringEndOffset": 20,
                                        "children": []
                                      }
                                    ]
                                  ]
                                }
                              ]
                            ]
                          },
                          {
                            "substring": "1",
                            "substringBeginOffset": 26,
                            "substringEndOffset": 26,
                            "children": []
                          }
                        ]
                      ]
                    }
                  ],
                  [
                    {
                      "substring": "1",
                      "substringBeginOffset": 29,
                      "substringEndOffset": 29,
                      "children": []
                    },
                    {
                      "substring": "1",
                      "substringBeginOffset": 33,
                      "substringEndOffset": 33,
                      "children": []
                    }
                  ]
                ]
              }
            ],
            [
              {
                "substring": "0",
                "substringBeginOffset": 36,
                "substringEndOffset": 36,
                "children": []
              },
              {
                "substring": "0",
                "substringBeginOffset": 40,
                "substringEndOffset": 40,
                "children": []
              }
            ]
          ]
        },
        {
          "substring": "1",
          "substringBeginOffset": 45,
          "substringEndOffset": 45,
          "children": []
        }
      ]);
    });

  });
});

