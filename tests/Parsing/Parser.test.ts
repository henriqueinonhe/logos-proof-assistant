import { Parser } from "../../src/Parsing/Parser";
import { LogosLexer } from "../../src/Lexing/LogosLexer";
import { LogosSignature } from "../../src/Lexing/LogosSignature";
import { TypedTokenRecord } from "../../src/Lexing/TypedTokenRecord";
import { Type } from "../../src/Type/Type";
import { FunctionalSymbolsAndOperatorsTable } from "../../src/Parsing/FunctionalSymbolsAndOperatorsTable";
import { LinkedList, LinkedListIterator } from "../../src/Utils/LinkedList";
import { ParseTreeNode } from "../../src/Parsing/ParseTreeNode";
import { Lexer } from "../../src/Lexing/Lexer";
import { Signature } from "../../src/Lexing/Signature";
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
signature.addRecord("succ", new TypedTokenRecord(new Type("i->i")));
signature.addRecord("F", new TypedTokenRecord(new Type("i->i")));

const symbolTable = new FunctionalSymbolsAndOperatorsTable();
symbolTable.addFunctionalSymbol("f");
symbolTable.addOperatorSymbol("^", 2, 1, 10, OperatorAssociativity.Left);
symbolTable.addOperatorSymbol("*", 2, 1, 20, OperatorAssociativity.Left);
symbolTable.addOperatorSymbol(":", 2, 1, 30, OperatorAssociativity.Left);
symbolTable.addOperatorSymbol("+", 2, 1, 40, OperatorAssociativity.Left);
symbolTable.addOperatorSymbol("-", 2, 1, 40, OperatorAssociativity.Left);
symbolTable.addOperatorSymbol("succ", 1, 0, 1, OperatorAssociativity.Left);

// Parser.parse("", lexer, signature, symbolTable);

describe("private generateOperatorsIteratorQueue()", () =>
{
  function processString(string : string, lexer : Lexer, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : Array<LinkedListIterator<ParseTreeNode>>
  {
    const tokenString = lexer.lex(string, signature);
    const nodeList = Parser["convertTokenStringToNodeList"](tokenString);
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
    test("Operators queue is setup correctly", () =>
    {
      expect(processString("1 + 0 + 1 + 0", lexer, signature, symbolTable).map(iter => iter.get().substringBeginOffset)).toStrictEqual([2, 6, 10]);

      expect(processString("1 ^ 1 * 1 + 1 : 1 - 1 ^ 1 ^ 1 : 1 * 0 * 0", lexer, signature, symbolTable).map(iter => iter.get().substringBeginOffset)).toStrictEqual([2, 22, 26, 38, 34, 6, 14, 30, 10, 18]);
    });
  });
});

describe("private parseTopMostExpression()", () =>
{
  //To make testing simpler
  function processString(string : string, lexer : Lexer, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : [object, Array<LinkedListIterator<ParseTreeNode>>]
  {
    const tokenString = lexer.lex(string, signature);
    const nodeList = Parser["convertTokenStringToNodeList"](tokenString);
    const operatorsQueue = Parser["generateOperatorsIteratorQueue"](nodeList, symbolTable);
    const reducedNodeList = Parser["parseTopMostExpression"](nodeList, signature, symbolTable, tokenString);
    return [reducedNodeList.toArray().map(e => e["reducedNodeObject"]()), operatorsQueue];
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
    describe("Function Applications Only (No Bracketed Expressions)", () =>
    {
      test("Single function, 1 simple argument, no spacing", () =>
      {
        expect(processString("f(1)", lexer, signature, symbolTable)[0]).toStrictEqual([
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
        expect(processString("f( 1)", lexer, signature, symbolTable)[0]).toStrictEqual([
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

        expect(processString("f(1 )", lexer, signature, symbolTable)[0]).toStrictEqual([
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

        expect(processString("f( 1 )", lexer, signature, symbolTable)[0]).toStrictEqual([
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
  
        expect(processString("f( 1 ) ", lexer, signature, symbolTable)[0]).toStrictEqual([
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
  
        expect(processString("  f(  1  )  ", lexer, signature, symbolTable)[0]).toStrictEqual([
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
        expect(processString("f(0,1)", lexer, signature, symbolTable)[0]).toStrictEqual([
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
  
        expect(processString("f(0, 1)", lexer, signature, symbolTable)[0]).toStrictEqual([
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
  
        expect(processString("f(0, 0, 1, 1)", lexer, signature, symbolTable)[0]).toStrictEqual([
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
        expect(processString("f(1 + 1)", lexer, signature, symbolTable)[0]).toStrictEqual([
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
  
        expect(processString("f(1 + 1 + 0 + 0 + 1, 1 + 0, 0 + 1)", lexer, signature, symbolTable)[0]).toStrictEqual([
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
        expect(processString("f(1 + 1)f(0 + 0)", lexer, signature, symbolTable)[0]).toStrictEqual([
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
  
        expect(processString("f(1 + 1) + f(0 + 0)", lexer, signature, symbolTable)[0]).toStrictEqual([
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
        expect(processString("f(0, f(1, 1))", lexer, signature, symbolTable)[0]).toStrictEqual([
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

        expect(processString("f(0, 1 + f(1, 1) + 0)", lexer, signature, symbolTable)[0]).toStrictEqual([
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

        expect(processString("f(f(f(f(1))))", lexer, signature, symbolTable)[0]).toStrictEqual([
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
        expect(processString("f(0)(1)(0)(1)", lexer, signature, symbolTable)[0]).toStrictEqual([
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

        expect(processString("f(0 + 1, f(0, 1)(0)  + 0)(1)", lexer, signature, symbolTable)[0]).toStrictEqual([
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
    });

    describe("Bracketed Expressions Only (No Function Applications)", () =>
    {
      test("Single topmost bracket pair", () =>
      {
        expect(processString("(1 + 1 + 0 + 0 * 0)", lexer, signature, symbolTable)[0]).toStrictEqual([
          {
            "substring": "(1 + 1 + 0 + 0 * 0)",
            "substringBeginOffset": 0,
            "substringEndOffset": 18,
            "children": [
              [
                {
                  "substring": "1",
                  "substringBeginOffset": 1,
                  "substringEndOffset": 1,
                  "children": []
                },
                {
                  "substring": "+",
                  "substringBeginOffset": 3,
                  "substringEndOffset": 3,
                  "children": []
                },
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
                  "substring": "0",
                  "substringBeginOffset": 9,
                  "substringEndOffset": 9,
                  "children": []
                },
                {
                  "substring": "+",
                  "substringBeginOffset": 11,
                  "substringEndOffset": 11,
                  "children": []
                },
                {
                  "substring": "0",
                  "substringBeginOffset": 13,
                  "substringEndOffset": 13,
                  "children": []
                },
                {
                  "substring": "*",
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

      test("Sequence of topmost bracketed expressions", () =>
      {
        expect(processString("(1 + 1) + (1 + 1) * (0 * 0 * 0)", lexer, signature, symbolTable)[0]).toStrictEqual([
          {
            "substring": "(1 + 1)",
            "substringBeginOffset": 0,
            "substringEndOffset": 6,
            "children": [
              [
                {
                  "substring": "1",
                  "substringBeginOffset": 1,
                  "substringEndOffset": 1,
                  "children": []
                },
                {
                  "substring": "+",
                  "substringBeginOffset": 3,
                  "substringEndOffset": 3,
                  "children": []
                },
                {
                  "substring": "1",
                  "substringBeginOffset": 5,
                  "substringEndOffset": 5,
                  "children": []
                }
              ]
            ]
          },
          {
            "substring": "+",
            "substringBeginOffset": 8,
            "substringEndOffset": 8,
            "children": []
          },
          {
            "substring": "(1 + 1)",
            "substringBeginOffset": 10,
            "substringEndOffset": 16,
            "children": [
              [
                {
                  "substring": "1",
                  "substringBeginOffset": 11,
                  "substringEndOffset": 11,
                  "children": []
                },
                {
                  "substring": "+",
                  "substringBeginOffset": 13,
                  "substringEndOffset": 13,
                  "children": []
                },
                {
                  "substring": "1",
                  "substringBeginOffset": 15,
                  "substringEndOffset": 15,
                  "children": []
                }
              ]
            ]
          },
          {
            "substring": "*",
            "substringBeginOffset": 18,
            "substringEndOffset": 18,
            "children": []
          },
          {
            "substring": "(0 * 0 * 0)",
            "substringBeginOffset": 20,
            "substringEndOffset": 30,
            "children": [
              [
                {
                  "substring": "0",
                  "substringBeginOffset": 21,
                  "substringEndOffset": 21,
                  "children": []
                },
                {
                  "substring": "*",
                  "substringBeginOffset": 23,
                  "substringEndOffset": 23,
                  "children": []
                },
                {
                  "substring": "0",
                  "substringBeginOffset": 25,
                  "substringEndOffset": 25,
                  "children": []
                },
                {
                  "substring": "*",
                  "substringBeginOffset": 27,
                  "substringEndOffset": 27,
                  "children": []
                },
                {
                  "substring": "0",
                  "substringBeginOffset": 29,
                  "substringEndOffset": 29,
                  "children": []
                }
              ]
            ]
          }
        ]);
      });

      test("Nested bracketed expressions", () =>
      {
        expect(processString("(((0 + 1) + 1) + ((0 + 1) + 1))", lexer, signature, symbolTable)[0]).toStrictEqual([
          {
            "substring": "(((0 + 1) + 1) + ((0 + 1) + 1))",
            "substringBeginOffset": 0,
            "substringEndOffset": 30,
            "children": [
              [
                {
                  "substring": "((0 + 1) + 1)",
                  "substringBeginOffset": 1,
                  "substringEndOffset": 13,
                  "children": [
                    [
                      {
                        "substring": "(0 + 1)",
                        "substringBeginOffset": 2,
                        "substringEndOffset": 8,
                        "children": [
                          [
                            {
                              "substring": "0",
                              "substringBeginOffset": 3,
                              "substringEndOffset": 3,
                              "children": []
                            },
                            {
                              "substring": "+",
                              "substringBeginOffset": 5,
                              "substringEndOffset": 5,
                              "children": []
                            },
                            {
                              "substring": "1",
                              "substringBeginOffset": 7,
                              "substringEndOffset": 7,
                              "children": []
                            }
                          ]
                        ]
                      },
                      {
                        "substring": "+",
                        "substringBeginOffset": 10,
                        "substringEndOffset": 10,
                        "children": []
                      },
                      {
                        "substring": "1",
                        "substringBeginOffset": 12,
                        "substringEndOffset": 12,
                        "children": []
                      }
                    ]
                  ]
                },
                {
                  "substring": "+",
                  "substringBeginOffset": 15,
                  "substringEndOffset": 15,
                  "children": []
                },
                {
                  "substring": "((0 + 1) + 1)",
                  "substringBeginOffset": 17,
                  "substringEndOffset": 29,
                  "children": [
                    [
                      {
                        "substring": "(0 + 1)",
                        "substringBeginOffset": 18,
                        "substringEndOffset": 24,
                        "children": [
                          [
                            {
                              "substring": "0",
                              "substringBeginOffset": 19,
                              "substringEndOffset": 19,
                              "children": []
                            },
                            {
                              "substring": "+",
                              "substringBeginOffset": 21,
                              "substringEndOffset": 21,
                              "children": []
                            },
                            {
                              "substring": "1",
                              "substringBeginOffset": 23,
                              "substringEndOffset": 23,
                              "children": []
                            }
                          ]
                        ]
                      },
                      {
                        "substring": "+",
                        "substringBeginOffset": 26,
                        "substringEndOffset": 26,
                        "children": []
                      },
                      {
                        "substring": "1",
                        "substringBeginOffset": 28,
                        "substringEndOffset": 28,
                        "children": []
                      }
                    ]
                  ]
                }
              ]
            ]
          }
        ]);
      });
    });

    test("Relevant Whitespace", () =>
    {
      expect(processString("(+ f (1 + 0))", lexer, signature, symbolTable)[0]).toStrictEqual([
        {
          "substring": "(+ f (1 + 0))",
          "substringBeginOffset": 0,
          "substringEndOffset": 12,
          "children": [
            [
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
                "substring": "(1 + 0)",
                "substringBeginOffset": 5,
                "substringEndOffset": 11,
                "children": [
                  [
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
                    }
                  ]
                ]
              }
            ]
          ]
        }
      ]);

      // expect(processString("f(1) (0) (1)", lexer, signature, symbolTable)[0]).toStrictEqual([
      //   {
      //     "substring": "f(1)",
      //     "substringBeginOffset": 0,
      //     "substringEndOffset": 3,
      //     "children": [
      //       [
      //         {
      //           "substring": "f",
      //           "substringBeginOffset": 0,
      //           "substringEndOffset": 0,
      //           "children": []
      //         }
      //       ],
      //       [
      //         {
      //           "substring": "1",
      //           "substringBeginOffset": 2,
      //           "substringEndOffset": 2,
      //           "children": []
      //         }
      //       ]
      //     ]
      //   },
      //   {
      //     "substring": "(",
      //     "substringBeginOffset": 5,
      //     "substringEndOffset": 5,
      //     "children": []
      //   },
      //   {
      //     "substring": "0",
      //     "substringBeginOffset": 6,
      //     "substringEndOffset": 6,
      //     "children": []
      //   },
      //   {
      //     "substring": ")",
      //     "substringBeginOffset": 7,
      //     "substringEndOffset": 7,
      //     "children": []
      //   },
      //   {
      //     "substring": "(",
      //     "substringBeginOffset": 9,
      //     "substringEndOffset": 9,
      //     "children": []
      //   },
      //   {
      //     "substring": "1",
      //     "substringBeginOffset": 10,
      //     "substringEndOffset": 10,
      //     "children": []
      //   },
      //   {
      //     "substring": ")",
      //     "substringBeginOffset": 11,
      //     "substringEndOffset": 11,
      //     "children": []
      //   }
      // ]);
    });

    test("Mixing Functions And Bracketed Expressions", () =>
    {
      expect(processString("(f f(1 * (1 + 1), f(1, 0, (0 * 1) - 1)) 1 (1 : 1))", lexer, signature, symbolTable)[0]).toStrictEqual([
        {
          "substring": "(f f(1 * (1 + 1), f(1, 0, (0 * 1) - 1)) 1 (1 : 1))",
          "substringBeginOffset": 0,
          "substringEndOffset": 49,
          "children": [
            [
              {
                "substring": "f",
                "substringBeginOffset": 1,
                "substringEndOffset": 1,
                "children": []
              },
              {
                "substring": "f(1 * (1 + 1), f(1, 0, (0 * 1) - 1))",
                "substringBeginOffset": 3,
                "substringEndOffset": 38,
                "children": [
                  [
                    {
                      "substring": "f",
                      "substringBeginOffset": 3,
                      "substringEndOffset": 3,
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
                      "substring": "*",
                      "substringBeginOffset": 7,
                      "substringEndOffset": 7,
                      "children": []
                    },
                    {
                      "substring": "(1 + 1)",
                      "substringBeginOffset": 9,
                      "substringEndOffset": 15,
                      "children": [
                        [
                          {
                            "substring": "1",
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
                      "substring": "f(1, 0, (0 * 1) - 1)",
                      "substringBeginOffset": 18,
                      "substringEndOffset": 37,
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
                            "substring": "1",
                            "substringBeginOffset": 20,
                            "substringEndOffset": 20,
                            "children": []
                          }
                        ],
                        [
                          {
                            "substring": "0",
                            "substringBeginOffset": 23,
                            "substringEndOffset": 23,
                            "children": []
                          }
                        ],
                        [
                          {
                            "substring": "(0 * 1)",
                            "substringBeginOffset": 26,
                            "substringEndOffset": 32,
                            "children": [
                              [
                                {
                                  "substring": "0",
                                  "substringBeginOffset": 27,
                                  "substringEndOffset": 27,
                                  "children": []
                                },
                                {
                                  "substring": "*",
                                  "substringBeginOffset": 29,
                                  "substringEndOffset": 29,
                                  "children": []
                                },
                                {
                                  "substring": "1",
                                  "substringBeginOffset": 31,
                                  "substringEndOffset": 31,
                                  "children": []
                                }
                              ]
                            ]
                          },
                          {
                            "substring": "-",
                            "substringBeginOffset": 34,
                            "substringEndOffset": 34,
                            "children": []
                          },
                          {
                            "substring": "1",
                            "substringBeginOffset": 36,
                            "substringEndOffset": 36,
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
                "substringBeginOffset": 40,
                "substringEndOffset": 40,
                "children": []
              },
              {
                "substring": "(1 : 1)",
                "substringBeginOffset": 42,
                "substringEndOffset": 48,
                "children": [
                  [
                    {
                      "substring": "1",
                      "substringBeginOffset": 43,
                      "substringEndOffset": 43,
                      "children": []
                    },
                    {
                      "substring": ":",
                      "substringBeginOffset": 45,
                      "substringEndOffset": 45,
                      "children": []
                    },
                    {
                      "substring": "1",
                      "substringBeginOffset": 47,
                      "substringEndOffset": 47,
                      "children": []
                    }
                  ]
                ]
              }
            ]
          ]
        }
      ]);
    });
  });



});

describe("private parseOperatorApplications()", () =>
{
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
  signature.addRecord("succ", new TypedTokenRecord(new Type("i->i")));

  const symbolTable = new FunctionalSymbolsAndOperatorsTable();
  symbolTable.addFunctionalSymbol("f");
  symbolTable.addOperatorSymbol("^", 2, 1, 10, OperatorAssociativity.Right);
  symbolTable.addOperatorSymbol("*", 2, 1, 20, OperatorAssociativity.Left);
  symbolTable.addOperatorSymbol(":", 2, 1, 30, OperatorAssociativity.Left);
  symbolTable.addOperatorSymbol("+", 2, 1, 40, OperatorAssociativity.Left);
  symbolTable.addOperatorSymbol("-", 2, 1, 40, OperatorAssociativity.Left);
  symbolTable.addOperatorSymbol("succ", 1, 0, 1, OperatorAssociativity.Left);

  function processString(string : string) : object
  {
    const tokenString = lexer.lex(string, signature);
    const nodeList = Parser["convertTokenStringToNodeList"](tokenString);
    const operatorsIteratorQueue = Parser["generateOperatorsIteratorQueue"](nodeList, symbolTable);
    const nodeList2 = Parser["parseTopMostExpression"](nodeList, signature, symbolTable, tokenString);
    const nodeList3 = Parser["parseOperatorApplications"](operatorsIteratorQueue, nodeList2, tokenString, signature, symbolTable);
    return nodeList3.toArray().map(node => node["reducedNodeObject"]());
  }

  describe("Post Conditions", () =>
  {
    describe("No Bracketed Expressions", () =>
    {
      test("Single infix operator", () =>
      {
        expect(processString("1 + 1")).toStrictEqual([
          {
            "substring": "1 + 1",
            "substringBeginOffset": 0,
            "substringEndOffset": 4,
            "children": [
              [
                {
                  "substring": "+",
                  "substringBeginOffset": 2,
                  "substringEndOffset": 2,
                  "children": []
                }
              ],
              [
                {
                  "substring": "1",
                  "substringBeginOffset": 0,
                  "substringEndOffset": 0,
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

        expect(processString("1 * 0")).toStrictEqual([
          {
            "substring": "1 * 0",
            "substringBeginOffset": 0,
            "substringEndOffset": 4,
            "children": [
              [
                {
                  "substring": "*",
                  "substringBeginOffset": 2,
                  "substringEndOffset": 2,
                  "children": []
                }
              ],
              [
                {
                  "substring": "1",
                  "substringBeginOffset": 0,
                  "substringEndOffset": 0,
                  "children": []
                }
              ],
              [
                {
                  "substring": "0",
                  "substringBeginOffset": 4,
                  "substringEndOffset": 4,
                  "children": []
                }
              ]
            ]
          }
        ]);
      });

      test("Various operators with different precedence", () =>
      {
        expect(processString("succ 1 + 1 * 1 ^ 0 : 1")).toStrictEqual([
          {
            "substring": "succ 1 + 1 * 1 ^ 0 : 1",
            "substringBeginOffset": 0,
            "substringEndOffset": 18,
            "children": [
              [
                {
                  "substring": "+",
                  "substringBeginOffset": 4,
                  "substringEndOffset": 4,
                  "children": []
                }
              ],
              [
                {
                  "substring": "succ 1",
                  "substringBeginOffset": 0,
                  "substringEndOffset": 2,
                  "children": [
                    [
                      {
                        "substring": "succ",
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
              ],
              [
                {
                  "substring": "1 * 1 ^ 0 : 1",
                  "substringBeginOffset": 6,
                  "substringEndOffset": 18,
                  "children": [
                    [
                      {
                        "substring": ":",
                        "substringBeginOffset": 16,
                        "substringEndOffset": 16,
                        "children": []
                      }
                    ],
                    [
                      {
                        "substring": "1 * 1 ^ 0",
                        "substringBeginOffset": 6,
                        "substringEndOffset": 14,
                        "children": [
                          [
                            {
                              "substring": "*",
                              "substringBeginOffset": 8,
                              "substringEndOffset": 8,
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
                          ],
                          [
                            {
                              "substring": "1 ^ 0",
                              "substringBeginOffset": 10,
                              "substringEndOffset": 14,
                              "children": [
                                [
                                  {
                                    "substring": "^",
                                    "substringBeginOffset": 12,
                                    "substringEndOffset": 12,
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
                                ],
                                [
                                  {
                                    "substring": "0",
                                    "substringBeginOffset": 14,
                                    "substringEndOffset": 14,
                                    "children": []
                                  }
                                ]
                              ]
                            }
                          ]
                        ]
                      }
                    ],
                    [
                      {
                        "substring": "1",
                        "substringBeginOffset": 18,
                        "substringEndOffset": 18,
                        "children": []
                      }
                    ]
                  ]
                }
              ]
            ]
          }
        ]);
      });

      test("Operators with same precedence", () =>
      {
        expect(processString("1 + 1 + 1 + 1 + 1")).toStrictEqual([
          {
            "substring": "1 + 1 + 1 + 1 + 1",
            "substringBeginOffset": 0,
            "substringEndOffset": 16,
            "children": [
              [
                {
                  "substring": "+",
                  "substringBeginOffset": 14,
                  "substringEndOffset": 14,
                  "children": []
                }
              ],
              [
                {
                  "substring": "1 + 1 + 1 + 1",
                  "substringBeginOffset": 0,
                  "substringEndOffset": 12,
                  "children": [
                    [
                      {
                        "substring": "+",
                        "substringBeginOffset": 10,
                        "substringEndOffset": 10,
                        "children": []
                      }
                    ],
                    [
                      {
                        "substring": "1 + 1 + 1",
                        "substringBeginOffset": 0,
                        "substringEndOffset": 8,
                        "children": [
                          [
                            {
                              "substring": "+",
                              "substringBeginOffset": 6,
                              "substringEndOffset": 6,
                              "children": []
                            }
                          ],
                          [
                            {
                              "substring": "1 + 1",
                              "substringBeginOffset": 0,
                              "substringEndOffset": 4,
                              "children": [
                                [
                                  {
                                    "substring": "+",
                                    "substringBeginOffset": 2,
                                    "substringEndOffset": 2,
                                    "children": []
                                  }
                                ],
                                [
                                  {
                                    "substring": "1",
                                    "substringBeginOffset": 0,
                                    "substringEndOffset": 0,
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
                    ],
                    [
                      {
                        "substring": "1",
                        "substringBeginOffset": 12,
                        "substringEndOffset": 12,
                        "children": []
                      }
                    ]
                  ]
                }
              ],
              [
                {
                  "substring": "1",
                  "substringBeginOffset": 16,
                  "substringEndOffset": 16,
                  "children": []
                }
              ]
            ]
          }
        ]);

        expect(processString("1 + 1 - 1 + 1 - 1")).toStrictEqual([
          {
            "substring": "1 + 1 - 1 + 1 - 1",
            "substringBeginOffset": 0,
            "substringEndOffset": 16,
            "children": [
              [
                {
                  "substring": "-",
                  "substringBeginOffset": 14,
                  "substringEndOffset": 14,
                  "children": []
                }
              ],
              [
                {
                  "substring": "1 + 1 - 1 + 1",
                  "substringBeginOffset": 0,
                  "substringEndOffset": 12,
                  "children": [
                    [
                      {
                        "substring": "+",
                        "substringBeginOffset": 10,
                        "substringEndOffset": 10,
                        "children": []
                      }
                    ],
                    [
                      {
                        "substring": "1 + 1 - 1",
                        "substringBeginOffset": 0,
                        "substringEndOffset": 8,
                        "children": [
                          [
                            {
                              "substring": "-",
                              "substringBeginOffset": 6,
                              "substringEndOffset": 6,
                              "children": []
                            }
                          ],
                          [
                            {
                              "substring": "1 + 1",
                              "substringBeginOffset": 0,
                              "substringEndOffset": 4,
                              "children": [
                                [
                                  {
                                    "substring": "+",
                                    "substringBeginOffset": 2,
                                    "substringEndOffset": 2,
                                    "children": []
                                  }
                                ],
                                [
                                  {
                                    "substring": "1",
                                    "substringBeginOffset": 0,
                                    "substringEndOffset": 0,
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
                    ],
                    [
                      {
                        "substring": "1",
                        "substringBeginOffset": 12,
                        "substringEndOffset": 12,
                        "children": []
                      }
                    ]
                  ]
                }
              ],
              [
                {
                  "substring": "1",
                  "substringBeginOffset": 16,
                  "substringEndOffset": 16,
                  "children": []
                }
              ]
            ]
          }
        ]);
      });

      test("Operators and function applications", () =>
      {
        expect(processString("f(1 + 1 * 1, succ 1) + f(0) * f(1 - 1 - 1)")).toStrictEqual([
          {
            "substring": "f(1 + 1 * 1, succ 1) + f(0) * f(1 - 1 - 1)",
            "substringBeginOffset": 0,
            "substringEndOffset": 38,
            "children": [
              [
                {
                  "substring": "+",
                  "substringBeginOffset": 18,
                  "substringEndOffset": 18,
                  "children": []
                }
              ],
              [
                {
                  "substring": "f(1 + 1 * 1, succ 1)",
                  "substringBeginOffset": 0,
                  "substringEndOffset": 16,
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
                        "substring": "1 + 1 * 1",
                        "substringBeginOffset": 2,
                        "substringEndOffset": 10,
                        "children": [
                          [
                            {
                              "substring": "+",
                              "substringBeginOffset": 4,
                              "substringEndOffset": 4,
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
                          ],
                          [
                            {
                              "substring": "1 * 1",
                              "substringBeginOffset": 6,
                              "substringEndOffset": 10,
                              "children": [
                                [
                                  {
                                    "substring": "*",
                                    "substringBeginOffset": 8,
                                    "substringEndOffset": 8,
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
                    ],
                    [
                      {
                        "substring": "succ 1",
                        "substringBeginOffset": 13,
                        "substringEndOffset": 15,
                        "children": [
                          [
                            {
                              "substring": "succ",
                              "substringBeginOffset": 13,
                              "substringEndOffset": 13,
                              "children": []
                            }
                          ],
                          [
                            {
                              "substring": "1",
                              "substringBeginOffset": 15,
                              "substringEndOffset": 15,
                              "children": []
                            }
                          ]
                        ]
                      }
                    ]
                  ]
                }
              ],
              [
                {
                  "substring": "f(0) * f(1 - 1 - 1)",
                  "substringBeginOffset": 20,
                  "substringEndOffset": 38,
                  "children": [
                    [
                      {
                        "substring": "*",
                        "substringBeginOffset": 25,
                        "substringEndOffset": 25,
                        "children": []
                      }
                    ],
                    [
                      {
                        "substring": "f(0)",
                        "substringBeginOffset": 20,
                        "substringEndOffset": 23,
                        "children": [
                          [
                            {
                              "substring": "f",
                              "substringBeginOffset": 20,
                              "substringEndOffset": 20,
                              "children": []
                            }
                          ],
                          [
                            {
                              "substring": "0",
                              "substringBeginOffset": 22,
                              "substringEndOffset": 22,
                              "children": []
                            }
                          ]
                        ]
                      }
                    ],
                    [
                      {
                        "substring": "f(1 - 1 - 1)",
                        "substringBeginOffset": 27,
                        "substringEndOffset": 38,
                        "children": [
                          [
                            {
                              "substring": "f",
                              "substringBeginOffset": 27,
                              "substringEndOffset": 27,
                              "children": []
                            }
                          ],
                          [
                            {
                              "substring": "1 - 1 - 1",
                              "substringBeginOffset": 29,
                              "substringEndOffset": 37,
                              "children": [
                                [
                                  {
                                    "substring": "-",
                                    "substringBeginOffset": 35,
                                    "substringEndOffset": 35,
                                    "children": []
                                  }
                                ],
                                [
                                  {
                                    "substring": "1 - 1",
                                    "substringBeginOffset": 29,
                                    "substringEndOffset": 33,
                                    "children": [
                                      [
                                        {
                                          "substring": "-",
                                          "substringBeginOffset": 31,
                                          "substringEndOffset": 31,
                                          "children": []
                                        }
                                      ],
                                      [
                                        {
                                          "substring": "1",
                                          "substringBeginOffset": 29,
                                          "substringEndOffset": 29,
                                          "children": []
                                        }
                                      ],
                                      [
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
                                    "substring": "1",
                                    "substringBeginOffset": 37,
                                    "substringEndOffset": 37,
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

    });

    describe("Bracketed Expressions", () =>
    {
      test("Top level brackets", () =>
      {
        expect(processString("(1 + 1 + 1 + 1)")).toStrictEqual([
          {
            "substring": "1 + 1 + 1 + 1",
            "substringBeginOffset": 1,
            "substringEndOffset": 13,
            "children": [
              [
                {
                  "substring": "+",
                  "substringBeginOffset": 11,
                  "substringEndOffset": 11,
                  "children": []
                }
              ],
              [
                {
                  "substring": "1 + 1 + 1",
                  "substringBeginOffset": 1,
                  "substringEndOffset": 9,
                  "children": [
                    [
                      {
                        "substring": "+",
                        "substringBeginOffset": 7,
                        "substringEndOffset": 7,
                        "children": []
                      }
                    ],
                    [
                      {
                        "substring": "1 + 1",
                        "substringBeginOffset": 1,
                        "substringEndOffset": 5,
                        "children": [
                          [
                            {
                              "substring": "+",
                              "substringBeginOffset": 3,
                              "substringEndOffset": 3,
                              "children": []
                            }
                          ],
                          [
                            {
                              "substring": "1",
                              "substringBeginOffset": 1,
                              "substringEndOffset": 1,
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
                    ],
                    [
                      {
                        "substring": "1",
                        "substringBeginOffset": 9,
                        "substringEndOffset": 9,
                        "children": []
                      }
                    ]
                  ]
                }
              ],
              [
                {
                  "substring": "1",
                  "substringBeginOffset": 13,
                  "substringEndOffset": 13,
                  "children": []
                }
              ]
            ]
          }
        ]);
      });

      test("Multiple nested Brackets", () =>
      {
        expect(processString("1 + 1 * f(1 + 1 - 1 + 0, ((((((0)))))), ((f(1 - 1)))) + ((((0)) + ((0))))")).toStrictEqual([
          {
            "substring": "1 + 1 * f(1 + 1 - 1 + 0, ((((((0)))))), ((f(1 - 1)))) + ((((0)) + ((0))))",
            "substringBeginOffset": 0,
            "substringEndOffset": 72,
            "children": [
              [
                {
                  "substring": "+",
                  "substringBeginOffset": 54,
                  "substringEndOffset": 54,
                  "children": []
                }
              ],
              [
                {
                  "substring": "1 + 1 * f(1 + 1 - 1 + 0, ((((((0)))))), ((f(1 - 1))))",
                  "substringBeginOffset": 0,
                  "substringEndOffset": 52,
                  "children": [
                    [
                      {
                        "substring": "+",
                        "substringBeginOffset": 2,
                        "substringEndOffset": 2,
                        "children": []
                      }
                    ],
                    [
                      {
                        "substring": "1",
                        "substringBeginOffset": 0,
                        "substringEndOffset": 0,
                        "children": []
                      }
                    ],
                    [
                      {
                        "substring": "1 * f(1 + 1 - 1 + 0, ((((((0)))))), ((f(1 - 1))))",
                        "substringBeginOffset": 4,
                        "substringEndOffset": 52,
                        "children": [
                          [
                            {
                              "substring": "*",
                              "substringBeginOffset": 6,
                              "substringEndOffset": 6,
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
                          ],
                          [
                            {
                              "substring": "f(1 + 1 - 1 + 0, ((((((0)))))), ((f(1 - 1))))",
                              "substringBeginOffset": 8,
                              "substringEndOffset": 52,
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
                                    "substring": "1 + 1 - 1 + 0",
                                    "substringBeginOffset": 10,
                                    "substringEndOffset": 22,
                                    "children": [
                                      [
                                        {
                                          "substring": "+",
                                          "substringBeginOffset": 20,
                                          "substringEndOffset": 20,
                                          "children": []
                                        }
                                      ],
                                      [
                                        {
                                          "substring": "1 + 1 - 1",
                                          "substringBeginOffset": 10,
                                          "substringEndOffset": 18,
                                          "children": [
                                            [
                                              {
                                                "substring": "-",
                                                "substringBeginOffset": 16,
                                                "substringEndOffset": 16,
                                                "children": []
                                              }
                                            ],
                                            [
                                              {
                                                "substring": "1 + 1",
                                                "substringBeginOffset": 10,
                                                "substringEndOffset": 14,
                                                "children": [
                                                  [
                                                    {
                                                      "substring": "+",
                                                      "substringBeginOffset": 12,
                                                      "substringEndOffset": 12,
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
                                                "substring": "1",
                                                "substringBeginOffset": 18,
                                                "substringEndOffset": 18,
                                                "children": []
                                              }
                                            ]
                                          ]
                                        }
                                      ],
                                      [
                                        {
                                          "substring": "0",
                                          "substringBeginOffset": 22,
                                          "substringEndOffset": 22,
                                          "children": []
                                        }
                                      ]
                                    ]
                                  }
                                ],
                                [
                                  {
                                    "substring": "0",
                                    "substringBeginOffset": 31,
                                    "substringEndOffset": 31,
                                    "children": []
                                  }
                                ],
                                [
                                  {
                                    "substring": "f(1 - 1)",
                                    "substringBeginOffset": 42,
                                    "substringEndOffset": 49,
                                    "children": [
                                      [
                                        {
                                          "substring": "f",
                                          "substringBeginOffset": 42,
                                          "substringEndOffset": 42,
                                          "children": []
                                        }
                                      ],
                                      [
                                        {
                                          "substring": "1 - 1",
                                          "substringBeginOffset": 44,
                                          "substringEndOffset": 48,
                                          "children": [
                                            [
                                              {
                                                "substring": "-",
                                                "substringBeginOffset": 46,
                                                "substringEndOffset": 46,
                                                "children": []
                                              }
                                            ],
                                            [
                                              {
                                                "substring": "1",
                                                "substringBeginOffset": 44,
                                                "substringEndOffset": 44,
                                                "children": []
                                              }
                                            ],
                                            [
                                              {
                                                "substring": "1",
                                                "substringBeginOffset": 48,
                                                "substringEndOffset": 48,
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
                    ]
                  ]
                }
              ],
              [
                {
                  "substring": "((0)) + ((0))",
                  "substringBeginOffset": 58,
                  "substringEndOffset": 70,
                  "children": [
                    [
                      {
                        "substring": "+",
                        "substringBeginOffset": 64,
                        "substringEndOffset": 64,
                        "children": []
                      }
                    ],
                    [
                      {
                        "substring": "0",
                        "substringBeginOffset": 60,
                        "substringEndOffset": 60,
                        "children": []
                      }
                    ],
                    [
                      {
                        "substring": "0",
                        "substringBeginOffset": 68,
                        "substringEndOffset": 68,
                        "children": []
                      }
                    ]
                  ]
                }
              ]
            ]
          }
        ]);
      });
    }); 


  });



});

describe("parse()", () =>
{
  describe("Pre Conditions", () =>
  {
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
    signature.addRecord("succ", new TypedTokenRecord(new Type("i->i")));

    const symbolTable = new FunctionalSymbolsAndOperatorsTable();
    symbolTable.addFunctionalSymbol("f");
    symbolTable.addOperatorSymbol("^", 2, 1, 10, OperatorAssociativity.Left);
    symbolTable.addOperatorSymbol("*", 2, 1, 20, OperatorAssociativity.Left);
    symbolTable.addOperatorSymbol(":", 2, 1, 30, OperatorAssociativity.Left);
    symbolTable.addOperatorSymbol("+", 2, 1, 40, OperatorAssociativity.Left);
    symbolTable.addOperatorSymbol("-", 2, 1, 40, OperatorAssociativity.Left);
    symbolTable.addOperatorSymbol("succ", 1, 0, 1, OperatorAssociativity.Left);

    test("String must not be empty", () =>
    {
      expect(() => Parser.parse("", lexer, signature, symbolTable)).toThrow("Cannot parse empty string!");
    });

    test("String must contain at least one expression kernel", () =>
    {
      expect(() => Parser.parse(" ", lexer, signature, symbolTable)).toThrow("Premature end of string");
    });

    test(`Unsuitable way to start an expression`, () =>
    {
      expect(() => Parser.parse(" ) ", lexer, signature, symbolTable)).toThrow(`Found a RightRoundBracketToken `);
      expect(() => Parser.parse(" )( ", lexer, signature, symbolTable)).toThrow(`Found a RightRoundBracketToken `);
      expect(() => Parser.parse(" , ", lexer, signature, symbolTable)).toThrow(`Found a CommaToken `);
    });

    test("String should have ended", () =>
    {
      expect(() => Parser.parse(" (1 + 1)) ", lexer, signature, symbolTable)).toThrow("String should have ended here!");

      expect(() => Parser.parse(" (1 + 1), ", lexer, signature, symbolTable)).toThrow(`String should have ended here!`);
    });

    test(`Missing function application closing bracket`, () =>
    {
      expect(() => Parser.parse(" f(1 ", lexer, signature, symbolTable)).toThrow(`Premature end of string`);

      expect(() => Parser.parse(" f(1, f(1, f(1, 1, 0 + 0))", lexer, signature, symbolTable)).toThrow(`Premature end of string`);

      expect(() => Parser.parse(" f(1, f(1, f(1, 1, 0 + 0)) + 1", lexer, signature, symbolTable)).toThrow(`Premature end of string`);
    });

    test("Function empty argument", () =>
    {
      expect(() => Parser.parse(" f(1, , 1)", lexer, signature, symbolTable)).toThrow(`Found a CommaToken`);
    });

    test("Missing bracketed expression closing bracket", () =>
    {
      expect(() => Parser.parse(" ( 1 + 1 ", lexer, signature, symbolTable)).toThrow(`Premature end of string`);

      expect(() => Parser.parse(" (( 1 + 1) + 1 ", lexer, signature, symbolTable)).toThrow(`Premature end of string`);
    });
  });

  describe("Post Conditions", () =>
  {
    describe("Single Digit Arithmetic Infix Operator", () =>
    {
      const lexer = new LogosLexer();
      const signature = new LogosSignature();
      signature.addRecord("0", new TypedTokenRecord(new Type("i")));
      signature.addRecord("1", new TypedTokenRecord(new Type("i")));
      signature.addRecord("2", new TypedTokenRecord(new Type("i")));
      signature.addRecord("3", new TypedTokenRecord(new Type("i")));
      signature.addRecord("4", new TypedTokenRecord(new Type("i")));
      signature.addRecord("5", new TypedTokenRecord(new Type("i")));
      signature.addRecord("6", new TypedTokenRecord(new Type("i")));
      signature.addRecord("7", new TypedTokenRecord(new Type("i")));
      signature.addRecord("8", new TypedTokenRecord(new Type("i")));
      signature.addRecord("9", new TypedTokenRecord(new Type("i")));
      signature.addRecord("+", new TypedTokenRecord(new Type("[i,i]->i")));
      signature.addRecord("*", new TypedTokenRecord(new Type("[i,i]->i")));
      signature.addRecord("-", new TypedTokenRecord(new Type("[i,i]->i")));
      signature.addRecord(":", new TypedTokenRecord(new Type("[i,i]->i")));
      signature.addRecord("^", new TypedTokenRecord(new Type("[i,i]->i")));

      const symbolTable = new FunctionalSymbolsAndOperatorsTable();
      symbolTable.addOperatorSymbol("^", 2, 1, 10, OperatorAssociativity.Right);
      symbolTable.addOperatorSymbol("*", 2, 1, 20, OperatorAssociativity.Left);
      symbolTable.addOperatorSymbol(":", 2, 1, 30, OperatorAssociativity.Left);
      symbolTable.addOperatorSymbol("+", 2, 1, 40, OperatorAssociativity.Left);
      symbolTable.addOperatorSymbol("-", 2, 1, 50, OperatorAssociativity.Left);

      test("Operator precedence and associativity is respected", () =>
      {
        expect(Parser.parse("1 + 2 * 3 : 4 - 5 ^ 6", lexer, signature, symbolTable)["reducedNodeObject"]()).toStrictEqual({
          "substring": "1 + 2 * 3 : 4 - 5 ^ 6",
          "substringBeginOffset": 0,
          "substringEndOffset": 20,
          "children": [
            [
              {
                "substring": "-",
                "substringBeginOffset": 14,
                "substringEndOffset": 14,
                "children": []
              }
            ],
            [
              {
                "substring": "1 + 2 * 3 : 4",
                "substringBeginOffset": 0,
                "substringEndOffset": 12,
                "children": [
                  [
                    {
                      "substring": "+",
                      "substringBeginOffset": 2,
                      "substringEndOffset": 2,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "1",
                      "substringBeginOffset": 0,
                      "substringEndOffset": 0,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "2 * 3 : 4",
                      "substringBeginOffset": 4,
                      "substringEndOffset": 12,
                      "children": [
                        [
                          {
                            "substring": ":",
                            "substringBeginOffset": 10,
                            "substringEndOffset": 10,
                            "children": []
                          }
                        ],
                        [
                          {
                            "substring": "2 * 3",
                            "substringBeginOffset": 4,
                            "substringEndOffset": 8,
                            "children": [
                              [
                                {
                                  "substring": "*",
                                  "substringBeginOffset": 6,
                                  "substringEndOffset": 6,
                                  "children": []
                                }
                              ],
                              [
                                {
                                  "substring": "2",
                                  "substringBeginOffset": 4,
                                  "substringEndOffset": 4,
                                  "children": []
                                }
                              ],
                              [
                                {
                                  "substring": "3",
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
                            "substring": "4",
                            "substringBeginOffset": 12,
                            "substringEndOffset": 12,
                            "children": []
                          }
                        ]
                      ]
                    }
                  ]
                ]
              }
            ],
            [
              {
                "substring": "5 ^ 6",
                "substringBeginOffset": 16,
                "substringEndOffset": 20,
                "children": [
                  [
                    {
                      "substring": "^",
                      "substringBeginOffset": 18,
                      "substringEndOffset": 18,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "5",
                      "substringBeginOffset": 16,
                      "substringEndOffset": 16,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "6",
                      "substringBeginOffset": 20,
                      "substringEndOffset": 20,
                      "children": []
                    }
                  ]
                ]
              }
            ]
          ]
        });

        expect(Parser.parse("2 ^ 3 ^ 5", lexer, signature, symbolTable)["reducedNodeObject"]()).toStrictEqual({
          "substring": "2 ^ 3 ^ 5",
          "substringBeginOffset": 0,
          "substringEndOffset": 8,
          "children": [
            [
              {
                "substring": "^",
                "substringBeginOffset": 2,
                "substringEndOffset": 2,
                "children": []
              }
            ],
            [
              {
                "substring": "2",
                "substringBeginOffset": 0,
                "substringEndOffset": 0,
                "children": []
              }
            ],
            [
              {
                "substring": "3 ^ 5",
                "substringBeginOffset": 4,
                "substringEndOffset": 8,
                "children": [
                  [
                    {
                      "substring": "^",
                      "substringBeginOffset": 6,
                      "substringEndOffset": 6,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "3",
                      "substringBeginOffset": 4,
                      "substringEndOffset": 4,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "5",
                      "substringBeginOffset": 8,
                      "substringEndOffset": 8,
                      "children": []
                    }
                  ]
                ]
              }
            ]
          ]
        });

        expect(Parser.parse("1 - 2 - 3 - 4 - 5 - 6", lexer, signature, symbolTable)["reducedNodeObject"]()).toStrictEqual({
          "substring": "1 - 2 - 3 - 4 - 5 - 6",
          "substringBeginOffset": 0,
          "substringEndOffset": 20,
          "children": [
            [
              {
                "substring": "-",
                "substringBeginOffset": 18,
                "substringEndOffset": 18,
                "children": []
              }
            ],
            [
              {
                "substring": "1 - 2 - 3 - 4 - 5",
                "substringBeginOffset": 0,
                "substringEndOffset": 16,
                "children": [
                  [
                    {
                      "substring": "-",
                      "substringBeginOffset": 14,
                      "substringEndOffset": 14,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "1 - 2 - 3 - 4",
                      "substringBeginOffset": 0,
                      "substringEndOffset": 12,
                      "children": [
                        [
                          {
                            "substring": "-",
                            "substringBeginOffset": 10,
                            "substringEndOffset": 10,
                            "children": []
                          }
                        ],
                        [
                          {
                            "substring": "1 - 2 - 3",
                            "substringBeginOffset": 0,
                            "substringEndOffset": 8,
                            "children": [
                              [
                                {
                                  "substring": "-",
                                  "substringBeginOffset": 6,
                                  "substringEndOffset": 6,
                                  "children": []
                                }
                              ],
                              [
                                {
                                  "substring": "1 - 2",
                                  "substringBeginOffset": 0,
                                  "substringEndOffset": 4,
                                  "children": [
                                    [
                                      {
                                        "substring": "-",
                                        "substringBeginOffset": 2,
                                        "substringEndOffset": 2,
                                        "children": []
                                      }
                                    ],
                                    [
                                      {
                                        "substring": "1",
                                        "substringBeginOffset": 0,
                                        "substringEndOffset": 0,
                                        "children": []
                                      }
                                    ],
                                    [
                                      {
                                        "substring": "2",
                                        "substringBeginOffset": 4,
                                        "substringEndOffset": 4,
                                        "children": []
                                      }
                                    ]
                                  ]
                                }
                              ],
                              [
                                {
                                  "substring": "3",
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
                            "substring": "4",
                            "substringBeginOffset": 12,
                            "substringEndOffset": 12,
                            "children": []
                          }
                        ]
                      ]
                    }
                  ],
                  [
                    {
                      "substring": "5",
                      "substringBeginOffset": 16,
                      "substringEndOffset": 16,
                      "children": []
                    }
                  ]
                ]
              }
            ],
            [
              {
                "substring": "6",
                "substringBeginOffset": 20,
                "substringEndOffset": 20,
                "children": []
              }
            ]
          ]
        });
      });

      test("Brackets are parsed properly", () =>
      {
        expect(Parser.parse("(1 + 2) * 5", lexer, signature, symbolTable)["reducedNodeObject"]()).toStrictEqual({
          "substring": "(1 + 2) * 5",
          "substringBeginOffset": 0,
          "substringEndOffset": 10,
          "children": [
            [
              {
                "substring": "*",
                "substringBeginOffset": 8,
                "substringEndOffset": 8,
                "children": []
              }
            ],
            [
              {
                "substring": "1 + 2",
                "substringBeginOffset": 1,
                "substringEndOffset": 5,
                "children": [
                  [
                    {
                      "substring": "+",
                      "substringBeginOffset": 3,
                      "substringEndOffset": 3,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "1",
                      "substringBeginOffset": 1,
                      "substringEndOffset": 1,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "2",
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
                "substring": "5",
                "substringBeginOffset": 10,
                "substringEndOffset": 10,
                "children": []
              }
            ]
          ]
        });
      });

      test("Multiple nested brackets (including useless ones)", () =>
      {
        expect(Parser.parse("((((((((2)) * ((2)))))))) + (4)", lexer, signature, symbolTable)["reducedNodeObject"]()).toStrictEqual({
          "substring": "((((((((2)) * ((2)))))))) + (4)",
          "substringBeginOffset": 0,
          "substringEndOffset": 30,
          "children": [
            [
              {
                "substring": "+",
                "substringBeginOffset": 26,
                "substringEndOffset": 26,
                "children": []
              }
            ],
            [
              {
                "substring": "((2)) * ((2))",
                "substringBeginOffset": 6,
                "substringEndOffset": 18,
                "children": [
                  [
                    {
                      "substring": "*",
                      "substringBeginOffset": 12,
                      "substringEndOffset": 12,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "2",
                      "substringBeginOffset": 8,
                      "substringEndOffset": 8,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "2",
                      "substringBeginOffset": 16,
                      "substringEndOffset": 16,
                      "children": []
                    }
                  ]
                ]
              }
            ],
            [
              {
                "substring": "4",
                "substringBeginOffset": 29,
                "substringEndOffset": 29,
                "children": []
              }
            ]
          ]
        });
      });
    });

    describe("Single Digit Arithmetic Prefix Operator", () =>
    {
      const lexer = new LogosLexer();
      const signature = new LogosSignature();
      signature.addRecord("0", new TypedTokenRecord(new Type("i")));
      signature.addRecord("1", new TypedTokenRecord(new Type("i")));
      signature.addRecord("2", new TypedTokenRecord(new Type("i")));
      signature.addRecord("3", new TypedTokenRecord(new Type("i")));
      signature.addRecord("4", new TypedTokenRecord(new Type("i")));
      signature.addRecord("5", new TypedTokenRecord(new Type("i")));
      signature.addRecord("6", new TypedTokenRecord(new Type("i")));
      signature.addRecord("7", new TypedTokenRecord(new Type("i")));
      signature.addRecord("8", new TypedTokenRecord(new Type("i")));
      signature.addRecord("9", new TypedTokenRecord(new Type("i")));
      signature.addRecord("+", new TypedTokenRecord(new Type("[i,i]->i")));
      signature.addRecord("*", new TypedTokenRecord(new Type("[i,i]->i")));
      signature.addRecord("-", new TypedTokenRecord(new Type("[i,i]->i")));
      signature.addRecord(":", new TypedTokenRecord(new Type("[i,i]->i")));
      signature.addRecord("^", new TypedTokenRecord(new Type("[i,i]->i")));

      const symbolTable = new FunctionalSymbolsAndOperatorsTable();

      test("Default prefix operators are parsed properly", () =>
      {
        expect(Parser.parse("(- (+ 1 (: (* 2 3) 4)) (^ 5 6))", lexer, signature, symbolTable)["reducedNodeObject"]()).toStrictEqual({
          "substring": "- (+ 1 (: (* 2 3) 4)) (^ 5 6)",
          "substringBeginOffset": 1,
          "substringEndOffset": 29,
          "children": [
            [
              {
                "substring": "-",
                "substringBeginOffset": 1,
                "substringEndOffset": 1,
                "children": []
              }
            ],
            [
              {
                "substring": "+ 1 (: (* 2 3) 4)",
                "substringBeginOffset": 4,
                "substringEndOffset": 20,
                "children": [
                  [
                    {
                      "substring": "+",
                      "substringBeginOffset": 4,
                      "substringEndOffset": 4,
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
                  ],
                  [
                    {
                      "substring": ": (* 2 3) 4",
                      "substringBeginOffset": 9,
                      "substringEndOffset": 19,
                      "children": [
                        [
                          {
                            "substring": ":",
                            "substringBeginOffset": 9,
                            "substringEndOffset": 9,
                            "children": []
                          }
                        ],
                        [
                          {
                            "substring": "* 2 3",
                            "substringBeginOffset": 12,
                            "substringEndOffset": 16,
                            "children": [
                              [
                                {
                                  "substring": "*",
                                  "substringBeginOffset": 12,
                                  "substringEndOffset": 12,
                                  "children": []
                                }
                              ],
                              [
                                {
                                  "substring": "2",
                                  "substringBeginOffset": 14,
                                  "substringEndOffset": 14,
                                  "children": []
                                }
                              ],
                              [
                                {
                                  "substring": "3",
                                  "substringBeginOffset": 16,
                                  "substringEndOffset": 16,
                                  "children": []
                                }
                              ]
                            ]
                          }
                        ],
                        [
                          {
                            "substring": "4",
                            "substringBeginOffset": 19,
                            "substringEndOffset": 19,
                            "children": []
                          }
                        ]
                      ]
                    }
                  ]
                ]
              }
            ],
            [
              {
                "substring": "^ 5 6",
                "substringBeginOffset": 24,
                "substringEndOffset": 28,
                "children": [
                  [
                    {
                      "substring": "^",
                      "substringBeginOffset": 24,
                      "substringEndOffset": 24,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "5",
                      "substringBeginOffset": 26,
                      "substringEndOffset": 26,
                      "children": []
                    }
                  ],
                  [
                    {
                      "substring": "6",
                      "substringBeginOffset": 28,
                      "substringEndOffset": 28,
                      "children": []
                    }
                  ]
                ]
              }
            ]
          ]
        });
      });
    });



  });
});