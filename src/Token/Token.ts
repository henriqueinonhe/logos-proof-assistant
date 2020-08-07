/**
 * Very general class that represents a token generated
 * by a lexer.
 * 
 * Basically serves as a way to encapsulate a string in a single
 * token.
 * 
 * Class Invariants:
 * - Tokens are immutable, its internal string
 * is preserverd throughout its life.
 */
export class Token
{
  /**
   * Constructs a Token from a string.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Internal string must be set to input string.
   * 
   * @param string 
   */
  constructor(string : string)
  {
    this.string = string;
  }

  /**
   * Returns token's internal string.
   * Const
   * 
   * Pre Conditions:
   * None
   */
  public toString() : string
  {
    return this.string;
  }

  /**
   * Deep Equality.
   * Const.
   * 
   * Pre Conditions: None
   * 
   * Post Conditions: 
   * - Returns whether `this` is equal
   * to  `other.
   * 
   */
  public isEqual(other : Token) : boolean
  {
    return this.string === other.string;
  }

  private string : string;
}