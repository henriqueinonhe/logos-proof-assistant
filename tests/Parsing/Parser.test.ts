import { Parser, BracketWrapper } from "../../src/Parsing/Parser";
import { LogosLexer } from "../../src/Lexing/LogosLexer";
import { LogosSignature } from "../../src/Lexing/LogosSignature";
import { TypedTokenRecord } from "../../src/Lexing/TypedTokenRecord";
import { Type } from "../../src/Type/Type";

describe("private wrapTokenStringAndHandleBrackets()", () =>
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
      expect(() => Parser["wrapTokenStringAndHandleBrackets"](lexer.lex("1 1 ) (", signature))).toThrow("Brackets at the following indexes are unmatched: 6, 4");
      expect(() => Parser["wrapTokenStringAndHandleBrackets"](lexer.lex(")))1 1 ) (", signature))).toThrow("Brackets at the following indexes are unmatched: 9, 0, 1, 2, 7");
      expect(() => Parser["wrapTokenStringAndHandleBrackets"](lexer.lex(") ( )1 1 ) (", signature))).toThrow("Brackets at the following indexes are unmatched: 11, 0, 9");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Bracket iterators are properly set and tokens wrapped", () =>
    {
      const tokenWrapperList = Parser["wrapTokenStringAndHandleBrackets"](lexer.lex("(((0 + 1) + 1) + ((0 + 1) + 1))", signature));
      for(let index = 0; index < tokenWrapperList.size(); index++)
      {
        expect(tokenWrapperList.at(index).correspondingInputTokenOffset).toBe(index);
      }

      expect((tokenWrapperList.at(0) as BracketWrapper).matchingBracketIterator?.get()).toBe(tokenWrapperList.at(30));
      expect((tokenWrapperList.at(1) as BracketWrapper).matchingBracketIterator?.get()).toBe(tokenWrapperList.at(13));
      expect((tokenWrapperList.at(2) as BracketWrapper).matchingBracketIterator?.get()).toBe(tokenWrapperList.at(8));
      expect((tokenWrapperList.at(8) as BracketWrapper).matchingBracketIterator?.get()).toBe(tokenWrapperList.at(2));
      expect((tokenWrapperList.at(13) as BracketWrapper).matchingBracketIterator?.get()).toBe(tokenWrapperList.at(1));
      expect((tokenWrapperList.at(17) as BracketWrapper).matchingBracketIterator?.get()).toBe(tokenWrapperList.at(29));
      expect((tokenWrapperList.at(18) as BracketWrapper).matchingBracketIterator?.get()).toBe(tokenWrapperList.at(24));
    });
  });
});