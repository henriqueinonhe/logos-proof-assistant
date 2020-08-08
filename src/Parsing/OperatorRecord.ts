import { InvalidArgumentException } from "../Utils/LogosUtils";

export enum OperatorAssociativity
{
  Left = "Left",
  Right = "Right"
}

/**
 * Represents an operator record, that is, it holds
 * the precedence and associativity of an operator.
 */
export class OperatorRecord
{
  /**
   * Constructs an [[OperatorRecord]].
   * 
   * Pre Conditions:
   * - Arity must be a non null positive integer.
   * - Operator position must be a positive integer.
   * - Precedence must be a positive integer.
   * - Operator position must be less or equal than arity.
   * 
   * @param arity
   * @param operatorPosition
   * @param precedence 
   * @param associativity 
   */
  constructor(arity : number, operatorPosition : number, precedence : number, associativity : OperatorAssociativity)
  {
    if(!Number.isInteger(arity) || arity <=0)
    {
      throw new InvalidArgumentException(`Arity (${arity}) must be an integer >= 0!`);
    }

    if(!Number.isInteger(operatorPosition) || operatorPosition < 0)
    {
      throw new InvalidArgumentException(`Operator position (${operatorPosition}) must be a positive integer!`);
    }

    if(operatorPosition > arity)
    {
      throw new InvalidArgumentException(`Operator position (${operatorPosition}) cannot be greater than arity (${arity})!`);
    }

    if(!Number.isInteger(precedence) || precedence < 0)
    {
      throw new InvalidArgumentException(`Precedence (${precedence}) must be a positive integer!`);
    }

    this.arity = arity;
    this.operatorPosition = operatorPosition;
    this.precedence = precedence;
    this.associativity = associativity;
  }

  public arity : number;
  public operatorPosition : number;
  public precedence : number;
  public associativity : OperatorAssociativity;
}