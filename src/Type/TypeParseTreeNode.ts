import { TypeTokenString } from "./TypeTokenString";
import { TypeParseTree } from "./TypeParseTree";
import { LogicErrorException, Utils, InvalidArgumentException } from "../Utils/LogosUtils";

export enum TypeParsingTreeNodeMainOperator
{
  Primitive = "Primitive",
  Composition = "Composition",
  Product = "Product"
}

/**
 * Represents a node in the [[TypeParsingTree]].
 * 
 * Each node instead of holding non terminals/terminals, 
 * actually holds both the begin and end offset of the substring
 * it refers to.
 * 
 * Class Invariants:
 * - Its begin and end offsets always refer to valid indexes of
 * the tree's [[TypeTokenString]].
 */
export class TypeParseTreeNode
{
  /**
   * Validates root string offsets, for they should
   * be integers, not cross and also be within root string
   * boundaries.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Must throw if any of the offsets are not positive integers.
   * - Must throw if any of the offsets are out of bounds.
   * - Must throw if substringBeginOffset is greater than substringEndOffset
   * 
   * @param substringBeginOffset 
   * @param substringEndOffset 
   * @param substringLength 
   */
  private static validateRootStringOffsets(substringBeginOffset : number,
                                           substringEndOffset : number | undefined,
                                           substringLength : number) : void
  {
    Utils.validateIndex(substringBeginOffset, "substringBeginOffset");
    
    if(substringEndOffset !== undefined)
    {
      Utils.validateIndex(substringEndOffset, "substringEndOffset");
      
      if(substringBeginOffset > substringEndOffset)
      {
        throw new LogicErrorException(`substringBeginOffset is expected to be <= substringEndOffset but ${substringBeginOffset} and ${substringEndOffset} were passed instead.`);
      }

      if(substringEndOffset >= substringLength)
      {
        throw new LogicErrorException(`substringEndOffset is expected to be < tokenList length (${substringLength}), but ${substringEndOffset} was passed instead.`);
      }
    }
  }

  /**
   * Constructs a [[TypeParseTreeNode]].
   * 
   * Pre Conditions:
   * - Substring offsets must be valid within the tree's [[TypeTokenString]] 
   * context.
   * 
   * Post Conditions:
   * - Node's tree must be set to the input tree.
   * - Node's parent must be set to the input parent.
   * - Substring offsets must be set properly to the input offsets.
   * - Node's children must be initialized to an empty array.
   * - Node's main operator must be initialized to undefined.
   * 
   * @param tree 
   * @param parent 
   * @param substringBeginOffset 
   * @param substringEndOffset 
   */
  constructor(tree : TypeParseTree,
              parent : TypeParseTreeNode | null,
              substringBeginOffset : number,
              substringEndOffset ?: number)
  {
    TypeParseTreeNode.validateRootStringOffsets(substringBeginOffset,
                                                substringEndOffset,
                                                tree.getTypeString().size());

    this.tree = tree;
    this.parent = parent;
    this.children = [];
    this.substringBeginOffset = substringBeginOffset;
    this.substringEndOffset = substringEndOffset;
    this.mainOperator = undefined;
  }
  /**
   * Returns the [[TypeParsingTree]] this node belongs to.
   * Const.
   * 
   * Pre Conditions: 
   * None
   * 
   * Post Conditions:
   * - Returns the tree this node belongs to.
   */
  public getTree() : TypeParseTree
  {
    return this.tree;
  }
  /**
   * Returns this node's parent node.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns this node's parent node.
   */
  public getParent() : TypeParseTreeNode | null
  {
    return this.parent;
  }
  /**
   * Returns this node's children nodes.
   * Non-const.
   * 
   * Post Conditions:
   * - Returns this node's children nodes array.
   */
  public getChildren() : Array<TypeParseTreeNode>
  {
    return this.children;
  }
  /**
   * Returns nth child.
   * Const.
   * 
   * This method should be preferred to calling 
   * [[getChildren()]] and manually extracting child using
   * an index, because this method performs index validation.
   * 
   * Pre Conditions:
   * - `index` must be within bounds of the node's children array.
   * 
   * Post Condition:
   * - Returns the child node associated with the input index.
   */
  public getNthChild(index : number) : TypeParseTreeNode
  {
    Utils.validateIndex(index, "index", this.children.length, "children");
    return this.children[index];
  }
  /**
   * Returns the offset relative to the root's [[TypeTokenString]]
   * where this node's substring begins.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns this node's substringBeginOffset.
   */
  public getSubstringBeginOffset() : number
  {
    return this.substringBeginOffset;
  }
  /**
   * Returns the offset relative to the root's [[TypeTokenString]]
   * where this node's substring ends.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns this node's substringEndOffset.
   * 
   */
  public getSubstringEndOffset() : number | undefined
  {
    return this.substringEndOffset;
  }
  /**
   * Returns this node's [[TypeTokenString]] substring main operator.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns this node's main operator.
   */
  public getMainOperator() : TypeParsingTreeNodeMainOperator | undefined
  {
    return this.mainOperator;
  }
  /**
   * Returns this node's [[TypeTokenString]] substring.
   * Const.
   * 
   * Pre Conditions:
   * - substringEndOffset must not be undefined.
   * 
   * Post Conditions:
   * - Returns this node's [[TypeTokenString]] substring.
   * 
   */
  public getTypeString() : TypeTokenString
  {
    if(this.substringEndOffset === undefined)
    {
      throw new InvalidArgumentException("Cannot retrieve this node's typestring as the substring end offset is undefined!");
    }
    const nonInclusiveEndOffsetCompensation = 1;
    return this.tree.getTypeString().slice(this.substringBeginOffset, 
                                           this.substringEndOffset + nonInclusiveEndOffsetCompensation);
  }
  /**
   * Checks whether this node is the root,
   * and therefore its parent is null.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns a boolean repreenting whether this node is the root node in the
   * tree.
   */
  public isRoot() : boolean
  {
    return this.parent === null;
  }
  /**
   * Appends a new child node and returns this.
   * Non-const.
   * 
   * Pre Conditions:
   * - Substring offsets must be within bounds of the tree's [[TypeTokenString]].
   * 
   * Post Conditions:
   * - Appends a new child node with the input offsets.
   * - Returns this.
   */
  public appendChild(substringBeginOffset : number, substringEndOffset ?: number) : TypeParseTreeNode
  {
    this.children.push(new TypeParseTreeNode(this.tree, this, substringBeginOffset, substringEndOffset));
    return this;
  }
  /**
   * Sets node's main operator.
   * Non-const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Sets main opertor.
   * 
   * @param mainOperator 
   */
  public setMainOperator(mainOperator : TypeParsingTreeNodeMainOperator) : void
  {
    this.mainOperator = mainOperator;
  }
  /**
   * Sets node's substring end offset.
   * Non-const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Sets substring end offset.
   * 
   * @param substringEndOffset 
   */
  public setSubstringEndOffset(substringEndOffset : number) : void
  {
    this.substringEndOffset = substringEndOffset;
  }
  private reducedNodeObject() : ReducedTypeParseTreeNode
  {
    // function mainOperatorToString(mainOperator : TypeParsingTreeNodeMainOperator | undefined) : string
    // {
    //   if(mainOperator === TypeParsingTreeNodeMainOperator.Primitive)
    //   {
    //     return "Primitive";
    //   }
    //   else if(mainOperator === TypeParsingTreeNodeMainOperator.Composition)
    //   {
    //     return "Composition";
    //   }
    //   else if(mainOperator === TypeParsingTreeNodeMainOperator.Product)
    //   {
    //     return "Product";
    //   }
    //   else 
    //   {
    //     return "undefined";
    //   }
    // }

    const children = [];
    for(const child of this.children)
    {
      children.push(child.reducedNodeObject());
    }

    return {
      typeString: this.getTypeString().toString(),
      mainOperator: this.getMainOperator()!.toString(),
      substringBeginOffset: this.substringBeginOffset,
      substringEndOffset: this.substringEndOffset,
      children
    };

  }
  /**
   * Sets substring begin offset.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Sets substring begin offset.
   * 
   * @param substringBeginOffset 
   */
  public setSubstringBeginOffset(substringBeginOffset : number) : void
  {
    this.substringBeginOffset = substringBeginOffset;
  }
  /**
   * The [[TypeParsingTree]] that this node belongs to.
   */
  private readonly tree : TypeParseTree;
  /**
   * The parent node.
   */
  private readonly parent : TypeParseTreeNode | null;
  /**
   * Children nodes.
   */
  private children : Array<TypeParseTreeNode>;
  /**
   * The index relative to the root's [[TypeTokenString]]
   * where this node's substring begins.
   */
  private substringBeginOffset : number;
  /**
   * The index relative to the root's [[TypeTokenString]]
   * where this node's substring ends.
   */
  private substringEndOffset : number | undefined;
  /**
   * This node's substring main operator.
   */
  private mainOperator : TypeParsingTreeNodeMainOperator | undefined;
}

interface ReducedTypeParseTreeNode
{
  typeString : string;
  mainOperator : string;
  substringBeginOffset : number;
  substringEndOffset : number | undefined;
  children : Array<ReducedTypeParseTreeNode>;
}