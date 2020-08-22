import { LogicErrorException, Utils } from "../Utils/LogosUtils";

interface StringClass
{
  length ?: number;
  size?() : number;
  toString() : string;
  slice(beginOffset ?: number, endOffset ?: number) : StringClass;
}

/**
 * Exception used to singal and describe an error that
 * occurred during parser, due to failing to parse a
 * malformed sentence.
 *
 * The core functionality of this exception is that
 * it gathers information about string character indexes
 * where the error was found.
 *
 * It carries a message that is suited for the CLI.
 */
export class ParsingException extends Error 
{
  /**
   * Enforces class invariants, making sure
   * that indexes are within bounds regarding
   * token string and that they don't "cross".
   * 
   * @param errorBeginOffset 
   * @param errorEndOffset 
   * @param tokenString 
   */
  private static validateParameters(errorBeginOffset : number,
                                    errorEndOffset : number,
                                    tokenString : StringClass) : void
  {
    Utils.validateIndex(errorBeginOffset, "errorBeginOffset");
    Utils.validateIndex(errorEndOffset, "errorEndOffset");

    const tokenStringLength = tokenString.length !== undefined ? tokenString.length : tokenString.size !== undefined ? tokenString.size() : -1;
    if(tokenStringLength === -1)
    {
      throw new LogicErrorException("The string class doesn't have either a .length or a .size defined.");
    }

    if(errorEndOffset >= tokenStringLength)
    {
      throw new LogicErrorException(`errorEndOffset is expected to be < tokenString length (${tokenStringLength}), but ${errorEndOffset} was passed instead.`);
    }

    if(errorBeginOffset > errorEndOffset)
    {
      throw new LogicErrorException(`errorBeginOffset is expected to be <= errorEndOffset but ${errorBeginOffset} and ${errorEndOffset} were passed instead.`);
    }
  }
  /**
   * Renders a highlight using "^" to indicate
   * where the problems are in the string.
   *
   * @param stringSize
   * @param errorBeginOffset
   * @param errorEndOffset
   */
  private static renderHighlight(string : StringClass, errorBeginOffset : number, errorEndOffset : number) : string 
  {
    const inclusiveEndIndexCompensation = 1;
    const beforeErrorSectionSubstring = string.slice(0, errorBeginOffset);
    const errorSectionSubstring = string.slice(errorBeginOffset, errorEndOffset + inclusiveEndIndexCompensation);
    const afterErrorSectionSubstring = string.slice(errorEndOffset);
    const startPad = " ".repeat(beforeErrorSectionSubstring.toString().length);
    const highlight = "^".repeat(errorSectionSubstring.toString().length);
    const endPad = " ".repeat(afterErrorSectionSubstring.toString().length);
    return `${startPad}${highlight}${endPad}`;
  }
  /**
   * Sets Error's message as the CLI-compatible error
   * message, including the explanation, the token string and
   * the highlight.
   *
   * @param explanation
   * @param errorBeginOffset
   * @param errorEndOffset
   * @param tokenString
   */
  constructor(explanation : string, errorBeginOffset : number, errorEndOffset : number, tokenString : StringClass) 
  {
    ParsingException.validateParameters(errorBeginOffset, errorEndOffset, tokenString);

    const highlight = ParsingException.renderHighlight(tokenString, errorBeginOffset, errorEndOffset);

    super(`${explanation}\n${tokenString.toString()}\n${highlight}`);
    
    this.explanation = explanation;
    this.errorBeginOffset = errorBeginOffset;
    this.errorEndOffset = errorEndOffset;
    this.tokenString = tokenString;
  }
  /**
   * Gets the explanation.
   */
  public getExplanation() : string 
  {
    return this.explanation;
  }
  /**
   * Gets the error begin index.
   */
  public getErrorBeginOffset() : number 
  {
    return this.errorBeginOffset;
  }
  /**
   * Gets the error end index.
   */
  public getErrorEndOffset() : number 
  {
    return this.errorEndOffset;
  }
  /**
   * Gets the error associated token string.
   */
  public getTokenString() : StringClass 
  {
    return this.tokenString;
  }
  /**
   * Gets complete error message.
   */
  public getErrorMessage() : string
  {
    return this.message;
  }
  /**
   * An explanation of the problem found in the token string.
   */
  private readonly explanation : string;
  /**
   * The token string's index where the problem found begins.
   */
  private readonly errorBeginOffset : number;
  /**
   * The token string's index where the problem found ends.
   */
  private readonly errorEndOffset : number;
  /**
   * the token string in analysis.
   */
  private readonly tokenString : StringClass;
}
