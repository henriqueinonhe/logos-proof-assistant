/**
 * Represents a generic token record.
 * 
 * Token records are used to associate external information with tokens, like
 * types, variable binding information and the likes.
 * 
 */
export interface TokenRecord
{
  sort() : string;
}