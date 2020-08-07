import { TokenRecord } from "./TokenRecord";
import { InvalidArgumentException } from "../Utils/LogosUtils";

/**
 * Represents a signature that keeps token records.
 */
export class Signature
{
  /**
   * Constructs a [[Signature]].
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Internal token records are initialized to an empty map.
   */
  constructor()
  {
    this.tokenRecords = new Map();
  }

  /**
   * Adds a token record associated with a token, if said token is not already
   * associated with a record.
   * Non-const.
   * 
   * Pre Conditions:
   * - Input token must not already be associated with a record.
   * 
   * Post Conditions:
   * - Adds `record` associated with `token`.
   * 
   * 
   * @param token 
   * @param record 
   */
  public addRecord(token : string, record : TokenRecord) : void
  {
    if(this.tokenRecords.has(token))
    {
      throw new InvalidArgumentException(`Token "${token}" already has a record associated with it!`);
    }

    this.tokenRecords.set(token, record);
  }

  /**
   * Removes a token/record association, it is present in the signature.
   * Non-const.
   * 
   * Pre Conditions:
   * - Token/record association must be present in the signature.
   * 
   * Post Conditions:
   * - Removes token/record association.
   * 
   * @param token 
   */
  public removeRecord(token : string) : void
  {
    if(!this.tokenRecords.has(token))
    {
      throw new InvalidArgumentException(`There is no record associated with "${token}".`);
    }

    this.tokenRecords.delete(token);
  }

  /**
   * Returns record associated with `token`.
   * Const.
   * 
   * Pre Conditions:
   * - There must be a record associated with `token`.
   * 
   * Post Conditions:
   * - Returns record associated with `token`.
   * 
   * @param token 
   */
  public getRecord(token : string) : TokenRecord
  {
    if(!this.tokenRecords.has(token))
    {
      throw new InvalidArgumentException(`There is no record associated with "${token}".`);
    }

    //NOTE Maybe return by value
    return this.tokenRecords.get(token) as TokenRecord;
  }

  private tokenRecords : Map<string, TokenRecord>;
}