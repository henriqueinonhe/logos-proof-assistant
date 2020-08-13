import { Lexer } from "../Lexing/Lexer";
import { Signature } from "../Lexing/Signature";
import { FunctionalSymbolsAndOperatorsTable } from "./FunctionalSymbolsAndOperatorsTable";
import { Token } from "../Token/Token";
import { LinkedList, LinkedListIterator } from "../Utils/LinkedList";
import { TokenString } from "../Token/TokenString";
import { InvalidArgumentException } from "../Utils/LogosUtils";

export class TokenWrapper
{
  constructor(token : Token, correspondingInputTokenOffset : number)
  {
    this.token = token;
    this.correspondingInputTokenOffset = correspondingInputTokenOffset;
    this.active = true;
  }

  public token : Token;
  public correspondingInputTokenOffset : number | undefined;
  public active : boolean;
}

export class BracketWrapper extends TokenWrapper
{
  constructor(token : Token, correspondingInputTokenOffset : number)
  {
    super(token, correspondingInputTokenOffset);
    this.matchingBracketIterator = undefined;
  }

  public matchingBracketIterator : LinkedListIterator<TokenWrapper> | undefined;
}

type WrappedTokenList = LinkedList<TokenWrapper>;

export class Parser
{
  public static parse(string : string, lexer : Lexer, signature : Signature, symbolTable : FunctionalSymbolsAndOperatorsTable) : void //NOTE Stub for now
  {
    //1. Lex
    const tokenString = lexer.lex(string, signature);

    //2. Wrap Token String and Prepare For Bracket Matching
    const wrappedTokenList = this.wrapTokenStringAndHandleBrackets(tokenString);
    
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
  private static wrapTokenStringAndHandleBrackets(tokenString : TokenString) : WrappedTokenList
  {
    //Wrap Tokens
    const wrappedTokenList = new LinkedList<TokenWrapper>();
    const leftBracketIteratorStack = [];
    const unmatchedRightBracketList = [];
    for(let offset = 0; offset < tokenString.size(); offset++)
    {
      const currentToken = tokenString.tokenAt(offset);
      if(currentToken.toString() === "(")
      {
        const wrappedLeftBracket = new BracketWrapper(currentToken, offset);
        wrappedTokenList.push(wrappedLeftBracket);

        const wrappedLeftBracketIterator = wrappedTokenList.iteratorAtLast();
        leftBracketIteratorStack.push(wrappedLeftBracketIterator);
      }
      else if(currentToken.toString() === ")")
      {
        const wrappedRightBracket = new BracketWrapper(currentToken, offset);
        wrappedTokenList.push(wrappedRightBracket);
        
        if(leftBracketIteratorStack.length === 0)
        {
          unmatchedRightBracketList.push(wrappedRightBracket);
        }
        else
        {
          const mostRecentWrappedLeftBracketIterator = leftBracketIteratorStack.pop() as LinkedListIterator<BracketWrapper>;
          const wrappedRightBracketIterator = wrappedTokenList.iteratorAtLast(); //Because the most
          //recently added token is exactly the right bracket under analysis
          mostRecentWrappedLeftBracketIterator.get().matchingBracketIterator = wrappedRightBracketIterator;
          wrappedRightBracket.matchingBracketIterator = mostRecentWrappedLeftBracketIterator;
        }
      }
      else
      {
        const wrappedToken = new TokenWrapper(currentToken, offset);
        wrappedTokenList.push(wrappedToken);
      }
    }

    const unmatchedLeftBracketList = leftBracketIteratorStack.map(iterator => iterator.get());
    if(unmatchedLeftBracketList.length !== 0 ||
       unmatchedRightBracketList.length !== 0)
    {
      //TODO implement correct exception
      throw new InvalidArgumentException(`Brackets at the following indexes are unmatched: ${[...unmatchedLeftBracketList, ...unmatchedRightBracketList].map(bracket => bracket.correspondingInputTokenOffset).join(", ")}`);
    }

    return wrappedTokenList;
  }

  /**
   * //What it does
   * When performing mixfix operators' argument binding, operators
   * must see function applications as a single "unit", which is very hard 
   * to do in linear time using the unmodified syntax, as expressions like
   * "f(a + b)(c + d) * 3" (curried functions) will make it hard for operators
   * to understand whether a given bracketed expression is bound to the
   * curried function application or should be bound to the operator itself.
   * 
   * A simple yet effective solution is to just add temporary special brackets 
   * ("_(_" and "_)_") around function applications, so "f(a + b)(c + d) * 3"
   *  will turn into "_(_f(a + b)(c + d)_)_ * 3".
   * 
   * Later these temporary brackets will be removed, so to speed up the process
   * and avoid having to scan the whole string again, they
   * will be referenced using iterators that will be held in an array.
   * 
   * Functional symbol identification is also a part of this process, so
   * they will also be referenced using iterators for further processing.
   * 
   * And lastly we'll deactive single symbols that are arguments to functional
   * applications, so when performing operator binding they won't be considered.
   * 
   * //How it does
   * The string is scanned left to right, token by token, until control finds 
   * a token that is declared as a functional symbol (in [[FunctionalSymbolsAndOperatorsTable]]),
   * then it checks whether this functional symbol is part of a function application
   * or is just being used as an argument to another function/operator.
   * 
   * To do so, it checks token *immediately* after the functional symbol:
   * - If it is a left bracket, then it means we're dealing with a function
   * application.
   * - If it is *anything* else (including a whitespace) it means we're dealing
   * with an argument.
   * 
   * If we're dealing with a function application, then we insert a special left bracket 
   * right before the functional symbol and store an iterator to it in the 
   * `functionApplicationOIsolatorBracketsIterators` array. We also store
   * an interator to the functional symbol.
   * 
   * Then we keep on scanning in the context of ... //TODO Finish explanation
   * 
   * Right after this jump we can determine if we're dealing with a curried function
   * application or not, which depends on the same criteria we used to determine
   * whether we're dealing with a function application or not.
   * 
   * So we repeat this process until we find the last curried application
   * (should it exist) and then we insert a right bracket, match it to the
   * inserted left bracket and store an iterator pointing to it.
   * 
   * Rinse and repeat until end of string is reached.
   * 
   * @param wrappedTokenList 
   */
  // private static isolateFunctionalTerms(wrappedTokenList : WrappedTokenList, symbolTable : FunctionalSymbolsAndOperatorsTable) : [WrappedTokenList, Array<LinkedListIterator>, Array<LinkedListIterator>]
  // {
  //   const functionApplicationIsolatorBracketsIterators = [];
  //   const functionalSymbolsIterators = [];
  //   let currentTokenIterator = wrappedTokenList.iteratorAtHead();
  //   let currentToken = currentTokenIterator.get();
  //   while(true) //Change this later
  //   {
  //     const tokenIsFunctionalSymbol = symbolTable.tokenIsFunctionalSymbol(currentToken.toString());
  //     if(tokenIsFunctionalSymbol)
  //     {
  //       //Start scanning function arguments
  //       const iteratorAtFunctionalSymbol = currentTokenIterator;
  //       const iteratorAtLeftBracket = iteratorAtFunctionalSymbol.clone().goToNext();
  //       if(iteratorAtLeftBracket.isAtLast())
  //       {

  //       }
  //     }
  //   }

      
  // }

  private static functionalSymbolIsPartOfFunctionApplication(iteratorToFunctionalSymbol : LinkedListIterator<TokenWrapper>) : boolean
  {
    if(iteratorToFunctionalSymbol.isAtLast())
    {
      return false;
    }

    const nextToken = iteratorToFunctionalSymbol.clone().goToNext().get(); //To avoid modifying original iterator
    return nextToken.token.toString() === ")";
  }
}

