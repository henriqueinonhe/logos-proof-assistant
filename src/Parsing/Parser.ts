import { Lexer } from "../Lexing/Lexer";
import { Signature } from "../Lexing/Signature";
import { FunctionalSymbolsAndOperatorsTable } from "./FunctionalSymbolsAndOperatorsTable";
import { LinkedList, LinkedListIterator } from "../Utils/LinkedList";
import { TokenString } from "../Token/TokenString";
import { InvalidArgumentException } from "../Utils/LogosUtils";
import { ParseTreeNode as ParseTreeNode } from "./ParseTreeNode";
import { OperatorAssociativity } from "./OperatorRecord";
import fs from "fs";
import { ParseTree } from "./ParseTree";
import { TypeParseTreeIterator } from "../Type/TypeParseTreeIterator";

export class Parser
{
  public static parse(string : string, lexer : Lexer, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : void //NOTE Stub for now
  {
    //1. Lex
    const tokenString = lexer.lex(string, signature);

    //2. Wrap Token String and perform Bracket Matching
    const nodeList = Parser.convertTokenStringToNodeListAndHandleBrackets(tokenString);
    
    //3. Iterators to Tokens For Further Processing
    const operatorsIteratorQueue = Parser.generateOperatorsIteratorQueue(nodeList, symbolTable);

    //4. Reduce Function Applications
    const reducedFunctionApplicationsAndBracketedExpressionsNodeList = Parser.reduceFunctionApplicationsAndBracketedExpressions(nodeList, signature, symbolTable, tokenString);
    fs.writeFileSync("temp.json", JSON.stringify(reducedFunctionApplicationsAndBracketedExpressionsNodeList.toArray().map(element => element["reducedNodeObject"]()), null, 2));

    //6. Reduce Operator Applications
  }

  /**
   * @param tokenString 
   */
  private static convertTokenStringToNodeListAndHandleBrackets(tokenString : TokenString) : LinkedList<ParseTreeNode>
  {
    //Wrap Tokens
    const tokenNodeList = new LinkedList<ParseTreeNode>();
    const leftBracketIteratorStack = [];
    const unmatchedRightBracketList = [];
    for(let offset = 0; offset < tokenString.size(); offset++)
    {
      const currentToken = tokenString.tokenAt(offset);
      if(currentToken.toString() === "(")
      {
        const leftBracketNode = new ParseTreeNode(tokenString, offset, offset);
        tokenNodeList.push(leftBracketNode);

        const leftBracketNodeIterator = tokenNodeList.iteratorAtLast();
        leftBracketIteratorStack.push(leftBracketNodeIterator);
      }
      else if(currentToken.toString() === ")")
      {
        const rightBracketNode = new ParseTreeNode(tokenString, offset, offset);
        tokenNodeList.push(rightBracketNode);
        
        if(leftBracketIteratorStack.length === 0)
        {
          unmatchedRightBracketList.push(rightBracketNode);
        }
        else
        {
          leftBracketIteratorStack.pop();
        }
      }
      else
      {
        const tokenNode = new ParseTreeNode(tokenString, offset, offset);
        tokenNodeList.push(tokenNode);
      }
    }

    const unmatchedLeftBracketList = leftBracketIteratorStack.map(iterator => iterator.get());
    if(unmatchedLeftBracketList.length !== 0 ||
       unmatchedRightBracketList.length !== 0)
    {
      //TODO implement correct exception
      throw new InvalidArgumentException(`Brackets at the following indexes are unmatched: ${[...unmatchedLeftBracketList, ...unmatchedRightBracketList].map(bracket => bracket.substringBeginOffset).join(", ")}`);
    }

    return tokenNodeList;
  }

  private static reduceSingleBracketedExpression(iteratorAtOpeningLeftBracket : LinkedListIterator<ParseTreeNode>, inputNodeList : LinkedList<ParseTreeNode>, outputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : LinkedListIterator<ParseTreeNode>
  {
    const topLevelBracketedExpressionReducedNode = new ParseTreeNode(inputTokenString);
    const openingLeftBracketOffset = iteratorAtOpeningLeftBracket.get().substringBeginOffset;
    const listWrappedBracketedExpression = new LinkedList<ParseTreeNode>();
    topLevelBracketedExpressionReducedNode.substringBeginOffset = openingLeftBracketOffset;
    topLevelBracketedExpressionReducedNode.children.push(listWrappedBracketedExpression);

    //Remove Opening Left Bracket
    let iteratorAtCurrentNode = inputNodeList.remove(iteratorAtOpeningLeftBracket);

    while(!Parser.bracketedExpressionHasEnded(iteratorAtCurrentNode))
    {
      iteratorAtCurrentNode = Parser.ignoreWhitespace(inputNodeList, iteratorAtCurrentNode, signature);

      if(Parser.iteratorIsAtFunctionApplicationStartingPoint(iteratorAtCurrentNode, symbolTable))
      {
        const iteratorAtFunctionalSymbol = iteratorAtCurrentNode;
        const iteratorAtAfterFunctionApplication = Parser.reduceSingleFunctionApplication(iteratorAtFunctionalSymbol, inputNodeList, listWrappedBracketedExpression, signature, symbolTable, inputTokenString);
        iteratorAtCurrentNode = iteratorAtAfterFunctionApplication;
      }
      else if(Parser.iteratorIsAtBracketedExpressionStartingPoint(iteratorAtCurrentNode))
      {
        const iteratorAtOpeningLeftBracket = iteratorAtCurrentNode;
        const iteratorAtAfterBracketedExpression = Parser.reduceSingleBracketedExpression(iteratorAtOpeningLeftBracket, inputNodeList, listWrappedBracketedExpression, signature, symbolTable, inputTokenString);
        iteratorAtCurrentNode = iteratorAtAfterBracketedExpression;
      }
      else
      {
        iteratorAtCurrentNode = inputNodeList.transferNodeToEnd(iteratorAtCurrentNode, listWrappedBracketedExpression);
      }
    }

    //Set End Offset
    const iteratorAtClosingRightBracket = iteratorAtCurrentNode;
    topLevelBracketedExpressionReducedNode.substringEndOffset = iteratorAtClosingRightBracket.get().substringEndOffset;

    //Pushing Reduced Node To Output Node List
    outputNodeList.push(topLevelBracketedExpressionReducedNode);

    //Remove Closing Right Bracket
    const iteratorAtAfterBracketedExpression = inputNodeList.remove(iteratorAtClosingRightBracket);

    return iteratorAtAfterBracketedExpression;
  }

  /**
   * 
   * Iterates through the string (`tokenNodeList`) searching for function
   * applications.
   * 
   * Whenever a function application is found, it reduces it, that is,
   * it parses the function application (and nested applications as well)
   * removing all the nodes that comprises the function application (from the
   * functional symbol to the last ")" of the last argument list) and substitutes
   * it by a single node.
   * 
   * @param inputNodeList (out)
   * @param signature 
   * @param symbolTable 
   */
  private static reduceFunctionApplicationsAndBracketedExpressions(inputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : LinkedList<ParseTreeNode>
  {
    const outputNodeList = new LinkedList<ParseTreeNode>();
    let iteratorAtCurrentNode = inputNodeList.iteratorAtHead();
    let inputNodeListEndHasBeenReached = !iteratorAtCurrentNode.isValid();

    //Ignore Leading Whitespace
    iteratorAtCurrentNode = Parser.ignoreWhitespace(inputNodeList, iteratorAtCurrentNode, signature);
    while(!inputNodeListEndHasBeenReached)
    {
      if(Parser.iteratorIsAtFunctionApplicationStartingPoint(iteratorAtCurrentNode, symbolTable))
      {
        const iteratorAtFunctionalSymbol = iteratorAtCurrentNode;
        const iteratorAtAfterFunctionApplication = Parser.reduceSingleFunctionApplication(iteratorAtFunctionalSymbol, inputNodeList, outputNodeList, signature, symbolTable, inputTokenString);
        iteratorAtCurrentNode = iteratorAtAfterFunctionApplication;
      }
      else if(Parser.iteratorIsAtBracketedExpressionStartingPoint(iteratorAtCurrentNode))
      {
        const iteratorAtLeftOpeningBracket = iteratorAtCurrentNode;
        const iteratorAtAfterBracketedExpression = Parser.reduceSingleBracketedExpression(iteratorAtLeftOpeningBracket, inputNodeList, outputNodeList, signature, symbolTable, inputTokenString);
        iteratorAtCurrentNode = iteratorAtAfterBracketedExpression;
      }
      else
      {
        iteratorAtCurrentNode = inputNodeList.transferNodeToEnd(iteratorAtCurrentNode, outputNodeList);
      }
      
      iteratorAtCurrentNode = Parser.ignoreWhitespace(inputNodeList, iteratorAtCurrentNode, signature);
      inputNodeListEndHasBeenReached = !iteratorAtCurrentNode.isValid();
    }

    return outputNodeList;
  }

  /**
   * Checks whether iterator points to a function application starting point,
   * that is, whether iterator points to a functional symbol and the token
   * *right after* (no whitespace allowed) is a left bracket.
   * 
   * Pre Conditions:
   * None
   * 
   * @param iterator 
   * @param symbolTable 
   */
  private static iteratorIsAtFunctionApplicationStartingPoint(iterator : LinkedListIterator<ParseTreeNode>, symbolTable : FunctionalSymbolsAndOperatorsTable) : boolean
  {
    const currentNode = iterator.get();
    const currentToken = currentNode.getCorrespondingInputSubstring().toString();
    if(!symbolTable.tokenIsFunctionalSymbol(currentToken))
    {
      return false;
    }

    const iteratorAtFunctionalSymbol = iterator;
    if(iteratorAtFunctionalSymbol.isAtLast())
    {
      return false;
    }

    const nextToken = iteratorAtFunctionalSymbol.clone().goToNext().get(); //To avoid modifying original iterator
    return nextToken.getCorrespondingInputSubstring().toString() === "(";
  }

  /**
   * Parses a function application reducing it to a single node.
   * 
   * @param iteratorAtFunctionalSymbol 
   * @param signature 
   * @param symbolTable 
   * @param inputTokenString 
   */
  private static reduceSingleFunctionApplication(iteratorAtFunctionalSymbol : LinkedListIterator<ParseTreeNode>, inputNodeList : LinkedList<ParseTreeNode>, outputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : LinkedListIterator<ParseTreeNode>
  {
    //This is the node that will be puhsed into outputNodeList
    let topLevelFunctionApplicationReducedNode = new ParseTreeNode(inputTokenString);

    /* Populate topLevelFunctionalApplicationReducedNode children */
    //Transfer Functional Symbol Node And Push List To Reduced Node
    const listWrappedFunctionalSymbolNode = new LinkedList<ParseTreeNode>();
    const iteratorAtFirstArgumentListOpeningBracket = inputNodeList.transferNodeToEnd(iteratorAtFunctionalSymbol, listWrappedFunctionalSymbolNode);
    topLevelFunctionApplicationReducedNode.children.push(listWrappedFunctionalSymbolNode);
    
    let iteratorAtCurrentArgumentListOpeningBracket = iteratorAtFirstArgumentListOpeningBracket;
    let iteratorAtCurrentArgumentListClosingBracket;
    let isFirstArgumentList = true;
    //First Argument List Is Presence Mandatory
    do
    {
      const parseFunctionArgumentListReturnValues = Parser.parseFunctionArgumentList(iteratorAtCurrentArgumentListOpeningBracket, inputNodeList, signature, symbolTable, inputTokenString);

      [iteratorAtCurrentArgumentListClosingBracket] = parseFunctionArgumentListReturnValues;
      const [, argumentNodeListArray] = parseFunctionArgumentListReturnValues;

      if(isFirstArgumentList)
      {
        isFirstArgumentList = false;
      }
      else
      {
        //Rearrange Tree
        const formerTopLevelFunctionApplicationReducedNode = topLevelFunctionApplicationReducedNode;
        const listWrappedFormerTopLevelFunctionApplicationReducedNode = new LinkedList<ParseTreeNode>(formerTopLevelFunctionApplicationReducedNode);

        topLevelFunctionApplicationReducedNode = new ParseTreeNode(inputTokenString);
        topLevelFunctionApplicationReducedNode.children.push(listWrappedFormerTopLevelFunctionApplicationReducedNode);
      }
      
      //Append Arguments
      for(const argumentNodeList of argumentNodeListArray)
      {
        topLevelFunctionApplicationReducedNode.children.push(argumentNodeList);
      }

      //Set Offsets
      const topLevelFunctionApplicationReducedNodeFunction = topLevelFunctionApplicationReducedNode.children[0].atHead();

      topLevelFunctionApplicationReducedNode.substringBeginOffset = topLevelFunctionApplicationReducedNodeFunction.substringBeginOffset;
      topLevelFunctionApplicationReducedNode.substringEndOffset = iteratorAtCurrentArgumentListClosingBracket.get().substringEndOffset;

      //Remove Closing Bracket
      iteratorAtCurrentArgumentListOpeningBracket = inputNodeList.remove(iteratorAtCurrentArgumentListClosingBracket);

    } while(Parser.hasNextArgumentList(iteratorAtCurrentArgumentListClosingBracket));
    
    //Push Top Level Reduced Node To Output Node List
    outputNodeList.push(topLevelFunctionApplicationReducedNode); //Isso aqui vai dar bode

    const iteratorAtAfterFunctionApplication = iteratorAtCurrentArgumentListOpeningBracket;

    return iteratorAtAfterFunctionApplication;
  }

  private static parseFunctionArgumentList(iteratorAtOpeningLeftBracket : LinkedListIterator<ParseTreeNode>, inputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : [LinkedListIterator<ParseTreeNode>, Array<LinkedList<ParseTreeNode>>]
  {
    const argumentNodeListArray = [];
    let iteratorAtCurrentArgumentFirstNode;
    let iteratorAtCurrentArgumentSeparator = iteratorAtOpeningLeftBracket;

    do
    {
      //Remove Separator ("(" or ",")
      iteratorAtCurrentArgumentFirstNode = inputNodeList.remove(iteratorAtCurrentArgumentSeparator);

      const parseFunctionArgumentReturnValue = Parser.parseFunctionArgument(iteratorAtCurrentArgumentFirstNode, inputNodeList, signature, symbolTable, inputTokenString);
      [iteratorAtCurrentArgumentSeparator] = parseFunctionArgumentReturnValue;
      const [, currentArgumentNodeList] = parseFunctionArgumentReturnValue;

      argumentNodeListArray.push(currentArgumentNodeList);

    } while(Parser.hasNextArgument(iteratorAtCurrentArgumentSeparator));

    const iteratorAtArgumentListClosingBracket = iteratorAtCurrentArgumentSeparator.clone();
    return [iteratorAtArgumentListClosingBracket, argumentNodeListArray];
  }

  private static parseFunctionArgument(iteratorAtArgumentFirstNode : LinkedListIterator<ParseTreeNode>, inputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : [LinkedListIterator<ParseTreeNode>, LinkedList<ParseTreeNode>]
  {
    const argumentNodeList = new LinkedList<ParseTreeNode>();
    let iteratorAtCurrentNode = iteratorAtArgumentFirstNode.clone();

    //Remove Leading Whitespace
    iteratorAtCurrentNode = Parser.ignoreWhitespace(inputNodeList, iteratorAtCurrentNode, signature);

    //First Significant Token Is Mandatory
    do
    {
      Parser.checkExpectedToken(iteratorAtCurrentNode, signature, ["TypedToken", "VariableToken", "VariableBindingToken", "LeftRoundBracketToken"]);

      if(Parser.iteratorIsAtFunctionApplicationStartingPoint(iteratorAtCurrentNode, symbolTable))
      {
        const iteratorAtAfterFunctionApplication = Parser.reduceSingleFunctionApplication(iteratorAtCurrentNode, inputNodeList, argumentNodeList, signature, symbolTable, inputTokenString);
        iteratorAtCurrentNode = iteratorAtAfterFunctionApplication;
      }
      else if(Parser.iteratorIsAtBracketedExpressionStartingPoint(iteratorAtCurrentNode))
      {
        const iteratorAtOpeningLeftBracket = iteratorAtCurrentNode;
        const iteratorAtAfterBracketedExpression = Parser.reduceSingleBracketedExpression(iteratorAtOpeningLeftBracket, inputNodeList, argumentNodeList, signature, symbolTable, inputTokenString);
        iteratorAtCurrentNode = iteratorAtAfterBracketedExpression;
      }
      else
      {
        iteratorAtCurrentNode = inputNodeList.transferNodeToEnd(iteratorAtCurrentNode, argumentNodeList);
      }

      iteratorAtCurrentNode = Parser.ignoreWhitespace(inputNodeList, iteratorAtCurrentNode, signature);

    } while(!Parser.functionArgumentHasFinished(iteratorAtCurrentNode));

    const iteratorAtArgumentSeparator = iteratorAtCurrentNode;
    return [iteratorAtArgumentSeparator, argumentNodeList];
  }

  private static removeArgumentNodeListTrailingWhitespace(argumentNodeList : LinkedList<ParseTreeNode>) : void
  {
    while(argumentNodeList.atLast().getCorrespondingInputSubstring().toString() === " ")
    {
      argumentNodeList.pop();
    }
  }

  private static functionArgumentHasFinished(iterator : LinkedListIterator<ParseTreeNode>) : boolean
  {
    const currentToken = iterator.get().getCorrespondingInputSubstring().toString();
    return currentToken === "," ||
           currentToken === ")";
  }

  private static hasNextArgument(iteratorAtArgumentSeparator : LinkedListIterator<ParseTreeNode>) : boolean
  {
    const iteratorAtPossibleComma = iteratorAtArgumentSeparator.clone();
    return iteratorAtPossibleComma.isValid() && iteratorAtPossibleComma.get().getCorrespondingInputSubstring().toString() === ",";
  }

  private static hasNextArgumentList(iteratorAtPreviousArgumentListEnd : LinkedListIterator<ParseTreeNode>) : boolean
  {
    const iteratorAtPossibleArgumentListBegin = iteratorAtPreviousArgumentListEnd.clone().goToNext();
    return iteratorAtPossibleArgumentListBegin.isValid() && iteratorAtPossibleArgumentListBegin.get().getCorrespondingInputSubstring().toString() === "(";
  }

  private static ignoreWhitespace(inputNodeList : LinkedList<ParseTreeNode>, iterator : LinkedListIterator<ParseTreeNode>, signature : Signature) : LinkedListIterator<ParseTreeNode>
  {
    while(iterator.isValid())
    {
      const currentToken = iterator.get().getCorrespondingInputSubstring().toString();
      const currentTokenSort = signature.getRecord(currentToken).sort();
      if(currentTokenSort === "WhitespaceToken")
      {
        iterator = inputNodeList.remove(iterator);
      }
      else
      {
        break;
      }
    }

    return iterator;
  }

  private static checkExpectedToken(iteratorAtActualToken : LinkedListIterator<ParseTreeNode>, signature : Signature, expectedTokenSortList : Array<string>) : void
  {
    const expectedTokenSortSet = new Set(expectedTokenSortList);
    const errorSubMessage = this.craftExpectedTokenErrorSubMessage(expectedTokenSortList);
    if(!iteratorAtActualToken.isValid())
    {
      throw new InvalidArgumentException("Premature end of string!");
      //TODO Handle error with specialized exception indicating where the error has occurred!
    }

    const actualToken = iteratorAtActualToken.get().getCorrespondingInputSubstring().toString();
    const actualTokenSort = signature.getRecord(actualToken.toString()).sort();
    if(!expectedTokenSortSet.has(actualTokenSort))
    {
      throw new InvalidArgumentException("Yada yada");
      //TODO
    }
  }

  private static craftExpectedTokenErrorSubMessage(expectedTokenSortList : Array<string>) : string
  {
    if(expectedTokenSortList.length === 1)
    {
      return `where a ${expectedTokenSortList[0]} was expected!`;
    }
    else
    {
      let string = "where a ";
      for(let index = 0; index < expectedTokenSortList.length - 1; index++)
      {
        string += `${expectedTokenSortList[index]}, `;
      }
      string += `or a ${expectedTokenSortList[expectedTokenSortList.length - 1]} was expected!`;
      return string;
    }
  }

  private static generateOperatorsIteratorQueue(nodeList : LinkedList<ParseTreeNode>, symbolTable : FunctionalSymbolsAndOperatorsTable) : Array<LinkedListIterator<ParseTreeNode>>
  {
    const functionalSymbolsIteratorQueue = [];
    const operatorsIteratorQueue = [];
    
    const highestPrecedenceRank = Array.from(symbolTable.getOperatorsRecordsTable().values()).reduce((highestPrecedenceRank, record) => 
    {
      if(highestPrecedenceRank >= record.precedence)
      {
        return highestPrecedenceRank;
      }
      else
      {
        return record.precedence;
      }
    }, 0);

    
    const operatorsIteratorTable : Array<LinkedList<LinkedListIterator<ParseTreeNode>>> = [];
    //Initializing Table
    for(let index = 0; index <= highestPrecedenceRank; index++)
    {
      operatorsIteratorTable.push(new LinkedList()); //For constant time append and unshift
    }
    
    //Filling Table
    const nodeListIterator = new LinkedListIterator(nodeList);
    while(nodeListIterator.isValid())
    {
      const currentNode = nodeListIterator.get();
      const token = currentNode.getCorrespondingInputSubstring().toString();
      const nodeOperatorRecord = symbolTable.getOperatorRecord(token);
      if(nodeOperatorRecord !== undefined)
      {
        const tableIndex = nodeOperatorRecord.precedence;
        if(nodeOperatorRecord.associativity === OperatorAssociativity.Left)
        {
          operatorsIteratorTable[tableIndex].push(nodeListIterator.clone());
        }
        else
        {
          operatorsIteratorTable[tableIndex].unshift(nodeListIterator.clone());
        }
      }

      nodeListIterator.goToNext();
    }

    //Converting Table To Queue
    for(const list of operatorsIteratorTable)
    {
      for(const iterator of list)
      {
        operatorsIteratorQueue.push(iterator);
      }
    }

    return operatorsIteratorQueue;
  }


  private static reduceOperatorApplications(operatorsIteratorQueue : Array<LinkedListIterator<ParseTreeNode>>, inputTokenString : TokenString, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : void
  {
    for(const iteratorAtOperator of operatorsIteratorQueue)
    {
      const topLevelNodeList = iteratorAtOperator.getList();
      const operatorIsOperand = topLevelNodeList.size() === 1;
      if(operatorIsOperand)
      {
        continue;
      }

      const operatorToken = iteratorAtOperator.get().getCorrespondingInputSubstring().toString();
      const operatorRecord = symbolTable.getOperatorRecord(operatorToken);
      const {arity, operatorPosition}  = operatorRecord!;
      const numberOfExpectedLeftOperands = operatorPosition;
      const numberOfExpectedRightOperands = arity - operatorPosition;
      const operatorApplicationReducedNode = new ParseTreeNode(inputTokenString);
      const operandsNodeListList = new LinkedList<LinkedList<ParseTreeNode>>(); //Constant Time Insertion

      //Left Operands
      for(let leftOperandCounter = 0, iteratorAtCurrentNode = iteratorAtOperator.clone(); 
        leftOperandCounter < numberOfExpectedLeftOperands; 
        leftOperandCounter++)
      {
        const currentOperandNodeList = new LinkedList<ParseTreeNode>();
        const currentNode = iteratorAtCurrentNode.get();
        if(currentNode.isSingleToken())
        {
          Parser.checkExpectedToken(iteratorAtCurrentNode, signature, ["TypedToken", "VariableToken", "VariableBindingToken", "RightRoundBracketToken"]);
          const currentNodeSort = signature.getRecord(currentNode.getCorrespondingInputSubstring().toString()).sort();

          if(currentNodeSort === "RightRoundBracket")
          {
            //Encapsulate Node
          }
          else
          {
            iteratorAtCurrentNode = topLevelNodeList.transferNodeToEnd(iteratorAtCurrentNode, currentOperandNodeList).goToPrevious();
            operandsNodeListList.unshift(currentOperandNodeList);
          }
        }
        else
        {
          //Is Compound Node
          iteratorAtCurrentNode = topLevelNodeList.transferNodeToEnd(iteratorAtCurrentNode, currentOperandNodeList).goToPrevious();
          operandsNodeListList.unshift(currentOperandNodeList);
        }
      }
      
      //Right Operands
      for(let rightOperandCounter = 0, iteratorAtCurrentNode = iteratorAtOperator.clone(); 
        rightOperandCounter < numberOfExpectedRightOperands; 
        rightOperandCounter++)
      {
        const currentOperandNodeList = new LinkedList<ParseTreeNode>();
        const currentNode = iteratorAtCurrentNode.get();
        if(currentNode.isSingleToken())
        {
          Parser.checkExpectedToken(iteratorAtCurrentNode, signature, ["TypedToken", "VariableToken", "VariableBindingToken", "LeftRoundBracketToken"]);
          const currentNodeSort = signature.getRecord(currentNode.getCorrespondingInputSubstring().toString()).sort();

          if(currentNodeSort === "LeftRoundBracket")
          {
            //Encapsulate Node
          }
          else
          {
            iteratorAtCurrentNode = topLevelNodeList.transferNodeToEnd(iteratorAtCurrentNode, currentOperandNodeList);
            operandsNodeListList.unshift(currentOperandNodeList);
          }
        }
        else
        {
          //Is Compound Node
          iteratorAtCurrentNode = topLevelNodeList.transferNodeToEnd(iteratorAtCurrentNode, currentOperandNodeList);
          operandsNodeListList.unshift(currentOperandNodeList);
        }
      }

      //Inserting Operator Application Reduced Node
      topLevelNodeList.insertBefore(iteratorAtOperator, operatorApplicationReducedNode);

      //Setting Operator Application Reduced Node Children (operator and operands)
      const listWrappedOperatorNode = new LinkedList<ParseTreeNode>();
      topLevelNodeList.transferNodeToEnd(iteratorAtOperator, listWrappedOperatorNode);

      const operatorApplicationReducedNodeChildrenAsList = operandsNodeListList;
      operatorApplicationReducedNodeChildrenAsList.unshift(listWrappedOperatorNode);
      operatorApplicationReducedNode.children = operatorApplicationReducedNodeChildrenAsList.toArray();

      //Remove Excess Brackets
    }
  }

  private static iteratorIsAtBracketedExpressionStartingPoint(iterator : LinkedListIterator<ParseTreeNode>) : boolean
  {
    return iterator.isValid() && iterator.get().getCorrespondingInputSubstring().toString() === "(";
  }

  private static bracketedExpressionHasEnded(iterator : LinkedListIterator<ParseTreeNode>) : boolean
  {
    return iterator.isValid() && iterator.get().getCorrespondingInputSubstring().toString() === ")";
  }
  
}






