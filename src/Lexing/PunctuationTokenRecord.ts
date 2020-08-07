import { TokenRecord } from "./TokenRecord";

/**
 * Represents a record of a token that is used for punctuation and therefore 
 * has no type information associated with it.
 */
export class PunctuationTokenRecord implements TokenRecord
{
  //NOTE Maybe implement role field to differentiate between different 
  //punctuations...
  
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
    return "PunctuationToken";
  }
}