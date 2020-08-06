import { TypeParseTree } from "./TypeParseTree";
import { TypeTokenString } from "./TypeTokenString";
import { TypeTokenSort } from "./TypeToken";
import { TypeParseTreeIterator } from "./TypeParseTreeIterator";
import { ParsingException } from "../Utils/ParsingException";
import { TypeParsingTreeNodeMainOperator, TypeParseTreeNode } from "./TypeParseTreeNode";
import { LogicErrorException } from "../Utils/LogosUtils";

/**
 * Represents a type parser.
 * 
 * It has no internal state, therefore it has only 
 * static methods and no constructor.
 * 
 * Its sole purpose is to build types'
 * parsing trees and report occurring errors.
 * 
 * Types conform to the following Context-Free Grammar:
 * 
 * <expr> ::= <prim> | <comp>
 * <prim> ::= (Primitive tokens)
 * <comp> ::= <prim> -> <prim> | <prim> -> (<comp>) | (<comp>) -> <prim> |
 *            (<comp>) -> (<comp>) | <prod> -> <prim> | <prod> -> (<comp>)
 * <prod> ::= [<expr> <more>]
 * <more> ::= , <expr> <more> | , <expr>
 * 
 * The parser build the Abstract Syntax Tree directly, without relying on an
 * intermediate Concrete Syntax Tree, therefore the built trees won't reflect
 * the aforementionted grammar exactly.
 * 
 * The parsing technique used is a mix of LL(k) and operator precedence.
 */
export class TypeParser
{
  /**
   * Tries to parse a given string into a type, yielding a
   * [[TypeParseTree]] if the sentence if well formed or 
   * throwing an exception otherwise.
   * 
   * Pre Conditions:
   * - The string passed must be a well formed type.
   * 
   * Post Conditions:
   * - Returns corresponding AST [[TypeParseTree]].
   * 
   * @param string 
   */
  public static parse(string : string) : TypeParseTree
  {
    const typeString = new TypeTokenString(string);
    const parseTree = new TypeParseTree(string);
    const iterator = new TypeParseTreeIterator(parseTree);
    if(TypeParser.typeStringIsPrimitiveType(typeString))
    {
      iterator.node().setMainOperator(TypeParsingTreeNodeMainOperator.Primitive);
    }
    else //Composite Type
    {
      const firstArgumentBeginOffset = 0;
      const secondArgumentEndOffset = TypeParser.parseCompositeType(typeString, iterator, firstArgumentBeginOffset);
      const typeStringLastOffset = typeString.size() - 1;
      if(secondArgumentEndOffset !== typeStringLastOffset)
      {
        throw new ParsingException(`String should have ended!`, secondArgumentEndOffset, typeStringLastOffset, typeString);
      }
    }

    return parseTree;
  }
  /**
   * Checks whether the given [[TypeTokenString]] is a primitive type,
   * that is, it's composed of a single [[TypeToken]] whose sort 
   * is PrimitiveType.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns whether the given string corresponds to a primtive type.
   * 
   * @param typeString 
   */
  public static typeStringIsPrimitiveType(typeString : TypeTokenString) : boolean
  {
    return typeString.size() === 1 && 
           typeString.tokenAt(0).getSort() === TypeTokenSort.PrimitiveType;
  }
  /**
   * Checks whether a given [[TypeTokenString]] is empty.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns whether the given string is empty.
   * 
   * @param typeString
   */
  public static typeStringIsEmpty(typeString : TypeTokenString) : boolean
  {
    return typeString.size() === 0;
  }
  /**
   * Tries to parse a substring whose main operator is the composition.
   * 
   * According to the grammar a composition is defined as:
   * 
   * <comp> ::= <prim> -> <prim> | <prim> -> (<comp>) | (<comp>) -> <prim> |
   *            (<comp>) -> (<comp>) | <prod> -> <prim> | <prod> -> (<comp>)
   * 
   * Pre Conditions:
   * - Substring must be a suitable composite type.
   * 
   * Post Conditions:
   * - Parses composite type, appending nodes and setting offsets and main operator.
   * - Returns composite type end offset.
   * 
   * @param typeString
   * @param iterator 
   * @param firstArgumentBeginOffset 
   * @returns Composite type end offset
   */
  private static parseCompositeType(typeString : TypeTokenString,
                                    passedIterator : TypeParseTreeIterator, 
                                    firstArgumentBeginOffset : number) : number
  {
    const currentNode = passedIterator.node();
    TypeParser.checkExpectedToken(typeString, 
                                  firstArgumentBeginOffset, 
                                  [TypeTokenSort.PrimitiveType, 
                                   TypeTokenSort.LeftRoundBracket,
                                   TypeTokenSort.LeftSquareBracket]);

    const firstArgumentFirstToken = typeString.tokenAt(firstArgumentBeginOffset);
    // <prim> -> ...
    if(firstArgumentFirstToken.getSort() === TypeTokenSort.PrimitiveType)
    {
      //First Argument
      const primitiveTokenOffset = firstArgumentBeginOffset;
      TypeParser.appendPrimitiveArgumentNode(currentNode, primitiveTokenOffset);

      //Composition Operator
      const compositionOperatorOffset = firstArgumentBeginOffset + 1;
      TypeParser.checkExpectedToken(typeString, compositionOperatorOffset, [TypeTokenSort.CompositionOperator]);
      currentNode.setMainOperator(TypeParsingTreeNodeMainOperator.Composition);

      //Second Argument
      const secondArgumentBeginOffset = compositionOperatorOffset + 1;
      TypeParser.checkExpectedToken(typeString, 
                                    secondArgumentBeginOffset, 
                                    [TypeTokenSort.PrimitiveType, TypeTokenSort.LeftRoundBracket]);

      const secondArgumentFirstToken = typeString.tokenAt(secondArgumentBeginOffset);
      // <prim> -> <prim>
      if(secondArgumentFirstToken.getSort() === TypeTokenSort.PrimitiveType)
      {
        const secondArgumentEndOffset = secondArgumentBeginOffset;
        const primitiveTokenOffset = secondArgumentBeginOffset;
        TypeParser.appendPrimitiveArgumentNode(currentNode, primitiveTokenOffset);
        return secondArgumentEndOffset;
      }
      // <prim> -> (<comp>)
      else if(secondArgumentFirstToken.getSort() === TypeTokenSort.LeftRoundBracket)
      {
        const nestedCompositionBeginOffset = secondArgumentBeginOffset + 1;
        const nestedCompositionEndOffset = TypeParser.appendCompositeArgumentNode(typeString, passedIterator, nestedCompositionBeginOffset);

        const secondArgumentEndOffset = nestedCompositionEndOffset + 1;
        TypeParser.checkExpectedToken(typeString, secondArgumentEndOffset, [TypeTokenSort.RightRoundBracket]);
        return secondArgumentEndOffset;
      }
      // Logic Error
      else
      {
        throw new LogicErrorException("Control shouldn't be here!");
      }
      
    }
    // (<comp>) -> ...
    else if(firstArgumentFirstToken.getSort() === TypeTokenSort.LeftRoundBracket)
    {
      //First Argument
      const nestedCompositionBeginOffset = firstArgumentBeginOffset + 1;
      const nestedCompositionEndOffset = TypeParser.appendCompositeArgumentNode(typeString, passedIterator, nestedCompositionBeginOffset);

      const firstArgumentEndOffset = nestedCompositionEndOffset + 1;
      TypeParser.checkExpectedToken(typeString, firstArgumentEndOffset, [TypeTokenSort.RightRoundBracket]);

      //Composition Operator
      const compositionOperatorOffset = firstArgumentEndOffset + 1;
      TypeParser.checkExpectedToken(typeString, compositionOperatorOffset, [TypeTokenSort.CompositionOperator]);
      currentNode.setMainOperator(TypeParsingTreeNodeMainOperator.Composition);

      //Second Argument
      const secondArgumentBeginOffset = compositionOperatorOffset + 1;
      TypeParser.checkExpectedToken(typeString, 
                                    secondArgumentBeginOffset, 
                                    [
                                      TypeTokenSort.PrimitiveType,
                                      TypeTokenSort.LeftRoundBracket  
                                    ]);

      const secondArgumentFirstToken = typeString.tokenAt(secondArgumentBeginOffset);
      // (<comp>) -> <prim>
      if(secondArgumentFirstToken.getSort() === TypeTokenSort.PrimitiveType)
      {
        const secondArgumentEndOffset = secondArgumentBeginOffset;
        const primitiveTokenOffset = secondArgumentBeginOffset;
        TypeParser.appendPrimitiveArgumentNode(currentNode, primitiveTokenOffset);
        return secondArgumentEndOffset;
      }
      // (<comp>) -> (<comp>)
      else if(secondArgumentFirstToken.getSort() === TypeTokenSort.LeftRoundBracket)
      {
        const nestedCompositionBeginOffset = secondArgumentBeginOffset + 1;
        const nestedCompositionEndOffset = TypeParser.appendCompositeArgumentNode(typeString, passedIterator, nestedCompositionBeginOffset);

        const secondArgumentEndOffset = nestedCompositionEndOffset + 1;
        TypeParser.checkExpectedToken(typeString, secondArgumentEndOffset, [TypeTokenSort.RightRoundBracket]);
        return secondArgumentEndOffset;
      }
      // Logic Error
      else
      {
        throw new LogicErrorException("Control shouldn't be here!");
      }
    }
    // <prod> -> ...
    else if(firstArgumentFirstToken.getSort() === TypeTokenSort.LeftSquareBracket)
    {
      //First Argument
      currentNode.appendChild(firstArgumentBeginOffset);

      const leftSquareBracketOffset = firstArgumentBeginOffset;
      const firstArgumentChildIndex = 0;
      const iteratorAtChild = passedIterator.clone().goToChild(firstArgumentChildIndex); 
      const firstArgumentEndOffset = TypeParser.parseProductType(typeString, iteratorAtChild, leftSquareBracketOffset);
      const appendedArgumentChildNodeIndex = currentNode.getChildren().length - 1;
      const appendedNode = currentNode.getNthChild(appendedArgumentChildNodeIndex);
      appendedNode.setSubstringEndOffset(firstArgumentEndOffset);

      //Composition Operator
      const compositionOperatorOffset = firstArgumentEndOffset + 1;
      TypeParser.checkExpectedToken(typeString, compositionOperatorOffset, [TypeTokenSort.CompositionOperator]);
      currentNode.setMainOperator(TypeParsingTreeNodeMainOperator.Composition);

      //Second Argument
      const secondArgumentBeginOffset = compositionOperatorOffset + 1;
      TypeParser.checkExpectedToken(typeString, secondArgumentBeginOffset, [TypeTokenSort.PrimitiveType, TypeTokenSort.LeftRoundBracket]);

      const secondArgumentFirstToken = typeString.tokenAt(secondArgumentBeginOffset);
      // <prod> -> <prim>
      if(secondArgumentFirstToken.getSort() === TypeTokenSort.PrimitiveType)
      {
        const secondArgumentEndOffset = secondArgumentBeginOffset;
        const primitiveTokenOffset = secondArgumentBeginOffset;
        TypeParser.appendPrimitiveArgumentNode(currentNode, primitiveTokenOffset);
        return secondArgumentEndOffset;
      }
      // <prod> -> (<comp>)
      else if(secondArgumentFirstToken.getSort() === TypeTokenSort.LeftRoundBracket)
      {
        const nestedCompositionBeginOffset = secondArgumentBeginOffset + 1;
        const nestedCompositionEndOffset = TypeParser.appendCompositeArgumentNode(typeString, passedIterator, nestedCompositionBeginOffset);

        const secondArgumentEndOffset = nestedCompositionEndOffset + 1;
        return secondArgumentEndOffset;
      }
      // Logic Error
      else
      {
        throw new LogicErrorException("Control shouldn't be here!");
      }
    }
    // Logic Error
    else
    {
      throw new LogicErrorException("Control shouldn't be here!");
    }
  }
  /**
   * Tries to parse a substring whose main operator is the product operator.
   * 
   * Syntax goes as follows (in PEG):
   * 
   * <prod> ::= [ <expr>, <expr> (, <expr>+)]
   * 
   * @param typeString 
   * @param passedIterator 
   * @param leftSquareBracketOffset 
   * @returns Right square bracket offset
   */
  private static parseProductType(typeString : TypeTokenString,
                                  passedIterator : TypeParseTreeIterator,
                                  leftSquareBracketOffset : number) : number
  {
    const currentNode = passedIterator.node();
    TypeParser.checkExpectedToken(typeString, leftSquareBracketOffset, [TypeTokenSort.LeftSquareBracket]);

    let currentArgumentBeginOffset = leftSquareBracketOffset + 1;
    TypeParser.checkExpectedToken(typeString, currentArgumentBeginOffset, [TypeTokenSort.PrimitiveType, TypeTokenSort.LeftRoundBracket, TypeTokenSort.LeftSquareBracket]);
    let currentArgumentEndOffset;
    let argumentCount = 0; //TODO Check number of arguments
    while(true)
    {
      if(TypeParser.productTypeArgumentIsPrimitiveType(typeString, currentArgumentBeginOffset))
      {
        const primitiveTokenOffset = currentArgumentBeginOffset;
        TypeParser.appendPrimitiveArgumentNode(currentNode, primitiveTokenOffset);
        currentArgumentEndOffset = primitiveTokenOffset;
        argumentCount++;
      }
      else
      {
        currentArgumentEndOffset = TypeParser.appendCompositeArgumentNode(typeString, passedIterator, currentArgumentBeginOffset);
        argumentCount++;
      }

      const currentArgumentBoundaryOffset = currentArgumentEndOffset + 1;
      TypeParser.checkExpectedToken(typeString, currentArgumentBoundaryOffset, [TypeTokenSort.Comma,
                                                                                TypeTokenSort.RightSquareBracket]);
      const currentArgumentBoundaryToken = typeString.tokenAt(currentArgumentBoundaryOffset);
      if(currentArgumentBoundaryToken.getSort() === TypeTokenSort.RightSquareBracket)
      {
        break;
      }

      const nextArgumentBeginOffset = currentArgumentBoundaryOffset + 1;
      currentArgumentBeginOffset = nextArgumentBeginOffset;
      TypeParser.checkExpectedToken(typeString, currentArgumentBeginOffset, [TypeTokenSort.PrimitiveType, TypeTokenSort.LeftRoundBracket, TypeTokenSort.LeftSquareBracket]);
    }

    const rightSquareBracketOffset = currentArgumentEndOffset + 1;
    if(argumentCount === 1)
    {
      throw new ParsingException("Product types expect at least 2 arguments!", leftSquareBracketOffset, rightSquareBracketOffset, typeString);
    }
    
    currentNode.setMainOperator(TypeParsingTreeNodeMainOperator
      .Product);
    return rightSquareBracketOffset;
  }
  /**
   * Checks whether a given substring corresponds to a primitive type within a
   * product type operator.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns whether a given substring corresponds to a primitive type within 
   * a product type operator.
   * 
   * @param typeString 
   * @param currentArgumentBeginOffset 
   */
  private static productTypeArgumentIsPrimitiveType(typeString : TypeTokenString,
                                                    currentArgumentBeginOffset : number) : boolean
  {
    const currentArgumentFirstToken = typeString.tokenAt(currentArgumentBeginOffset);
    const afterCurrentArgumentFirstTokenOffset = currentArgumentBeginOffset + 1;
    const thereIsNoAfterCurrentArgumentFirstToken = afterCurrentArgumentFirstTokenOffset === typeString.size();
    if(thereIsNoAfterCurrentArgumentFirstToken)
    {
      return false;
    }

    const afterCurrentArgumentFirstToken = typeString.tokenAt(afterCurrentArgumentFirstTokenOffset);
    return currentArgumentFirstToken.getSort() === TypeTokenSort.PrimitiveType &&
           (afterCurrentArgumentFirstToken.getSort() === TypeTokenSort.Comma ||
           afterCurrentArgumentFirstToken.getSort() === TypeTokenSort.RightSquareBracket);
  }
  /**
   * 
   * @param iteratorAtParentNode 
   * @param primitiveTokenOffset 
   */
  private static appendPrimitiveArgumentNode(node : TypeParseTreeNode,
                                             primitiveTokenOffset : number) : void
  {
    node.appendChild(primitiveTokenOffset, primitiveTokenOffset);

    const lastChildIndex = node.getChildren().length - 1;
    const appendedNode = node.getNthChild(lastChildIndex);
    appendedNode.setMainOperator(TypeParsingTreeNodeMainOperator.Primitive);
  }
  /**
   * 
   * @param typeString 
   * @param iteratorAtCurrentNode 
   * @param compositionBeginOffset 
   */
  private static appendCompositeArgumentNode(typeString : TypeTokenString, 
                                             iteratorAtCurrentNode : TypeParseTreeIterator,
                                             compositionBeginOffset : number) : number
  {
    const currentNode = iteratorAtCurrentNode.node();
    currentNode.appendChild(compositionBeginOffset);

    const appendedArgumentChildNodeIndex = currentNode.getChildren().length - 1;
    const iteratorAtChild = iteratorAtCurrentNode.clone().goToChild(appendedArgumentChildNodeIndex);
    const compositionEndOffset = TypeParser.parseCompositeType(typeString, iteratorAtChild, compositionBeginOffset);

    iteratorAtChild.node().setSubstringEndOffset(compositionEndOffset);
    
    return compositionEndOffset;
  }
  /**
   * 
   * @param typeString 
   * @param actualTokenOffset 
   * @param expectedTokenSortArray 
   */
  private static checkExpectedToken(typeString : TypeTokenString,
                                    actualTokenOffset : number,
                                    expectedTokenSortArray : Array<TypeTokenSort>) : void
  {
    const expectedTokenSortSet = new Set(expectedTokenSortArray);
    const errorSubMessage = TypeParser.craftExpectedTokensSubMessage(expectedTokenSortArray);
    if(actualTokenOffset >= typeString.size())
    {
      throw new ParsingException(`Premature end of string ${errorSubMessage}`, 0, typeString.size() - 1, typeString);
    }

    const actualToken = typeString.tokenAt(actualTokenOffset);
    if(!expectedTokenSortSet.has(actualToken.getSort()))
    {
      throw new ParsingException(`Found a "${actualToken.toString()}" ${errorSubMessage}`, actualTokenOffset, actualTokenOffset, typeString);
    }
  }
  /**
   * 
   * @param expectedTokenSortArray 
   */
  private static craftExpectedTokensSubMessage(expectedTokenSortArray : Array<TypeTokenSort>) : string
  {
    const convertTokenSortToToken = (sort : TypeTokenSort) : string =>
    {
      if(sort === TypeTokenSort.Comma)
      {
        return `","`;
      }
      else if(sort === TypeTokenSort.CompositionOperator)
      {
        return `"->"`;
      }
      else if(sort === TypeTokenSort.LeftRoundBracket)
      {
        return `"("`;
      }
      else if(sort === TypeTokenSort.LeftSquareBracket)
      {
        return `"["`;
      }
      else if(sort === TypeTokenSort.PrimitiveType)
      {
        return `primitive type`;
      }
      else if(sort === TypeTokenSort.RightRoundBracket)
      {
        return `")"`;
      }
      else if(sort === TypeTokenSort.RightSquareBracket)
      {
        return `"]"`;
      }
      else
      {
        throw new LogicErrorException("Control shoudln't have reached here!");
      }
    };

    if(expectedTokenSortArray.length === 1)
    {
      return `where a ${convertTokenSortToToken(expectedTokenSortArray[0])} was expected!`;
    }
    else
    {
      let string = "where a ";
      for(let index = 0; index < expectedTokenSortArray.length - 1; index++)
      {
        string += `${convertTokenSortToToken(expectedTokenSortArray[index])}, `;
      }
      string += `or a ${convertTokenSortToToken(expectedTokenSortArray[expectedTokenSortArray.length - 1])} was expected!`;
      return string;
    }
  }
}