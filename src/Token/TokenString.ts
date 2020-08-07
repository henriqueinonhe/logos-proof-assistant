import { Token } from "./Token";
import { Utils, LogicErrorException } from "../Utils/LogosUtils";

/**
 * Represents a string of tokens.
 */
export class TokenString
{
  /**
   * Constructs a [[TokenString]] from an array of
   * [[Token]]s.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Token string internal token list must be initialized
   * to copy of input token list.
   * 
   * @param tokenList 
   */
  constructor(tokenList : Array<Token>)
  {
    this.tokenList = tokenList.slice(); //Passing by value
  }

  /**
   * Convenience constructor that takes a list of strings and maps
   * it to a token list.
   * 
   * Pre Conditions: 
   * None
   * 
   * Post Conditions:
   * - Returns a [[TokenString]] mapping strings from input string list
   * to a token list.
   * 
   * @param stringList 
   */
  public static fromStringArray(stringList : Array<string>) : TokenString
  {
    const tokenList = stringList.map(string => new Token(string));
    return new TokenString(tokenList);
  }

  /**
   * Converts tokens to strings and concatenates them in a single string.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns tokens from token list converted to strings and concatenated.
   * 
   */
  public toString() : string
  {
    return this.tokenList.map(token => token.toString()).join("");
  }

  /**
   * Returns internal token list by value.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns copy of internal token list.
   */
  public getTokenList() : Array<Token>
  {
    return this.tokenList.slice();
  }

  /**
   * Returns whether the token string has no tokens
   * in its token list.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns whether internal token list has length 0.
   */
  public isEmpty() : boolean
  {
    return this.tokenList.length === 0;
  }

  /**
   * Returns token at the given index.
   * Const.
   * 
   * Pre Conditions:
   * - `index` must be a valid index within the token list.
   * 
   * Post Conditions:
   * - Returns token associated with given index.
   * 
   * @param index 
   */
  public tokenAt(index : number) : Token
  {
    Utils.validateIndex(index, "index", this.tokenList.length, "tokenList");

    return this.tokenList[index];
  }

  /**
   * Deep equality.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns whether two token strings have exactly the same tokens
   * in the same order.
   */
  public isEqual(other : TokenString) : boolean
  {
    return this.tokenList.length === other.tokenList.length &&
           this.tokenList.every((token, index) => token.isEqual(other.tokenAt(index)));
  }

  /**
   * Returns the number of tokens of the token string.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns length of internal token list.
   */
  public size() : number
  {
    return this.tokenList.length;
  }

  /**
   * TokenString equivalent of JS's String slice.
   * Const.
   * 
   * Pre Conditions:
   * - Indexes must be within bounds.
   * 
   * Post Conditions:
   * - Returns substring starting at `startIndex` and ending at one before
   * `endIndex`.
   * 
   * @param startIndex 
   * @param endIndex 
   */
  public slice(startIndex ? : number | undefined, endIndex ? : number | undefined) : TokenString
  {
    if(startIndex !== undefined)
    {
      Utils.validateIndex(startIndex, "startIndex", this.size(), "tokenList");
    }

    if(endIndex !== undefined)
    {
      Utils.validateIndex(endIndex);
      const inclusiveEndIndex = endIndex - 1;
      if(inclusiveEndIndex >= this.size())
      {
        throw new LogicErrorException(`"endIndex" (${endIndex}) is out of bounds!`);
      }
    }

    return new TokenString(this.tokenList.slice(startIndex, endIndex));
  }

  /**
   * TokenString equivalent of JS String startsWith.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns whether this token string begins with another token string.
   * 
   * @param other 
   */
  public startsWith(other : TokenString) : boolean
  {
    if(other.size() > this.size())
    {
      return false;
    }

    for(let index = 0; index < other.size(); index++)
    {
      const currentThisToken = this.tokenAt(index);
      const currentOtherToken = other.tokenAt(index);
      if(!currentThisToken.isEqual(currentOtherToken))
      {
        return false;
      }
    }

    return true;
  }

  /**
   * TokenString equivalent of JS String endsWith.
   * Const.
   * 
   * Pre Conditions:
   * None.
   * 
   * Post Conditions:
   * - Returns whether this token string ends with another token string.
   * 
   * @param other 
   */
  public endsWith(other : TokenString) : boolean
  {
    const zeroIndexBasedCompensation = 1;
    for(let count = 0; count < other.size(); count++)
    {
      const thisIndex = this.size() - count - zeroIndexBasedCompensation;
      const otherIndex = other.size() - count - zeroIndexBasedCompensation;
      if(thisIndex < 0)
      {
        return false;
      }

      if(!this.tokenAt(thisIndex).isEqual(other.tokenAt(otherIndex)))
      {
        return false;
      }
    }

    return true;
  }

  /**
   * Deep copy.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns deep copy of token string.
   * 
   */
  public clone() : TokenString
  {
    return new TokenString(this.tokenList.slice());
  }

  /**
   * [[TokenString]] equivalent of JS Array every.
   * Non-const.
   * 
   * Pre Conditions:
   * None
   * 
   * 
   * @param callbackfn 
   * @param thisArg 
   */
  public every(callbackfn : (value : Token, index : number, array : Array<Token>) => unknown, thisArg ? : TokenString/* This was "any" in the original declaration */) : boolean
  {
    return this.tokenList.every(callbackfn, thisArg);
  }
    
  /**
   * [[TokenString]] equivalent of JS Array some.
   * Non-const.
   * 
   * Pre Conditions:
   * None
   * 
   * @param callbackfn 
   * @param thisArg 
   */
  public some(callbackfn : (value : Token, index : number, array : Array<Token>) => unknown, thisArg ? : TokenString/* This was "any" in the original declaration */) : boolean
  {
    return this.tokenList.some(callbackfn, thisArg);
  }

  /**
   * [[TokenString]] equivalent of JS array reduce.
   * Non-const.
   * 
   * Pre Conditions:
   * None
   * 
   * @param callbackfn 
   * @param initialValue 
   */
  public reduce<T>(callbackfn : (previousValue : T, currentValue : Token, currentIndex : number, array : Token[]) => T, initialValue : T) : T
  {
    return this.tokenList.reduce<T>(callbackfn, initialValue);
  }

  /**
   * Checks whether a given tokenString is a substring
   * of this from a given index.
   * 
   * Pre Conditions:
   * - `startIndex` must be within bounds.
   * 
   * @param tokenString 
   * @param startIndex 
   */
  public includes(tokenString : TokenString, startIndex = 0) : boolean
  {
    Utils.validateIndex(startIndex, "startIndex", tokenString.size(), "tokenString");

    for(let index = startIndex; index < this.size(); index++)
    {
      const endIndex = Math.min(index + tokenString.size(), this.size());
      if(this.slice(index, endIndex).isEqual(tokenString))
      {
        return true;
      }
    }

    return false;
  }

  private tokenList : Array<Token>;
}