import { TokenString } from "../Token/TokenString";
import { Signature } from "./Signature";

export interface Lexer
{
  lex(string : string, signature ?: Signature) : TokenString;
}