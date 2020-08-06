import { InvalidArgumentException } from "../Utils/LogosUtils";

/**
 * Enum that categorizes type token sorts.
 * 
 *  * 1. LeftRoundBracket -> Used to disambiguate applications of the composition 
 * operator.
 * 2. RightRoundBracket -> Same as above.
 * 3. LeftSquareBracket -> Used to delimit the "beginning" of a product type, 
 * could also be thought of as the first part of the "product" operator.
 * 4. RightSquareBracket -> Used to delimit the "ending" of a product type, 
 * could also be thought of as the second (and last) part of the "product" 
 * operator.
 * 5. Comma -> Used to separate types inside the product operator.
 * 6. CompositionOperator -> Literally the "->" symbol, used as the composition
 * operator.
 * 7. PrimitiveType -> Any sequence of characters that conforms to the 
 * `/^([A-z])+([A-z]|[0-9])*$/` regex, used to represent primitive types, which
 * will be used to make more complex types through the use of the product and
 * composition operators.
 * 8. EndMarker -> A special token ("__END_MARKER__") used to signal to the parser
 *  that a given [[TypeTokenString]] has ended. Internal use only.
 */
export enum TypeTokenSort
{
  LeftRoundBracket = "LeftRoundBracket",
  RightRoundBracket = "RightRoundBracket",
  LeftSquareBracket = "LeftSquareBracket",
  RightSquareBracket = "RightSquareBracket",
  Comma = "Comma",
  CompositionOperator = "CompositionOperator",
  PrimitiveType = "PrimitiveType"
}

/**
 * This class represents a Type Token, that is used to make types.
 * 
 * [[Type]]s are composed of a [[TypeTokenString]] (which has been validated, 
 * that is, proven to be syntactically correct), which in turn is composed of a 
 * sequence of individual [[TypeToken]]s.
 * 
 * As it is much better to divide the whole parsing process into two parts, 
 * namely, lexing and then parsing per se, before parsing a raw string that 
 * might possibly correspond to a well formed type, it needs to be tokenized,
 * that is, broken up into tokens where each token might correspond to more than
 * one character.
 * 
 * [[TypeToken]]s are divided into sorts ([[TypeTokenSort]]):
 * 
 * [[TypeToken]] is immutable, that is, it cannot be changed, therefore anytime
 * you need to change a type token into another type token you need to generate 
 * a new type token and then substitute the old reference for the new one.
 * 
 * Class Invariants:
 * - A [[TypeToken]] always has a valid internal string and corresponding sort.
 * - A [[TypeToken]] once it is created will retain its internal string and
 * sort throughout its life.
 */
export class TypeToken
{
  /**
   * Checks whether the given string is suited to represent a primitive type.
   * Primitive types' strings must conform to the `/^([A-z])+([A-z]|[0-9])*$/` 
   * regex.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns a boolean representing whether the given string is a primitive
   * type suitable token.
   * 
   * @param string
   */
  private static isPrimitiveType(string : string) : boolean
  {
    return /^([A-z])+([A-z]|[0-9])*$/.test(string);
  }
  /**
   * Analyzes a given string and returns its associated [[TypeTokenSort]] if 
   * possible, otherwise throws an [[InvalidArgumentException]].
   * 
   * Pre Conditions:
   * - `string` must represent a valid type.
   * 
   * Post Conditions:
   * - Returns `string` corresponding [[TypeTokenSort]].
   * 
   * @param string 
   */
  private static sort(string : string) : TypeTokenSort
  {
    if(string === "(")
    {
      return TypeTokenSort.LeftRoundBracket;
    }
    else if(string === ")")
    {
      return TypeTokenSort.RightRoundBracket;
    }
    else if(string === "[")
    {
      return TypeTokenSort.LeftSquareBracket;
    }
    else if(string === "]")
    {
      return TypeTokenSort.RightSquareBracket;
    }
    else if(string === ",")
    {
      return TypeTokenSort.Comma;
    }
    else if(string === "->")
    {
      return TypeTokenSort.CompositionOperator;
    }
    else if(TypeToken.isPrimitiveType(string))
    {
      return TypeTokenSort.PrimitiveType;
    }
    else
    {
      throw new InvalidArgumentException(`"${string}" is not a suitable TypeToken!`);
    }
  }

  /**
   * Constructs a [[TypeToken]].
   * 
   * Pre Conditions:
   * - The string that represents the token must conform to one of the possible
   * sorts. (See [[TypeTokenSort]])
   * 
   * Post Conditions:
   * - Sets the token's internal string to the received string and
   * sets the token's sort to the string's corresponding sort.
   * 
   * @param string String representing the token. 
   */
  constructor(string : string)
  {
    this.sort = TypeToken.sort(string); //Also performs validation
    this.string = string;
  }

  /**
   * Returns the token's string by value.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns the token's internal string.
   */
  public toString() : string
  {
    return this.string;
  }
  /**
   * Returns the token's sort by value.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns the token's sort.
   */
  public getSort() : TypeTokenSort
  {
    return this.sort;
  }
  /**
   * Performs deep equality between tokens.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns whether `other` shares the same string
   * and class of this.
   * 
   * @param other TypeToken to be compared to.
   */
  public isEqual(other : TypeToken) : boolean
  {
    return this.toString() === other.toString() &&
           other instanceof TypeToken;
  }
  /**
   * TypeToken string representation.
   */
  private readonly string : string;
  /**
   * TypeToken sort.
   */
  private readonly sort : TypeTokenSort;
}
