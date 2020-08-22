import { OperatorRecord, OperatorAssociativity } from "./OperatorRecord";
import { InvalidArgumentException } from "../Utils/LogosUtils";

export class FunctionalSymbolsAndOperatorsTable
{
  constructor()
  {
    this.functionalSymbolsSet = new Set();
    this.operatorsRecordsTable = new Map();
  }

  /**
   * Register a token as a functional symbol, if it is not
   * already registered as an operator.
   * Non-const.
   * 
   * Pre Conditions:
   * - Token must not already be registered as an operator.
   * 
   * Post Conditions:
   * - Registers given token as functional symbol.
   * 
   * @param functionalSymbol 
   */
  public addFunctionalSymbol(functionalSymbol : string) : void
  {
    if(this.operatorsRecordsTable.has(functionalSymbol))
    {
      throw new InvalidArgumentException(`Symbol "${functionalSymbol}" is already registered as an operator!`);
    }

    this.functionalSymbolsSet.add(functionalSymbol);
  }

  /**
   * Unregisters a token as a functional symbol, if it is registered as such.
   * 
   * Pre Conditions:
   * - Token must be registered as a functional symbol.
   * 
   * Post Conditions:
   * - Removes token from functional symbol set.
   * 
   * @param functionalSymbol 
   */
  public removeFunctionalSymbol(functionalSymbol : string) : void
  {
    if(!this.functionalSymbolsSet.has(functionalSymbol))
    {
      throw new InvalidArgumentException(`Symbol "${functionalSymbol}" is not registered as a functional symbol!`);
    }

    this.functionalSymbolsSet.delete(functionalSymbol);
  }

  /**
   * Registers token as operator.
   * Non-const.
   * 
   * Pre Conditions:
   * - Token must not already be registered as a functional symbol.
   * - Token must not already be registered as an operator.
   * - If there are already other tokens registered as operators with the same
   * precedence as the one being registered their associativity must be the same.
   * 
   * @param operatorSymbol 
   * @param arity 
   * @param operatorPosition 
   * @param precedence 
   * @param associativity 
   */
  public addOperatorSymbol(operatorSymbol :  string, arity : number, operatorPosition : number, precedence : number, associativity : OperatorAssociativity) : void
  {
    if(this.functionalSymbolsSet.has(operatorSymbol))
    {
      throw new InvalidArgumentException(`Symbol "${operatorSymbol}" is already registered as a functional symbol!`);
    }

    if(this.operatorsRecordsTable.has(operatorSymbol))
    {
      throw new InvalidArgumentException(`Symbol "${operatorSymbol}" is already registered as an operator!`);
    }
    
    this.checkOperatorAssociativityConflict(operatorSymbol, precedence, associativity);

    this.operatorsRecordsTable.set(operatorSymbol, new OperatorRecord(arity, operatorPosition, precedence, associativity));
  }

  private checkOperatorAssociativityConflict(operatorSymbol : string, precedence : number, associativity : OperatorAssociativity) : void
  {
    const operatorsWithAssociativityConflict = [];
    for(const operator of this.operatorsRecordsTable.keys())
    {
      const operatorRecord = this.operatorsRecordsTable.get(operator);
      if(operatorRecord!.precedence === precedence &&
         operatorRecord!.associativity !== associativity)
      {
        operatorsWithAssociativityConflict.push(operator);
      }
    }

    if(operatorsWithAssociativityConflict.length !== 0)
    {
      throw new InvalidArgumentException(`The operator "${operatorSymbol}" was declared with associativity "${associativity}", but there are already other operators ("${operatorsWithAssociativityConflict.join(", ")}") declared with the same precedence but different associativity!`);
    }
  }

  /**
   * Unregisters token as operator.
   * Non-const.
   * 
   * Pre Conditions:
   * - Token must actually be registered as an operator.
   * 
   * @param operatorSymbol 
   */
  public removeOperatorSymbol(operatorSymbol : string) : void
  {
    if(!this.operatorsRecordsTable.has(operatorSymbol))
    {
      throw new InvalidArgumentException(`Symbol "${operatorSymbol}" is not registered as an operator!`);
    }

    this.operatorsRecordsTable.delete(operatorSymbol);
  }

  /**
   * Returns whether a given token is registered as a functional symbol.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * @param token 
   */
  public tokenIsFunctionalSymbol(token : string) : boolean
  {
    return this.functionalSymbolsSet.has(token);
  }

  /**
   * Returns the [[OperatorRecord]] associated with a given token if is exists
   * and undefined otherwise.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * @param token 
   */
  public getOperatorRecord(token : string) : OperatorRecord | undefined
  {
    return this.operatorsRecordsTable.get(token);
  }

  /**
   * Returns functional symbols set by value.
   * Const.
   * 
   * Pre Conditions:
   * None
   */
  public getFunctionalSymbolsSet() : Set<string>
  {
    const cloneFunctionalSymbolsSet = new Set<string>();
    for(const token of this.functionalSymbolsSet)
    {
      cloneFunctionalSymbolsSet.add(token);
    }
    return cloneFunctionalSymbolsSet;
  }

  /**
   * Returns operators records table by value.
   * Const.
   * 
   * Pre Conditions:
   * None
   */
  public getOperatorsRecordsTable() : Map<string, OperatorRecord>
  {
    const cloneOperatorsRecordsTable = new Map<string, OperatorRecord>();
    for(const token of this.operatorsRecordsTable.keys())
    {
      const currentRecord = this.operatorsRecordsTable.get(token)!.clone();
      cloneOperatorsRecordsTable.set(token, currentRecord);
    }
    return cloneOperatorsRecordsTable;
  }

  private functionalSymbolsSet : Set<string>;
  private operatorsRecordsTable : Map<string, OperatorRecord>;
}