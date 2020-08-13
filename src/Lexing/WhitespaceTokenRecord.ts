import { TokenRecord } from "./TokenRecord";

/**
 * Represents a record of a token that is a whitespace.
 */
export class WhitespaceTokenRecord implements TokenRecord
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
    return "WhitespaceToken";
  }
}