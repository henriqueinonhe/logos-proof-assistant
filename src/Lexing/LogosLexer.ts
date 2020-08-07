import { Lexer } from "./Lexer";
import { TokenString } from "../Token/TokenString";
import { LogosSignature } from "./LogosSignature";
import { Token } from "../Token/Token";
import { InvalidArgumentException } from "../Utils/LogosUtils";

export class LogosLexer implements Lexer
{
  /**
   * Lexes a string into a [[TokenString]].
   * 
   * Tokens must be present in the signature, otherwise lexing will fail.
   * 
   * Pre Conditions:
   * - Each recognized token must be present in the signature.
   * 
   * Post Conditions:
   * - Returns lexed [[TokenString]].
   * 
   * @param string 
   * @param signature 
   */
  public lex(string : string, signature : LogosSignature) : TokenString
  {
    const tokenList = [];
    let index = 0;
    while(index < string.length)
    {
      const currentChar = string[index];
      if(currentChar === "(" ||
         currentChar === ")")
      {
        tokenList.push(new Token(currentChar));
        index++;
      }
      else if(currentChar === " ")
      {
        index = this.lexWhitespace(tokenList, string, index);
      }
      else
      {
        index = this.lexNonPunctuationToken(tokenList, string, index, signature);
      }
    }
    return new TokenString(tokenList);
  }

  /**
   * Lexes whitespace substring and returns the index to a character after
   * the substring.
   * 
   * @param tokenList 
   * @param string 
   * @param startIndex 
   */
  private lexWhitespace(tokenList : Array<Token>, string : string, startIndex : number) : number
  {
    //Finds end of whitespace-only substring
    let index = startIndex;
    while(index < string.length && string[index] === " ")
    {
      index++;
    }
    tokenList.push(new Token(" "));
    return index;
  }

  /**
   * Lexes a substring that corresponds to a non punctuation token.
   * 
   * Checks whether the token is present in the signature.
   * 
   * Returns index to the character after the substring.
   * 
   * @param tokenList 
   * @param string 
   * @param startIndex 
   */
  private lexNonPunctuationToken(tokenList : Array<Token>, string : string, startIndex : number, signature : LogosSignature) : number
  {
    let token = "";
    let index = startIndex;
    let currentCharacter = string[index];
    while(index < string.length && !this.characterIsSeparator(currentCharacter))
    {
      token += currentCharacter;
      index++;
      currentCharacter = string[index];
    }
    
    if(!signature.hasRecord(token))
    {
      throw new InvalidArgumentException(`Token "${token}" was lexed but no record associated with it was found in the signature!`);
    }
    tokenList.push(new Token(token));
    return index;
  }

  /**
   * Returns whether a given character is a separator.
   * 
   * @param character 
   */
  private characterIsSeparator(character : string) : boolean
  {
    return character === "(" ||
           character === ")" ||
           character === " ";
  }
}
