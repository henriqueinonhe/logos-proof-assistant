import { TypedTokenRecord } from "./TypedTokenRecord";
import { Type } from "../Type/Type";

export class VariableBindingTokenRecord extends TypedTokenRecord
{
  /**
   * Constructs a [[VariableBindingTokenRecord]].
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Sets internal type to input type.
   * 
   * @param type 
   */
  constructor(type : Type)
  {
    super(type);
  }

  
  public sort() : string
  {
    return "VariableBindingToken";
  }
}