import { TokenRecord } from "./TokenRecord";

/**
 * Represents a record of a token that is a left round bracket.
 */
export class LeftRoundBracketTokenRecord implements TokenRecord
{
  /**
   * Returns token sort.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns associated token sort.
   * 
   */
  public sort() : string
  {
    return "LeftRoundBracketToken";
  }
}