import { TypeParseTree } from "./TypeParseTree";
import { TypeParser } from "./TypeParser";
import { TypeParsingTreeNodeMainOperator as TypeParseTreeNodeMainOperator } from "./TypeParseTreeNode";
import { InvalidArgumentException, LogicErrorException } from "../Utils/LogosUtils";

/**
 * Represents a well formed Type.
 * 
 * Types are immutable objects, so any action that would modify a type creates
 * a new type instead with the desired mutations.
 * 
 * Class Invariants:
 * - A [[Type]] is immutable, so it will remain the same throughout its entire life.
 */
export class Type
{
  /**
   * Constructs a [[Type]] from a given string representing that type.
   * 
   * Pre Conditions:
   * - `string` must represent a well formed type.
   * 
   * Post Conditions:
   * - Sets internal parse tree by parsing `string`.
   * 
   * @param string 
   */
  constructor(string : string)
  {
    this.parseTree = TypeParser.parse(string);
  }
  /**
   * Returns type string representation.
   * Const.
   * 
   * Pre Conditions:
   * None.
   * 
   * Post Conditions:
   * - Returns type string representation.
   * 
   */
  public toString() : string
  {
    return this.parseTree.getTypeString().toString();
  }
  /**
   * Returns whether the type is a primitive type.
   * Const.
   * 
   * Pre Conditions:
   * None.
   * 
   * Post Conditions:
   * - Returns whether this is a primitive type.
   */
  public isPrimitive() : boolean
  {
    return this.parseTree.getRoot().getMainOperator() === TypeParseTreeNodeMainOperator.Primitive;
  }
  /**
   * If this is a composite type, returns the return type.
   * Const.
   * 
   * Pre Conditions:
   * - Type must be a composite type.
   * 
   * Post Conditions:
   * - Returns return type.
   */
  public getReturnType() : Type
  {
    if(this.isPrimitive())
    {
      throw new InvalidArgumentException("Primitive types have no return type!");
    }

    const rootNode = this.parseTree.getRoot();
    const returnTypeNodeIndex = 1;
    const returnTypeNode = rootNode.getNthChild(returnTypeNodeIndex);
    const returnTypeString = returnTypeNode.getTypeString().toString();
    return new Type(returnTypeString);
  }
  /**
   * Returns this type argument types, if this is a composite type.
   * 
   * Pre Conditions:
   * - This type must be a composite type.
   * 
   * Post Conditions:
   * - Returns array of this type argument types.
   */
  public getArgumentTypes() : Array<Type>
  {
    if(this.isPrimitive())
    {
      throw new InvalidArgumentException("Primitive types take no arguments!");
    }

    const rootNode = this.parseTree.getRoot();
    const argumentsTypesNodeIndex = 0;
    const argumentsTypesNode = rootNode.getNthChild(argumentsTypesNodeIndex);
    const argumentsTypeNodeMainOperator = argumentsTypesNode.getMainOperator();
    if(argumentsTypeNodeMainOperator === TypeParseTreeNodeMainOperator.Primitive ||
      argumentsTypeNodeMainOperator === TypeParseTreeNodeMainOperator.Composition)
    {
      const argumentTypeString = argumentsTypesNode.getTypeString().toString();
      return [new Type(argumentTypeString)];
    }
    else if(argumentsTypeNodeMainOperator === TypeParseTreeNodeMainOperator.Product)
    {
      const argumentTypeStringArray = argumentsTypesNode.getChildren()
        .map(child => child.getTypeString().toString());
      return argumentTypeStringArray.map(string => new Type(string));
    }
    else
    {
      throw new LogicErrorException(`"${argumentsTypesNode.getMainOperator()}" is not a valid TypeParseTreeNodeMainOperator!`);
    }
  }
  /**
   * Deep comparison.
   * Const.
   * 
   * Pre Conditions:
   * None.
   * 
   * Post Conditions:
   * - Returns whether this type and another type are equal.
   * 
   * @param other 
   */
  public isEqual(other : Type) : boolean
  {
    return this.toString() === other.toString();
  }
  /**
   * Tries to apply an array of argument types to this type and if they conform,
   * returns this type return type.
   * 
   * Pre Conditions:
   * - This type must be a composite type.
   * - Argument types must conform to the types this type takes as arguments.
   * 
   * Post Conditions:
   * - Returns this type return type.
   * 
   * @param argumentTypes 
   */
  public apply(...argumentsTypes : Array<Type>) : Type
  {
    const thisArgumentsTypes = this.getArgumentTypes();
    if(!argumentsTypes.every((argumentType, index) => argumentType.isEqual(thisArgumentsTypes[index])))
    {
      throw new InvalidArgumentException(`This type expected [${thisArgumentsTypes.map(type => type.toString()).join(", ")}] as arguments but received [${argumentsTypes.map(type => type.toString()).join(", ")}] instead!`);
    }

    return this.getReturnType();
  }
  /**
   * Returns [[TypeParseTree]] by value.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns this type [[TypeParseTree]] by value.
   */
  public getParseTree() : TypeParseTree
  {
    return this.parseTree.clone();
  }

  private readonly parseTree : TypeParseTree;
}