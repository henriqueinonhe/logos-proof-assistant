import { Lexer } from "../Lexing/Lexer";
import { Signature } from "../Lexing/Signature";
import { FunctionalSymbolsAndOperatorsTable } from "./FunctionalSymbolsAndOperatorsTable";
import { LinkedList, LinkedListIterator } from "../Utils/LinkedList";
import { TokenString } from "../Token/TokenString";
import { ParseTreeNode as ParseTreeNode } from "./ParseTreeNode";
import { OperatorAssociativity } from "./OperatorRecord";
import fs from "fs";
import { ParsingException } from "../Utils/ParsingException";
import { InvalidArgumentException } from "../Utils/LogosUtils";

export class Parser
{
  /**
   * Parses string and returns corresponding parse tree if parsing is
   * successfull and throws an exception otherwise.
   * 
   * Pre Conditions:
   * - String must conform to the grammar.
   * 
   * @param string 
   * @param lexer 
   * @param signature 
   * @param symbolTable 
   */
  public static parse(string : string, lexer : Lexer, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : ParseTreeNode
  {
    //1. Lex
    const tokenString = lexer.lex(string, signature);
    if(tokenString.isEmpty())
    {
      throw new InvalidArgumentException("Cannot parse empty string!");
    }

    //2. Wrap Token String Into Node List
    const nodeList = Parser.convertTokenStringToNodeList(tokenString);
    
    //3. Iterators to Operators For Further Processing
    const operatorsIteratorQueue = Parser.generateOperatorsIteratorQueue(nodeList, symbolTable);

    //4. Parse Function Applications and Bracketed Expressions
    const reducedFunctionApplicationAndBracketedEpxressionsNodeList = Parser.parseTopMostExpression(nodeList, signature, symbolTable, tokenString);
    
    //5. Operator Binding
    const reducedOperatorApplicationsNodeList = Parser.parseOperatorApplications(operatorsIteratorQueue, reducedFunctionApplicationAndBracketedEpxressionsNodeList, tokenString, signature, symbolTable);

    fs.writeFileSync("temp.json", JSON.stringify(reducedOperatorApplicationsNodeList.atHead()["reducedNodeObject"](), null, 2));

    return reducedOperatorApplicationsNodeList.atHead();
  }

  /**
   * Converts token string to a [[ParseTreeNode]] [[LinkedList]] for further processing.
   * 
   * @param tokenString 
   */
  private static convertTokenStringToNodeList(tokenString : TokenString) : LinkedList<ParseTreeNode>
  {
    const nodeList = new LinkedList<ParseTreeNode>();
    for(let offset = 0; offset < tokenString.size(); offset++)
    {
      nodeList.push(new ParseTreeNode(tokenString, offset, offset));
    }

    return nodeList;
  }

  /**
   * Reduces Function Applications and Bracketed Expressions, condensing
   * these sub expressions into nodes.
   * 
   * This method carries out most of the parsing process so that after 
   * there will be only operator binding left to do.
   * 
   * The PEG associated with this method is:
   * 
   * TopMostExpression <- Expression EOF
   * 
   * Expression <- Whitespace (ExpressionKernel Whitespace)+
   * 
   * ExpressionKernel <- FunctionApplication / BracketedExpression / PrimitiveExpression
   *
   * Whitespace <- " "*
   *
   * FunctionApplication <- FunctionalSymbol ArgumentList+
   *
   * ArgumentList <- "(" Expression ("," Expression)* ")"
   *
   * BracketedExpression <- "(" Expression ")"
   * 
   * PrimitiveExpression <- FunctionalSymbol / NonFunctionalSymbol
   * 
   * @param inputNodeList 
   * @param signature 
   * @param symbolTable 
   * @param inputTokenString 
   */
  private static parseTopMostExpression(inputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : LinkedList<ParseTreeNode>
  {
    const startIterator = inputNodeList.iteratorAtHead();
    const [iteratorAtCurrentNode, outputNodeList] = Parser.parseExpression(startIterator, inputNodeList, signature, symbolTable, inputTokenString);

    const inputNodeListHasEnded = !iteratorAtCurrentNode.isValid();
    if(!inputNodeListHasEnded)
    {
      throw new ParsingException("String should have ended here!", iteratorAtCurrentNode.get().substringBeginOffset!, iteratorAtCurrentNode.get().substringEndOffset!, inputTokenString);
    }

    return outputNodeList;
  }

  private static parseExpression(iterator : LinkedListIterator<ParseTreeNode>, inputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : [LinkedListIterator<ParseTreeNode>, LinkedList<ParseTreeNode>]
  {
    //Expression <- Whitespace (ExpressionKernel Whitespace)+
    const expressionNodeList = new LinkedList<ParseTreeNode>();
    
    let iteratorAtCurrentNode = iterator;

    //Whitespace
    iteratorAtCurrentNode = Parser.parseWhitespace(iteratorAtCurrentNode, signature);

    //(ExpressionKernel Whitespace)+
    do
    {
      //ExpressionKernel
      const [iteratorAtAfterExpressionKernel, listWrappedExpressionKernelNode] = Parser.parseExpressionKernel(iteratorAtCurrentNode, inputNodeList, signature, symbolTable, inputTokenString);

      listWrappedExpressionKernelNode.transferNodeToEnd(listWrappedExpressionKernelNode.iteratorAtHead(), expressionNodeList); //Explain this line
      iteratorAtCurrentNode = iteratorAtAfterExpressionKernel;
      
      //Whitespace
      iteratorAtCurrentNode = Parser.parseWhitespace(iteratorAtCurrentNode, signature);

    } while(Parser.hasNextExpressionKernel(iteratorAtCurrentNode, signature));

    return [iteratorAtCurrentNode, expressionNodeList];
  }

  private static hasNextExpressionKernel(iterator : LinkedListIterator<ParseTreeNode>, signature :  Signature) : boolean
  {
    if(!iterator.isValid())
    {
      return false;
    }

    const token = iterator.get().getCorrespondingInputSubstring().toString();
    const tokenRecord = signature.getRecord(token);

    return tokenRecord.sort() === "LeftRoundBracketToken" ||
           tokenRecord.sort() === "TypedToken" ||
           tokenRecord.sort() === "VariableToken" ||
           tokenRecord.sort() === "VariableBindingToken";
  }

  private static parseWhitespace(iterator : LinkedListIterator<ParseTreeNode>, signature : Signature) : LinkedListIterator<ParseTreeNode>
  {
    while(iterator.isValid())
    {
      const currentToken = iterator.get().getCorrespondingInputSubstring().toString();
      const currentTokenSort = signature.getRecord(currentToken).sort();
      if(currentTokenSort === "WhitespaceToken")
      {
        iterator.goToNext();
      }
      else
      {
        break;
      }
    }
    return iterator;
  }

  private static parseExpressionKernel(iteratorAtCurrentNode : LinkedListIterator<ParseTreeNode>, inputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : [LinkedListIterator<ParseTreeNode>, LinkedList<ParseTreeNode>]
  {
    //ExpressionKernel <- FunctionApplication / BracketedExpression / PrimitiveExpression
    let listWrappedExpressionKernelNode;

    Parser.checkExpectedToken(iteratorAtCurrentNode, signature, inputTokenString, ["TypedToken", "LeftRoundBracketToken", "VariableBindingToken", "VariableToken"]);

    //FunctionApplication
    if(Parser.iteratorIsAtFunctionApplicationStartingPoint(iteratorAtCurrentNode, symbolTable))
    {
      const iteratorAtFunctionalSymbol = iteratorAtCurrentNode;
      const [iteratorAtAfterFunctionApplication, listWrappedFunctionApplicationNode] = Parser.parseFunctionApplication(iteratorAtFunctionalSymbol, inputNodeList, signature, symbolTable, inputTokenString);

      listWrappedExpressionKernelNode = listWrappedFunctionApplicationNode;
      iteratorAtCurrentNode = iteratorAtAfterFunctionApplication;
    }
    //BracketedExpression
    else if(Parser.iteratorIsAtBracketedExpressionStartingPoint(iteratorAtCurrentNode))
    {
      const iteratorAtLeftOpeningBracket = iteratorAtCurrentNode;
      const [iteratorAtAfterBracketedExpression, listWrappedBracketedExpressionNode] = Parser.parseBracketedExpression(iteratorAtLeftOpeningBracket, inputNodeList, signature, symbolTable, inputTokenString);

      listWrappedExpressionKernelNode = listWrappedBracketedExpressionNode;
      iteratorAtCurrentNode = iteratorAtAfterBracketedExpression;
    }
    //PrimitiveExpression
    else
    {
      const [iteratorAtAfterPrimitiveExpression, listWrappedPrimitiveExpressionNode] = Parser.parsePrimitiveExpression(iteratorAtCurrentNode, inputNodeList);

      listWrappedExpressionKernelNode = listWrappedPrimitiveExpressionNode;
      iteratorAtCurrentNode = iteratorAtAfterPrimitiveExpression;
    }

    return [iteratorAtCurrentNode, listWrappedExpressionKernelNode];

  }

  private static parseBracketedExpression(iteratorAtOpeningLeftBracket : LinkedListIterator<ParseTreeNode>, inputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : [LinkedListIterator<ParseTreeNode>, LinkedList<ParseTreeNode>]
  {
    //BracketedExpression <- "(" Expression ")"
    const bracketedExpressionNode = new ParseTreeNode(inputTokenString);
    const listWrappedBracketedExpressionNode = new LinkedList(bracketedExpressionNode);

    //"("
    Parser.checkExpectedToken(iteratorAtOpeningLeftBracket, signature, inputTokenString, ["LeftRoundBracketToken"]);
    let iteratorAtCurrentNode = iteratorAtOpeningLeftBracket.clone().goToNext();

    const [iteratorAtAfterExpression, expressionNodeList] = Parser.parseExpression(iteratorAtCurrentNode, inputNodeList, signature, symbolTable, inputTokenString);
    
    bracketedExpressionNode.children.push(expressionNodeList);
    iteratorAtCurrentNode = iteratorAtAfterExpression;

    //")"
    Parser.checkExpectedToken(iteratorAtAfterExpression, signature, inputTokenString, ["RightRoundBracketToken"]);
    const iteratorAtAfterBracketedExpression = iteratorAtCurrentNode.clone().goToNext();

    //Offsets
    bracketedExpressionNode.substringBeginOffset = iteratorAtOpeningLeftBracket.get().substringBeginOffset;
    bracketedExpressionNode.substringEndOffset = iteratorAtAfterExpression.get().substringEndOffset;


    return [iteratorAtAfterBracketedExpression, listWrappedBracketedExpressionNode];
  }

  private static parsePrimitiveExpression(iteratorAtPrimitiveExpression : LinkedListIterator<ParseTreeNode>, inputNodeList : LinkedList<ParseTreeNode>) : [LinkedListIterator<ParseTreeNode>, LinkedList<ParseTreeNode>]
  {
    const listWrappedPrimitiveExpressionNode = new LinkedList<ParseTreeNode>();
    const iteratorAtAfterPrimitiveExpression = inputNodeList.transferNodeToEnd(iteratorAtPrimitiveExpression, listWrappedPrimitiveExpressionNode);
    return [iteratorAtAfterPrimitiveExpression, listWrappedPrimitiveExpressionNode];
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

  private static parseFunctionApplication(iteratorAtFunctionalSymbol : LinkedListIterator<ParseTreeNode>, inputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : [LinkedListIterator<ParseTreeNode>, LinkedList<ParseTreeNode>]
  {
    //FunctionApplication <- FunctionalSymbol ArgumentList+

    let topLevelFunctionApplicationNode = new ParseTreeNode(inputTokenString);
    let listWrappedToplevelFunctionApplicationNode = new LinkedList(topLevelFunctionApplicationNode);

    //Functional Symbol
    const listWrappedFunctionalSymbolNode = new LinkedList<ParseTreeNode>();
    const iteratorAtFirstArgumentListOpeningBracket = inputNodeList.transferNodeToEnd(iteratorAtFunctionalSymbol, listWrappedFunctionalSymbolNode);
    topLevelFunctionApplicationNode.children.push(listWrappedFunctionalSymbolNode);
    
    //ArgumentList+
    let iteratorAtCurrentArgumentListOpeningBracket = iteratorAtFirstArgumentListOpeningBracket;
    let iteratorAtCurrentArgumentListClosingBracket;
    let iteratorAtAfterCurrentArgumentListClosingBracket : LinkedListIterator<ParseTreeNode>;
    let isFirstArgumentList = true;
    do
    {
      if(!isFirstArgumentList)
      {
        iteratorAtCurrentArgumentListOpeningBracket = iteratorAtAfterCurrentArgumentListClosingBracket!;
      }

      //ArgumentList
      const parseFunctionArgumentListReturnValues = Parser.parseArgumentList(iteratorAtCurrentArgumentListOpeningBracket, inputNodeList, signature, symbolTable, inputTokenString);

      [iteratorAtCurrentArgumentListClosingBracket] = parseFunctionArgumentListReturnValues;
      const [, argumentNodeListArray] = parseFunctionArgumentListReturnValues;

      if(isFirstArgumentList)
      {
        isFirstArgumentList = false;
      }
      else
      {
        //Rearrange Tree
        const listWrappedFormerTopLevelFunctionApplicationNode = listWrappedToplevelFunctionApplicationNode;

        topLevelFunctionApplicationNode = new ParseTreeNode(inputTokenString);
        listWrappedToplevelFunctionApplicationNode = new LinkedList(topLevelFunctionApplicationNode);
        topLevelFunctionApplicationNode.children.push(listWrappedFormerTopLevelFunctionApplicationNode);
      }
      
      //Append Arguments
      for(const argumentNodeList of argumentNodeListArray)
      {
        topLevelFunctionApplicationNode.children.push(argumentNodeList);
      }

      //Set Offsets
      const topLevelFunctionApplicationNodeFunction = topLevelFunctionApplicationNode.children[0].atHead();

      topLevelFunctionApplicationNode.substringBeginOffset = topLevelFunctionApplicationNodeFunction.substringBeginOffset;
      topLevelFunctionApplicationNode.substringEndOffset = iteratorAtCurrentArgumentListClosingBracket.get().substringEndOffset;

      //Closing Bracket
      iteratorAtAfterCurrentArgumentListClosingBracket = iteratorAtCurrentArgumentListClosingBracket.goToNext();

    } while(Parser.hasNextArgumentList(iteratorAtAfterCurrentArgumentListClosingBracket));
    
    const iteratorAtAfterFunctionApplication = iteratorAtAfterCurrentArgumentListClosingBracket;

    return [iteratorAtAfterFunctionApplication, listWrappedToplevelFunctionApplicationNode];
  }

  private static parseArgumentList(iteratorAtOpeningLeftBracket : LinkedListIterator<ParseTreeNode>, inputNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : [LinkedListIterator<ParseTreeNode>, Array<LinkedList<ParseTreeNode>>]
  {
    //ArgumentList <- "(" Expression ("," Expression)* ")"

    const argumentNodeListArray = [];
    
    //"("
    Parser.checkExpectedToken(iteratorAtOpeningLeftBracket, signature, inputTokenString, ["LeftRoundBracketToken"]);
    let iteratorAtCurrentArgumentFirstNode = iteratorAtOpeningLeftBracket.goToNext();

    //Expression
    Parser.checkExpectedToken(iteratorAtCurrentArgumentFirstNode, signature, inputTokenString, ["LeftRoundBracketToken", "TypedToken", "VariableToken", "WhitespaceToken", "VariableBindingToken"]);

    const [iteratorAtAfterExpression, listWrappedExpressionNode] = Parser.parseExpression(iteratorAtCurrentArgumentFirstNode, inputNodeList, signature, symbolTable, inputTokenString);

    argumentNodeListArray.push(listWrappedExpressionNode);

    //("," Expression)*
    let iteratorAtCurrentArgumentSeparator = iteratorAtAfterExpression;
    while(Parser.hasNextArgument(iteratorAtCurrentArgumentSeparator))
    {
      //","
      iteratorAtCurrentArgumentFirstNode = iteratorAtCurrentArgumentSeparator.goToNext();

      //Expression
      Parser.checkExpectedToken(iteratorAtCurrentArgumentFirstNode, signature, inputTokenString, ["LeftRoundBracketToken", "TypedToken", "VariableToken", "WhitespaceToken", "VariableBindingToken"]);
      const [iteratorAtAfterExpression, listWrappedExpressionNode] = Parser.parseExpression(iteratorAtCurrentArgumentFirstNode, inputNodeList, signature, symbolTable, inputTokenString);

      argumentNodeListArray.push(listWrappedExpressionNode);
      iteratorAtCurrentArgumentSeparator = iteratorAtAfterExpression;
    } 

    //")"
    Parser.checkExpectedToken(iteratorAtCurrentArgumentSeparator, signature, inputTokenString, ["RightRoundBracketToken"]);

    const iteratorAtArgumentListClosingBracket = iteratorAtCurrentArgumentSeparator.clone();
    return [iteratorAtArgumentListClosingBracket, argumentNodeListArray];
  }

  private static hasNextArgument(iteratorAtArgumentSeparator : LinkedListIterator<ParseTreeNode>) : boolean
  {
    const iteratorAtPossibleComma = iteratorAtArgumentSeparator.clone();
    return iteratorAtPossibleComma.isValid() && iteratorAtPossibleComma.get().getCorrespondingInputSubstring().toString() === ",";
  }

  private static hasNextArgumentList(iteratorAtPossibleArgumentListBegin : LinkedListIterator<ParseTreeNode>) : boolean
  {
    return iteratorAtPossibleArgumentListBegin.isValid() && iteratorAtPossibleArgumentListBegin.get().getCorrespondingInputSubstring().toString() === "(";
  }

  private static checkExpectedToken(iteratorAtActualToken : LinkedListIterator<ParseTreeNode>, signature : Signature, inputTokenString : TokenString, expectedTokenSortList : Array<string>) : void
  {
    const expectedTokenSortSet = new Set(expectedTokenSortList);
    const errorSubMessage = this.craftExpectedTokenErrorSubMessage(expectedTokenSortList);
    if(!iteratorAtActualToken.isValid())
    {
      const errorBeginOffset = 0;
      const errorEndOffset = inputTokenString.size() - 1;
      throw new ParsingException(`Premature end of string ${errorSubMessage}`, errorBeginOffset, errorEndOffset, inputTokenString);
    }

    const actualToken = iteratorAtActualToken.get().getCorrespondingInputSubstring().toString();
    const actualTokenSort = signature.getRecord(actualToken.toString()).sort();
    if(!expectedTokenSortSet.has(actualTokenSort))
    {
      const errorBeginOffset = iteratorAtActualToken.get().substringBeginOffset as number;
      const errorEndOffset = iteratorAtActualToken.get().substringEndOffset as number;
      throw new ParsingException(`Found a ${actualTokenSort} ${errorSubMessage}`, errorBeginOffset, errorEndOffset, inputTokenString);
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


  private static parseOperatorApplications(operatorsIteratorQueue : Array<LinkedListIterator<ParseTreeNode>>, outputNodeList : LinkedList<ParseTreeNode>, inputTokenString : TokenString, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : LinkedList<ParseTreeNode>
  {
    for(const iteratorAtOperator of operatorsIteratorQueue)
    {
      const currentExpressionNodeList = iteratorAtOperator.getList();
      const operatorIsOperand = currentExpressionNodeList.size() === 1;
      if(operatorIsOperand)
      {
        continue;
      }

      const operatorToken = iteratorAtOperator.get().getCorrespondingInputSubstring().toString();
      const operatorRecord = symbolTable.getOperatorRecord(operatorToken);
      const {arity, operatorPosition}  = operatorRecord!;
      const numberOfExpectedLeftOperands = operatorPosition;
      const numberOfExpectedRightOperands = arity - operatorPosition;
      const reducedOperatorApplicationNode = new ParseTreeNode(inputTokenString);
      const listWrappedOperandsList = new LinkedList<LinkedList<ParseTreeNode>>(); //Constant Time Insertion

      //Left Operands
      for(let leftOperandCounter = 0, iteratorAtCurrentOperandNode = iteratorAtOperator.clone().goToPrevious(); 
        leftOperandCounter < numberOfExpectedLeftOperands; 
        leftOperandCounter++, iteratorAtCurrentOperandNode = iteratorAtOperator.clone().goToPrevious())
      {
        const listWrappedCurrentOperand = new LinkedList<ParseTreeNode>();
        const currentOperandNode = iteratorAtCurrentOperandNode.get();
        if(currentOperandNode.isSingleToken())
        {
          Parser.checkExpectedToken(iteratorAtCurrentOperandNode, signature, inputTokenString, ["TypedToken", "VariableToken", "VariableBindingToken", "RightRoundBracketToken"]);
        }

        currentExpressionNodeList.transferNodeToEnd(iteratorAtCurrentOperandNode, listWrappedCurrentOperand);
        listWrappedOperandsList.unshift(listWrappedCurrentOperand);
      }
      
      //Right Operands
      for(let rightOperandCounter = 0, iteratorAtCurrentOperandNode = iteratorAtOperator.clone().goToNext(); 
        rightOperandCounter < numberOfExpectedRightOperands; 
        rightOperandCounter++, iteratorAtCurrentOperandNode = iteratorAtOperator.clone().goToNext())
      {
        const listWrappedCurrentOperand = new LinkedList<ParseTreeNode>();
        const currentNode = iteratorAtCurrentOperandNode.get();
        if(currentNode.isSingleToken())
        {
          Parser.checkExpectedToken(iteratorAtCurrentOperandNode, signature, inputTokenString, ["TypedToken", "VariableToken", "VariableBindingToken", "LeftRoundBracketToken"]);
        }

        currentExpressionNodeList.transferNodeToEnd(iteratorAtCurrentOperandNode, listWrappedCurrentOperand);
        listWrappedOperandsList.push(listWrappedCurrentOperand);
      }

      //Inserting Operator Application Reduced Node
      currentExpressionNodeList.insertBefore(iteratorAtOperator, reducedOperatorApplicationNode);

      //Setting Operator Application Reduced Node Children (operator and operands)
      const listWrappedOperatorNode = new LinkedList<ParseTreeNode>();
      currentExpressionNodeList.transferNodeToBegin(iteratorAtOperator, listWrappedOperatorNode);

      const reducedOperatorApplicationNodeChildrenAsList = listWrappedOperandsList;
      reducedOperatorApplicationNodeChildrenAsList.unshift(listWrappedOperatorNode);

      reducedOperatorApplicationNode.children = reducedOperatorApplicationNodeChildrenAsList.toArray(); //Recovering array from linked list

      //Setting Offsets
      const operatorIsPrefix = operatorPosition === 0;
      const operatorIsSuffix = operatorPosition === arity;
      const operatorNode = reducedOperatorApplicationNode.children[0].atHead();
      const firstOperandNode = reducedOperatorApplicationNode.children[1].atHead();
      const lastOperandNode = reducedOperatorApplicationNode.children[reducedOperatorApplicationNode.children.length - 1].atLast();
      if(operatorIsPrefix)
      {
        reducedOperatorApplicationNode.substringBeginOffset = operatorNode.substringBeginOffset;
        reducedOperatorApplicationNode.substringEndOffset = lastOperandNode.substringEndOffset;
      }
      else if(operatorIsSuffix)
      {
        reducedOperatorApplicationNode.substringBeginOffset = firstOperandNode.substringBeginOffset;
        reducedOperatorApplicationNode.substringEndOffset = operatorNode.substringEndOffset;
      }
      else
      {
        reducedOperatorApplicationNode.substringBeginOffset = firstOperandNode.substringBeginOffset;
        reducedOperatorApplicationNode.substringEndOffset = lastOperandNode.substringEndOffset;
      }
    }

    //Parsing Default Prefix Operators
    outputNodeList = Parser.parseDefaultPrefixOperatorApplications(outputNodeList, inputTokenString);

    //Remove Proxy Nodes
    const iterator = outputNodeList.iteratorAtHead();
    while(iterator.isValid())
    {
      Parser.removeParseTreeProxyNodes(iterator.clone());
      if(!iterator.isValid())
      {
        break;
      }
      iterator.goToNext();
    }

    return outputNodeList;
  }

  private static removeParseTreeProxyNodes(iteratorAtParentNode : LinkedListIterator<ParseTreeNode>) : void
  {
    const parentNode = iteratorAtParentNode.get();

    for(const childList of parentNode.children)
    {
      const iterator = childList.iteratorAtHead();
      while(iterator.isValid())
      {
        Parser.removeParseTreeProxyNodes(iterator.clone());
        if(!iterator.isValid())
        {
          break;
        }
        iterator.goToNext();
      }
    }

    if(parentNode.children.length === 1)
    {
      const parentNodeSingleChild = parentNode.children[0];
      const iteratorAtNodeToBeElevated = parentNodeSingleChild.iteratorAtHead();
      const listThatOwnsParentNode = iteratorAtParentNode.getList();
      parentNodeSingleChild.transferNodeBefore(iteratorAtNodeToBeElevated, listThatOwnsParentNode, iteratorAtParentNode);
      listThatOwnsParentNode.remove(iteratorAtParentNode);
    }
  }

  private static iteratorIsAtBracketedExpressionStartingPoint(iterator : LinkedListIterator<ParseTreeNode>) : boolean
  {
    return iterator.isValid() && iterator.get().getCorrespondingInputSubstring().toString() === "(";
  }

  private static parseDefaultPrefixOperatorApplications(outputNodeList : LinkedList<ParseTreeNode>, inputTokenString : TokenString) : LinkedList<ParseTreeNode>
  {
    for(const node of outputNodeList)
    {
      for(const nodeList of node.children)
      {
        Parser.parseDefaultPrefixOperatorApplications(nodeList, inputTokenString);
      }
    }

    if(outputNodeList.size() > 1)
    {
      const operatorApplicationNode = new ParseTreeNode(inputTokenString);
      const listWrappedOperatorNode = new LinkedList<ParseTreeNode>();
      const iteratorAtOperatorNode = outputNodeList.iteratorAtHead();
      
      let iteratorAtCurrentOperandNode = outputNodeList.transferNodeToEnd(iteratorAtOperatorNode, listWrappedOperatorNode);
      operatorApplicationNode.children.push(listWrappedOperatorNode);
      while(iteratorAtCurrentOperandNode.isValid())
      {
        const listWrappedCurrentOperandNode = new LinkedList<ParseTreeNode>();
        iteratorAtCurrentOperandNode = outputNodeList.transferNodeToEnd(iteratorAtCurrentOperandNode, listWrappedCurrentOperandNode);
        operatorApplicationNode.children.push(listWrappedCurrentOperandNode);
      }
      
      outputNodeList.unshift(operatorApplicationNode);
      operatorApplicationNode.substringBeginOffset = operatorApplicationNode.children[0].atHead().substringBeginOffset;
      operatorApplicationNode.substringEndOffset = operatorApplicationNode.children[operatorApplicationNode.children.length - 1].atLast().substringEndOffset;
    }

    return outputNodeList;
  }
}






