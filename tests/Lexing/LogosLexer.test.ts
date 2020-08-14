import { LogosSignature } from "../../src/Lexing/LogosSignature";
import { TypedTokenRecord } from "../../src/Lexing/TypedTokenRecord";
import { Type } from "../../src/Type/Type";
import { LogosLexer } from "../../src/Lexing/LogosLexer";

describe("lex()", () =>
{
  const signature = new LogosSignature();
  signature.addRecord("0", new TypedTokenRecord(new Type("i")));
  signature.addRecord("1", new TypedTokenRecord(new Type("i")));
  signature.addRecord("11", new TypedTokenRecord(new Type("i")));
  const lexer = new LogosLexer();

  describe("Pre Conditions", () =>
  {
    test("Every non punctuation token must be present in the signature", () =>
    {
      expect(() => lexer.lex("2", signature)).toThrow("is not present in the signature!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Round brackets are lexed correctly", () =>
    {
      expect(lexer.lex(")(()(()))(", signature).getTokenList().map(token => token.toString())).toStrictEqual([")", "(", "(", ")", "(", "(", ")", ")", ")", "("]);
    });

    test("Whitespace is lexed correctly", () =>
    {
      expect(lexer.lex("   (      )   ", signature).getTokenList().map(token => token.toString())).toStrictEqual([" ", " ", " ", "(", " ", " ", " ", " ", " ", " ", ")", " ", " ", " "]);
    });

    test("Non punctuation tokens are lexed correctly", () =>
    {
      expect(lexer.lex("(0 0 1)1 1 1 11 0 0 ( )", signature).getTokenList().map(token => token.toString())).toStrictEqual(["(", "0", " ", "0", " ", "1", ")", "1", " ", "1", " ", "1", " ", "11", " ", "0", " ", "0", " ", "(", " ", ")"]);
    });

    test("Commas are lexed correctly", () =>
    {
      expect(lexer.lex("0,1,1,1,,", signature).getTokenList().map(token => token.toString())).toStrictEqual(["0", ",", "1", ",", "1", ",", "1", ",", ","]);
    });
  });
});