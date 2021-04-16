import { Lexer } from "./Lexer";
import { Token } from "../Token/Token";
import { Signature } from "./Signature";

export class LogosLexer extends Lexer
{
  /**
   * Returns next token in string.
   * 
   * @param string 
   * @param signature 
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected nextToken(string : string, currentIndex : number, signature : Signature) : [Token, number]
  {
    const currentChar = string[currentIndex];
    if(this.characterIsSeparator(currentChar))
    {
      const newIndex = currentIndex + 1;
      return [new Token(currentChar), newIndex];
    }
    else
    {
      return this.lexNonPunctuationToken(string, currentIndex);
    }
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
  private lexNonPunctuationToken(string : string, startIndex : number) : [Token, number]
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
    return [new Token(token), index];
  }

  /**
   * Returns whether a given character is a separator.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns whether a given character acts as a separator.
   * 
   * @param character 
   */
  private characterIsSeparator(character : string) : boolean
  {
    return character === "(" ||
           character === ")" ||
           character === " " ||
           character === ",";
  }
}
