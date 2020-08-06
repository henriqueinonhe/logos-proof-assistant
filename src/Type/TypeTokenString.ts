import { TypeToken, TypeTokenSort } from "./TypeToken";
import { ParsingException } from "../Utils/ParsingException";
import { Utils, LogicErrorException } from "../Utils/LogosUtils";

/**
 * This class represents a string of [[TypeToken]]s.
 * It functions as a concatenation of tokens that may or may not represent a 
 * valid type.
 * 
 * The main reason for this class existence is to perform lexing on a raw string 
 * so that the TypeTokenString can be later parsed and transformed into its 
 * tree representation.
 * 
 * Class Invariants:
 * - At all times a [[TypeTokenString]] will be composed
 * of a sequence of valid [[TypeToken]]s.
 */
export class TypeTokenString
{
  /**
   * Tokenization of a given string into [[TypeToken]]s.
   * 
   * If the string contains an invalid token, it throws an
   * exception.
   * 
   * Ignores whitespaces.
   * 
   * Pre Conditions:
   * - `string` after it has been broken up should only
   * yield valid [[TypeToken]]s.
   * 
   * Post Conditions:
   * - Returns an array of [[TypeToken]]s that corresponds
   * to the input `string`.
   * 
   * @param string String to be tokenized.
   * @returns Tokenized string as an array.
   */
  private static lexString(string : string) : Array<TypeToken>
  {
    const tokenList : Array<TypeToken> = [];
    for(let index = 0; index < string.length; index++)
    {
      const currentCharacter = string[index];
      if(/\s/.test(currentCharacter))
      {
        //Ignores whitespace
      }
      else if(currentCharacter === "(")
      {
        tokenList.push(new TypeToken("("));
      }
      else if(currentCharacter === ")")
      {
        tokenList.push(new TypeToken(")"));
      }
      else if(currentCharacter === "[")
      {
        tokenList.push(new TypeToken("["));
      }
      else if(currentCharacter === "]")
      {
        tokenList.push(new TypeToken("]"));
      }
      else if(currentCharacter === ",")
      {
        tokenList.push(new TypeToken(","));
      }
      else if(currentCharacter === "-")
      {
        index = TypeTokenString.parseCompositionOperator(tokenList, string, index);
      }
      else
      {
        index = TypeTokenString.parsePrimitiveType(tokenList, string, index);
      }
    }

    return tokenList;
  }
  /**
   * The composition operator ("->") spans 2 characters,
   * therefore whenever [[lexString]] finds a "-" it treats
   * it as an incomplete composition operator, so it tries to "complete" the 
   * operator by checking the next character in the string.
   * 
   * If successfull it tokenizes the operator and returns
   * the updated index, otherwise it throws an exception.
   * 
   * Pre Conditions:
   * - `index` should be within bounds of `string` valid indexes.
   * - `string` character at `index + 1` must be ">".
   * 
   * Post Conditions:
   * - Composition operator is pushed into `tokenList`
   * 
   * @param tokenList (out) Array of [[TypeToken]]s where the composition 
   * operator will be pushed into.
   * @param string Input string
   * @param index Index of the "-" character.
   * @returns Updated index.
   */
  private static parseCompositionOperator(tokenList : Array<TypeToken>, string : string, index : number) : number
  {
    const nextCharacterIndex = index + 1;
    if(string[nextCharacterIndex] === ">")
    {
      tokenList.push(new TypeToken("->"));
    }
    else
    {
      const dashIndex = index;
      throw new ParsingException("The composition operator is incomplete!", dashIndex, dashIndex, string);
    }

    return nextCharacterIndex;
  }
  /**
   * Whenever [[lexString]] finds a charater that is not a punctuation
   * nor an operator nor a whitespace, it assumes the next substring represents
   * a primitive type, accumulating characters until it finds a separator, that
   * is, a punctuation, an operator or a whitespace, or until the string ends.
   * 
   * Returns the updated index.
   * 
   * Pre Conditions:
   * - The `string`'s substring that is a candidate for a primitive token must
   * conform to the syntax of primitive tokens. (See [[TypeToken]])
   * 
   * Post Conditions:
   * - The primitive token extracted must be pushed into `tokenList`.
   * - Returns the index of the token's last character.
   * 
   * @param tokenList 
   * @param string 
   * @param index Index of the token's first character
   * @returns Updated index (token's last character).
   */
  private static parsePrimitiveType(tokenList : Array<TypeToken>, string : string, index : number) : number
  {
    const startIndex = index;
    let stringHasntEnded = index < string.length;
    let currentCharacter = string[index];
    let currentCharacterIsSeparator = TypeTokenString.characterIsSeparator(currentCharacter);
    while(stringHasntEnded && !currentCharacterIsSeparator)
    {
      //Action
      index++;

      //Updates
      stringHasntEnded = index < string.length;
      currentCharacter = string[index];
      currentCharacterIsSeparator = TypeTokenString.characterIsSeparator(currentCharacter);
    }

    const endIndex = index;
    try //Constructing a new TypeToken may fail due to not conforming to the syntax of primitive tokens
    {
      const extractedPrimitiveToken = new TypeToken(string.slice(startIndex, endIndex));
      tokenList.push(extractedPrimitiveToken);
    }
    catch(error)
    {
      if(error.type === "InvalidArgumentException")
      {
        const explanation = error.message;
        const inclusiveEndIndexCompensation = 1;
        throw new ParsingException(explanation, startIndex, endIndex - inclusiveEndIndexCompensation, string);
      }
      else
      {
        throw error;
      }
    }

    const tokenLookaheadCompensation = 1;
    index -= tokenLookaheadCompensation;
    return index;
  }
  /**
   * Separators are operators, punctuation tokens or whitespace.
   * 
   * It's what tells us when primitive tokens end.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns whether the given character is a separator.
   * 
   * @param character 
   */
  private static characterIsSeparator(character : string) : boolean
  {
    return character === "(" ||
           character === ")" ||
           character === "[" ||
           character === "]" ||
           character === "," ||
           character === "-" ||
           character === " ";
  }

  /**
   * Constructs a [[TypeTokenString]].
   * 
   * Pre Conditions:
   * - `string` after it has been broken up should only
   * yield valid [[TypeToken]]s.
   * 
   * Post Conditions:
   * - Internal token list should be set accordingly.
   * 
   * @param string 
   */
  constructor(string : string)
  {
    this.tokenList = TypeTokenString.lexString(string);
  }
  /**
   * Converts tokenList to string representation.
   * Const.
   * 
   * Pre Conditions:
   * None.
   * 
   * Post Conditions:
   * - Returns stringnized representation of [[TypeTokenString]] in such a way 
   * that should one take this representation as the input to create another
   * [[TypeTokenString]], it would yield an identical [[TypeTokenString]]. (That
   * is, this method could serve as a means to serialize the object).
   */
  public toString() : string
  {
    //An important detail to observe regarding formatting is that
    //between two primitive tokens there should always be a space,
    //even though there will never be a valid type where one primitive
    //token directly follows another.
    return this.tokenList.reduce<string>((string, token, index) =>
    {
      if(token.getSort() === TypeTokenSort.PrimitiveType)
      {
        const lookaheadTokenIndex = index + 1;
        const lookaheadTokenExists = lookaheadTokenIndex < this.tokenList.length;
        if(lookaheadTokenExists)
        {
          const lookaheadToken = this.tokenList[lookaheadTokenIndex];
          if(lookaheadToken.getSort() === TypeTokenSort.PrimitiveType)
          {
            return string + token.toString() + " ";
          }
        }
      }
      return string + token.toString();
    }, "");
  }
  /**
   * Returns tokenList array by value.
   * Const.
   * 
   * Pre Conditions:
   * None.
   * 
   * Post Conditions:
   * - Returns a copy of internal token list.
   */
  public getTokenList() : Array<TypeToken>
  {
    //NOTE There is no need of deep copy here
    //since [[TypeToken]]s are immutable anyways.
    return this.tokenList.slice();
  }
  /**
   * Returns the string length (considering tokens, NOT characters).
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns the length of the internal token list.
   */
  public size() : number
  {
    return this.tokenList.length;
  }
  /**
   * Deep comparison.
   * Const.
   * 
   * Pre Conditions:
   * None
   *  
   * Post Conditions:
   * - Deep comparison of two [[TypeTokenString]]s.
   * 
   * @param other 
   */
  public isEqual(other : TypeTokenString) : boolean
  {
    return other instanceof TypeTokenString &&
           this.toString() === other.toString();
  }
  /**
   * Slices [[TypeTokenString]] considering the token list,
   * (therefore offsets do NOT refer to characters, but to tokens).
   * Const.
   * 
   * End offset is non-inclusive.
   * 
   * Pre Conditions:
   * - `beginOffset` (when present) must be a valid index of [[TypeTokenString]]'s
   * internal token list.
   * - `endOffset` (when present) must be a valid index of [[TypeTokenString]]'s
   * internal token list.
   * 
   * Post Conditions:
   * - Returns a [[TypeTokenString]] that is composed of the appropriate 
   * token list subarray.
   * 
   * @param beginOffset 
   * @param endOffset 
   */
  public slice(beginOffset ?: number, endOffset ?: number) : TypeTokenString
  {
    //Validation
    if(beginOffset !== undefined)
    {
      Utils.validateIndex(beginOffset, "beginOffset");
    }

    if(endOffset !== undefined)
    {
      Utils.validateIndex(endOffset, "endOffset");
    }

    if(endOffset as number > this.tokenList.length)
    {
      throw new LogicErrorException(`endOffset is expected to be <= tokenList length (${this.tokenList.length}), but ${endOffset} was passed instead.`);
    }


    //Logic
    return new TypeTokenString(this.tokenList.slice(beginOffset, endOffset).
      map(token => token.toString()).join(" "));
  }
  /**
   * Returns the [[TypeToken]] at the chosen index.
   * Const.
   * 
   * Pre Conditions:
   * - `index` must be a valid index of [[TypeTokenString]] token list.
   * 
   * Post Conditions:
   * - Returns corresponding [[TypeToken]].
   * 
   * @param index 
   */
  public tokenAt(index : number) : TypeToken
  {
    Utils.validateIndex(index, "index", this.tokenList.length, "tokenList");
    return this.tokenList[index];
  }
  /**
   * Tokens that compose the [[TypeTokenString]].
   */
  private tokenList : Array<TypeToken>;
}