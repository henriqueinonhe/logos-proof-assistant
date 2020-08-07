import { TokenRecord } from "./TokenRecord";
import { InvalidArgumentException } from "../Utils/LogosUtils";

/**
 * Represents a signature that keeps token records.
 */
export class Signature
{
  constructor()
  {
    this.tokenRecords = new Map();
  }

  public addRecord(token : string, record : TokenRecord) : void
  {
    if(this.tokenRecords.has(token))
    {
      throw new InvalidArgumentException(`Token "${token}" already has a record associated with it!`);
    }

    this.tokenRecords.set(token, record);
  }

  public removeRecord(token : string) : void
  {
    if(!this.tokenRecords.has(token))
    {
      throw new InvalidArgumentException(`There is no record associated with "${token}".`);
    }

    this.tokenRecords.delete(token);
  }

  public getRecord(token : string) : TokenRecord
  {
    if(!this.tokenRecords.has(token))
    {
      throw new InvalidArgumentException(`There is no record associated with "${token}".`);
    }

    return this.tokenRecords.get(token) as TokenRecord;
  }

  private tokenRecords : Map<string, TokenRecord>;
}