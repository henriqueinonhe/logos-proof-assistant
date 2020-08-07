import { Lexer } from "../Lexing/Lexer";
import { Signature } from "../Lexing/Signature";

export class Parser
{
  constructor(lexer : Lexer, signature : Signature)
  {
    this.lexer = lexer;
    this.signature = signature;
  }

  private lexer : Lexer;
  private signature : Signature;
}