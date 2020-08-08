import { TokenString } from "../Token/TokenString";
import { Signature } from "./Signature";
import { Token } from "../Token/Token";
import { InvalidArgumentException } from "../Utils/LogosUtils";

/**
 * Represents a generic lexer whose primary function is to tokenize a given 
 * string and make sure that each token is present in the given signature.
 * 
 * To extend [[Lexer]] you must implement
 * 
 * ```
 * protected abstract nextToken(string : string, currentIndex : number, signature : Signature) : [Token, number];
 * ```
 * 
 * which is a mthod that returns both the next tokenized token and the index at the next character
 * to start scanning again.
 * 
 * Each and every token returned by this method has its presence in the signature
 * checked.
 */
export abstract class Lexer
{
  /**
   * Tokenizes a string and returns corresponding [[TokenString]].
   * Const.
   * 
   * Pre Conditions:
   * - Highly depends on `nextToken` implementation, but generally speaking
   * there should be no extraneous sequence of characters in the string and
   * every recognized token should be registered in the signature.
   * 
   * Post Conditions:
   * - Returns tokenized string.
   * 
   * 
   * @param string 
   * @param signature 
   */
  public lex(string : string, signature : Signature) : TokenString
  {
    const tokenList = [];
    let currentToken;
    let currentIndex = 0;
    while(currentIndex < string.length)
    {
      [currentToken, currentIndex] = this.nextToken(string, currentIndex, signature);
      if(!signature.hasRecord(currentToken.toString()))
      {
        throw new InvalidArgumentException(`Token "${currentToken.toString()}" is not present in the signature!`);
      }
      tokenList.push(currentToken);
    }
    return new TokenString(tokenList);
  }

  protected abstract nextToken(string : string, currentIndex : number, signature : Signature) : [Token, number];
}