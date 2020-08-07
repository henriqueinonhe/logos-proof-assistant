import { OperatorRecord, OperatorAssociativity } from "./OperatorRecord";
import { InvalidArgumentException } from "../Utils/LogosUtils";

export class FunctionalSymbolsAndOperatorsTable
{
  constructor()
  {
    this.functionalSymbolsSet = new Set();
    this.operatorsRecordsTable = new Map();
  }

  public addFunctionalSymbol(functionalSymbol : string) : void
  {
    if(this.operatorsRecordsTable.has(functionalSymbol))
    {
      throw new InvalidArgumentException(`Symbol "${functionalSymbol}" is already registered as an operator!`);
    }

    this.functionalSymbolsSet.add(functionalSymbol);
  }

  public removeFunctionalSymbol(functionalSymbol : string) : void
  {
    if(!this.functionalSymbolsSet.has(functionalSymbol))
    {
      throw new InvalidArgumentException(`Symbol "${functionalSymbol}" is not registered as functional symbol!`);
    }

    this.functionalSymbolsSet.delete(functionalSymbol);
  }

  public addOperatorSymbol(operatorSymbol :  string, operatorPosition : number, precedence : number, associativity : OperatorAssociativity) : void
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

    this.operatorsRecordsTable.set(operatorSymbol, new OperatorRecord(precedence, associativity));
  }

  private checkOperatorAssociativityConflict(operatorSymbol : string, precedence : number, associativity : OperatorAssociativity) : void
  {
    const operatorsWithAssociativityConflict = [];
    for(const operator in this.operatorsRecordsTable)
    {
      const operatorRecord = this.operatorsRecordsTable.get(operator);
      if(operatorRecord?.precedence === precedence &&
         operatorRecord.associativity !== associativity)
      {
        operatorsWithAssociativityConflict.push(operator);
      }
    }

    if(operatorsWithAssociativityConflict.length !== 0)
    {
      throw new InvalidArgumentException(`The operator "${operatorSymbol}" was declared with associativity "${associativity}", but there are already other operators ("${operatorsWithAssociativityConflict.join(", ")}") declared with the same precedence but different associativity!`);
    }
  }

  public removeOperatorSymbol(operatorSymbol : string) : void
  {
    if(!this.operatorsRecordsTable.has(operatorSymbol))
    {
      throw new InvalidArgumentException(`Symbol "${operatorSymbol}" is not registered as an operator!`);
    }

    this.operatorsRecordsTable.delete(operatorSymbol);
  }

  private functionalSymbolsSet : Set<string>;
  private operatorsRecordsTable : Map<string, OperatorRecord>;
}