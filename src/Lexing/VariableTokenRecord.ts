import { Type } from "../Type/Type";
import { TypedTokenRecord } from "./TypedTokenRecord";

export class VariableTokenRecord extends TypedTokenRecord
{
  constructor(type : Type)
  {
    super(type);
  }

  public sort() : string
  {
    return "VariableToken";
  }
}