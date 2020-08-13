import { Signature } from "./Signature";
import { TokenRecord } from "./TokenRecord";
import { InvalidArgumentException } from "../Utils/LogosUtils";
import { LeftRoundBracketTokenRecord } from "./LeftRoundBracketTokenRecord";
import { RightRoundBracketTokenRecord } from "./RightRoundBracketTokenRecord";
import { WhitespaceTokenRecord } from "./WhitespaceTokenRecord";
import { CommaTokenRecord } from "./CommaTokenRecord";

export class LogosSignature implements Signature
{
  /**
   * Constructs a [[LogosSignature]].
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Punctuation tokens are added to the internal token records.
   */
  constructor()
  {
    this.tokenRecords = new Map();
    this.addRecord("(", new LeftRoundBracketTokenRecord());
    this.addRecord(")", new RightRoundBracketTokenRecord());
    this.addRecord(" ", new WhitespaceTokenRecord());
    this.addRecord(",", new CommaTokenRecord());
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

  /**
   * Returns whether a given token has a record associated with it.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * @param token 
   */
  public hasRecord(token : string) : boolean
  {
    return this.tokenRecords.has(token);
  }

  private tokenRecords : Map<string, TokenRecord>;
}