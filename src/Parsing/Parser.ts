import { Lexer } from "../Lexing/Lexer";
import { Signature } from "../Lexing/Signature";
import { FunctionalSymbolsAndOperatorsTable } from "./FunctionalSymbolsAndOperatorsTable";
import { LinkedList, LinkedListIterator } from "../Utils/LinkedList";
import { TokenString } from "../Token/TokenString";
import { InvalidArgumentException } from "../Utils/LogosUtils";
import { ParseTreeNode as ParseTreeNode } from "./ParseTreeNode";
import { ParseTreeBracketNode } from "./ParseTreeBracketNode";

export class Parser
{
  public static parse(string : string, lexer : Lexer, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : void //NOTE Stub for now
  {
    //1. Lex
    const tokenString = lexer.lex(string, signature);

    //2. Wrap Token String and perform Bracket Matching
    const nodeList = this.convertTokenStringToNodeListAndHandleBrackets(tokenString);
    
    //3. 
    Parser.reduceFunctionApplications(nodeList, signature, symbolTable, tokenString);
    console.log(JSON.stringify(nodeList.toArray().map(element => element["reducedNodeObject"]())));
  }

  /**
   * //What it does
   * This algorithm pre processes the token string so it can be further parsed
   * in linear time and handle error reporting gracefully.
   * 
   * Tokens are wrapped either using [[TokenWrapper]] class or, in case they are
   * a round brackets, using [[BracketWrapper]] and then put into a [[LinkedList]].
   * 
   * A [[TokenWrapper]] is a token bundled with two additional properties:
   * 
   * 1. Its corresponding [[TokenString]] offset, so later when other tokens 
   * (mostly brackets) are  inserted/removes, if there is any error we can still 
   * point to the tokens that caused the error in the input string itself, 
   * othwerise we would only be able to report errors based on a half processed 
   * string where tokens would possibly be out of their original position.
   * 2. An `active` flag that indicates whether a given token may act as an
   * active operator and thus bind surrounding tokens as arguments to itself. 
   * This is necessary to differentiate whether a given token (should it be an
   * operator) is acting as an operator and thus will take arguments, or if
   * it is acting as an operand and therefore should not perform argument binding.
   * 
   * A [[BracketWrapper]] is a subclass of a [[TokenWrapper]] and additionally
   * holds a [[LinkedListIterator]] that points to the matching [[BracketWrapper]],
   * that is, if there is one.
   * 
   * So, for instance, in the sentence "((2+3)*4)", the first left bracket is
   * matched by the last right bracket, and the second left bracket matches the
   * first right bracket.
   * 
   * This is done to enable linear time string traversal when parsing, because
   * due to mixfix operators parsing, with "linked" matching brackets whenever
   * we need to scan an argument of a given operator, if it is enclosed inside
   * (possibly multiple nested levels) brackets we don't need to step one token
   * at a time to find the matching bracket, we just "jump" to the matching
   * bracket using the iterator referenced in [[BracketWrapper]].
   * 
   * Mind that bracket matching is easily done in linear time.
   * 
   * If we didn't use this technique of storing iterators to matching brackets
   * we would end up scanning the same tokens many times and the argument resolution
   * algorithm for mixfix operators would have at least quadratic time complexity.
   * 
   * Also, wrapped tokens are contained in a linked list and not an array/vector,
   * because the parsing algorithm works by inserting/removing brackets and other
   * tokens (like commas, for example) and so we need constant time insertion/
   * deletion to keep the parsing algorithm linear.
   * 
   * //How it does
   * The algorithm both wraps tokens and matches brackets, while also collecting
   * umatched brackets for further error reporting.
   * 
   * Bracket matching can be done using a stack where encountered left brackets
   * are kept and every time a right bracket is found the last pushed left
   * bracket is popped.
   * 
   * If a right bracket is found and the stack is empty, or if the stack is
   * not empty by the time the string has been fully scanned it means that 
   * there are unmatched brackets.
   * 
   * So, the algorithm iterates through the [[TokenString]] wrapping each [[Token]]
   * either in a [[TokenWrapper]] if it is not a bracket and in a [[BracketWrapper]]
   * otherwise.
   * 
   * Whenever control stumbles upon a *left* bracket it also adds an iterator
   * pointing to the bracket ([[BracketWrapper]]) to `leftBracketIteratorStack`.
   * 
   * This stack is used both to match brackets and to keep track of unmatched
   * brackets.
   * 
   * When control finds a *right* bracket it first checks `leftBracketIteratorStack`,
   * for if it is not empty it pops the last iterator and assigns it to the
   * right bracket wrapper and vice versa.
   * 
   * If the stack is empty when a right bracket is found, it means that this
   * right bracket doesn't match any left brackets so it is pushed to 
   * `unmatchedRigthBracketList`.
   * 
   * When the input string has been fully scanned, if there are any left
   * brackets (actually iterators, but you get the idea) left in 
   * `leftBracketIteratorStack` it means that these brackets are unmatched.
   * 
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
        const leftBracketNode = new ParseTreeBracketNode(tokenString, offset, offset);
        tokenNodeList.push(leftBracketNode);

        const leftBracketNodeIterator = tokenNodeList.iteratorAtLast();
        leftBracketIteratorStack.push(leftBracketNodeIterator);
      }
      else if(currentToken.toString() === ")")
      {
        const rightBracketNode = new ParseTreeBracketNode(tokenString, offset, offset);
        tokenNodeList.push(rightBracketNode);
        
        if(leftBracketIteratorStack.length === 0)
        {
          unmatchedRightBracketList.push(rightBracketNode);
        }
        else
        {
          const mostRecentLeftBracketNodeIterator = leftBracketIteratorStack.pop() as LinkedListIterator<ParseTreeBracketNode>;
          const rightBracketNodeIterator = tokenNodeList.iteratorAtLast(); //Because the most
          //recently added token is exactly the right bracket under analysis
          mostRecentLeftBracketNodeIterator.get().matchingBracketNodeIterator = rightBracketNodeIterator as LinkedListIterator<ParseTreeBracketNode>;
          rightBracketNode.matchingBracketNodeIterator = mostRecentLeftBracketNodeIterator;
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
   * @param tokenNodeList (out)
   * @param signature 
   * @param symbolTable 
   */
  private static reduceFunctionApplications(tokenNodeList : LinkedList<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : void
  {
    let currentNodeIterator = tokenNodeList.iteratorAtHead();
    let nodeListEndHasBeenReached = !currentNodeIterator.isValid(); //
    while(!nodeListEndHasBeenReached)
    {
      if(Parser.iteratorIsAtFunctionApplicationStartingPoint(currentNodeIterator, symbolTable))
      {
        const iteratorAtFunctionalSymbol = currentNodeIterator;
        const iteratorAtFunctionApplicationReducedNode = Parser.reduceSingleFunctionApplication(iteratorAtFunctionalSymbol, signature, symbolTable, inputTokenString);
        currentNodeIterator = iteratorAtFunctionApplicationReducedNode;
      }

      currentNodeIterator = currentNodeIterator.goToNext();

      nodeListEndHasBeenReached = !currentNodeIterator.isValid();
    }
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
  private static reduceSingleFunctionApplication(iteratorAtFunctionalSymbol : LinkedListIterator<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : LinkedListIterator<ParseTreeNode>
  {
    //Inserting Reduced Node In Top Level Node List
    const topLevelNodeList = iteratorAtFunctionalSymbol.getList();
    let topLevelFunctionApplicationReducedNode = new ParseTreeNode(inputTokenString);
    let iteratorAtTopLevelFunctionApplicationReducedNode = topLevelNodeList.insertBefore(iteratorAtFunctionalSymbol, topLevelFunctionApplicationReducedNode);

    //Transfer Functional Symbol Node And Push List To Reduced Node
    const listWrappedFunctionalSymbolNode = new LinkedList<ParseTreeNode>();
    topLevelNodeList.transferNodeToEnd(iteratorAtFunctionalSymbol, listWrappedFunctionalSymbolNode);
    topLevelFunctionApplicationReducedNode.children.push(listWrappedFunctionalSymbolNode);
    
    let isFirstArgumentList = true;
    let iteratorAtCurrentArgumentListOpeningBracket;
    let iteratorAtCurrentArgumentListClosingBracket = iteratorAtTopLevelFunctionApplicationReducedNode; //Language Abuse
    
    //First Argument List Is Presence Mandatory
    do
    {
      if(isFirstArgumentList)
      {
        iteratorAtCurrentArgumentListOpeningBracket = iteratorAtTopLevelFunctionApplicationReducedNode.clone().goToNext();
      }
      else
      {
        iteratorAtCurrentArgumentListOpeningBracket = topLevelNodeList.remove(iteratorAtCurrentArgumentListClosingBracket);
      }
      const reduceFunctionArgumentListReturnValues = Parser.reduceFunctionArgumentList(topLevelNodeList, iteratorAtCurrentArgumentListOpeningBracket, signature, symbolTable, inputTokenString);
      [iteratorAtCurrentArgumentListClosingBracket] = reduceFunctionArgumentListReturnValues;
      const [, argumentNodeListArray] = reduceFunctionArgumentListReturnValues;

      if(isFirstArgumentList)
      {
        //Set First Function Application Offsets
        const argumentListClosingBracketOffset = iteratorAtCurrentArgumentListClosingBracket.get().substringEndOffset;
        const functionalSymbolNode = iteratorAtFunctionalSymbol.get();
  
        topLevelFunctionApplicationReducedNode.substringBeginOffset = functionalSymbolNode.substringBeginOffset;
        topLevelFunctionApplicationReducedNode.substringEndOffset = argumentListClosingBracketOffset;
  
        isFirstArgumentList = false;
      }
      else
      {
        //Rearrange Tree
        //Defining Offsets
        const formerTopLevelFunctionApplicationReducedNode = topLevelFunctionApplicationReducedNode;
        const iteratorAtFormerTopLevelFunctionApplicationReducedNode = iteratorAtTopLevelFunctionApplicationReducedNode;
        const formerTopLevelFunctionApplicationReducedNodeBeginOffset = formerTopLevelFunctionApplicationReducedNode.substringBeginOffset;
        const argumentListClosingBracketOffset = iteratorAtCurrentArgumentListClosingBracket.get().substringEndOffset;
      
        //Create New Top Level Function Application Reduced Node And Insert It
        topLevelFunctionApplicationReducedNode = new ParseTreeNode(inputTokenString, formerTopLevelFunctionApplicationReducedNodeBeginOffset, argumentListClosingBracketOffset);
        iteratorAtTopLevelFunctionApplicationReducedNode = topLevelNodeList.insertBefore(iteratorAtFormerTopLevelFunctionApplicationReducedNode, topLevelFunctionApplicationReducedNode);

        //Append Former To Current
        const listWrappedFormerTopLevelFunctionApplicationReducedNode = new LinkedList<ParseTreeNode>();
        topLevelNodeList.transferNodeToEnd(iteratorAtFormerTopLevelFunctionApplicationReducedNode, listWrappedFormerTopLevelFunctionApplicationReducedNode);
        topLevelFunctionApplicationReducedNode.children.push(listWrappedFormerTopLevelFunctionApplicationReducedNode);
      }

      //Remove Last Closing Bracket
      topLevelNodeList.remove(iteratorAtCurrentArgumentListClosingBracket);

      //Append Arguments
      for(const argumentNodeList of argumentNodeListArray)
      {
        topLevelFunctionApplicationReducedNode.children.push(argumentNodeList);
      }
    } while(Parser.hasNextArgumentList(iteratorAtCurrentArgumentListClosingBracket));

    return iteratorAtTopLevelFunctionApplicationReducedNode;
  }

  private static reduceFunctionArgumentList(topLevelNodeList : LinkedList<ParseTreeNode>, iteratorAtOpeningLeftBracket : LinkedListIterator<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : [LinkedListIterator<ParseTreeNode>, Array<LinkedList<ParseTreeNode>>]
  {
    const argumentNodeListArray = [];
    let iteratorAtCurrentArgumentFirstNode;
    let iteratorAtCurrentArgumentSeparator = iteratorAtOpeningLeftBracket;

    do
    {
      iteratorAtCurrentArgumentFirstNode = topLevelNodeList.remove(iteratorAtCurrentArgumentSeparator);

      const parseFunctionArgumentReturnValue = Parser.parseFunctionArgument(topLevelNodeList, iteratorAtCurrentArgumentFirstNode, signature, symbolTable, inputTokenString);
      [iteratorAtCurrentArgumentSeparator] = parseFunctionArgumentReturnValue;
      const [, currentArgumentNodeList] = parseFunctionArgumentReturnValue;

      argumentNodeListArray.push(currentArgumentNodeList);

    } while(Parser.hasNextArgument(iteratorAtCurrentArgumentSeparator));

    const iteratorAtArgumentListClosingBracket = iteratorAtCurrentArgumentSeparator.clone();
    return [iteratorAtArgumentListClosingBracket, argumentNodeListArray];
  }

  private static parseFunctionArgument(topLevelNodeList : LinkedList<ParseTreeNode>, iteratorAtArgumentFirstNode : LinkedListIterator<ParseTreeNode>, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable, inputTokenString : TokenString) : [LinkedListIterator<ParseTreeNode>, LinkedList<ParseTreeNode>]
  {
    const argumentNodeList = new LinkedList<ParseTreeNode>();
    let iteratorAtCurrentNode = iteratorAtArgumentFirstNode.clone();

    //Remove Leading Whitespace
    iteratorAtCurrentNode = Parser.ignoreWhitespace(topLevelNodeList, iteratorAtCurrentNode, signature);
    //First Significant Token Is Mandatory
    Parser.checkExpectedToken(iteratorAtCurrentNode, signature, ["TypedToken", "VariableToken", "VariableBindingToken", "LeftRoundBracketToken"]);

    if(Parser.iteratorIsAtFunctionApplicationStartingPoint(iteratorAtCurrentNode, symbolTable))
    {
      iteratorAtCurrentNode = Parser.reduceSingleFunctionApplication(iteratorAtCurrentNode, signature, symbolTable, inputTokenString);
    }
    iteratorAtCurrentNode = topLevelNodeList.transferNodeToEnd(iteratorAtCurrentNode, argumentNodeList);

    while(!Parser.functionArgumentHasFinished(iteratorAtCurrentNode))
    {
      Parser.checkExpectedToken(iteratorAtCurrentNode, signature, ["TypedToken", "VariableToken", "VariableBindingToken", "LeftRoundBracketToken", "WhitespaceToken"]);
      
      if(Parser.iteratorIsAtFunctionApplicationStartingPoint(iteratorAtCurrentNode, symbolTable))
      {
        iteratorAtCurrentNode = Parser.reduceSingleFunctionApplication(iteratorAtCurrentNode, signature, symbolTable, inputTokenString);
      }
      
      iteratorAtCurrentNode = topLevelNodeList.transferNodeToEnd(iteratorAtCurrentNode, argumentNodeList);
    }

    Parser.removeArgumentNodeListTrailingWhitespace(argumentNodeList);
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

  private static ignoreWhitespace(topLevelNodeList : LinkedList<ParseTreeNode>, iterator : LinkedListIterator<ParseTreeNode>, signature : Signature) : LinkedListIterator<ParseTreeNode>
  {
    while(iterator.isValid())
    {
      const currentToken = iterator.get().getCorrespondingInputSubstring().toString();
      const currentTokenSort = signature.getRecord(currentToken).sort();
      if(currentTokenSort === "WhitespaceToken")
      {
        iterator = topLevelNodeList.remove(iterator);
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
  private static removeNodesFromList(list : LinkedList<ParseTreeNode>, begin : LinkedListIterator<ParseTreeNode>, end : LinkedListIterator<ParseTreeNode>) : void

  {
    const iterator = begin.clone();
    while(iterator["node"] !== end["node"])
    {
      list.remove(iterator);
    }
  }
}

