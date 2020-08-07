import { TokenRecord } from "./TokenRecord";
import { Type } from "../Type/Type";

/**
 * Represents a record of a token that has a type associated with it.
 */
export class TypedTokenRecord implements TokenRecord
{
  /**
   * Constructs a [[TypedTokenRecord]].
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Initializes internal type to input type.
   * 
   * @param type 
   */
  constructor(type : Type)
  {
    this.type = type;
  }

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
    return "TypedToken";
  }

  /**
   * Returns type.
   * Const.
   * 
   * Pre Conditions: 
   * - None
   */
  public getType() : Type
  {
    return this.type;
  }
  
  private type : Type;
}