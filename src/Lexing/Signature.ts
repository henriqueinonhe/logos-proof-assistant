import { TokenRecord } from "./TokenRecord";

/**
 * Represents a signature.
 */
export interface Signature
{
  getRecord(token : string) : TokenRecord;
  hasRecord(token : string) : boolean;
}