import { TypeParseTree } from "./TypeParseTree";
import { TypeParseTreeNode } from "./TypeParseTreeNode";
import { LogicErrorException } from "../Utils/LogosUtils";

/**
 * Represents an iterator that is used
 * to traverse through nodes in a [[TypeParsingTree]].
 * 
 * Class Invariants:
 * The iterator always points to a node wihthin a tree.
 */
export class TypeParseTreeIterator
{
  /**
   * Constructs a TypeParseTreeIterator.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Sets iterator tree to input tree.
   * - Sets current node to input tree root node.
   * 
   * @param tree 
   */
  constructor(tree : TypeParseTree)
  {
    this.tree = tree;
    this.currentNode = tree.getRoot();
  }
  /**
   * Returns the node that the iterator currently
   * points to.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns current node.
   */
  public node() : TypeParseTreeNode
  {
    return this.currentNode;
  }
  /**
   * Moves iterator to the root node and returns the iterator.
   * Non-const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Sets current node to root node.
   */
  public goToRoot() : TypeParseTreeIterator
  {
    this.currentNode = this.tree.getRoot();
    return this;
  }
  /**
   * Moves iterator to the parent node and returns the iterator.
   * Non-const.
   * 
   * Pre Conditions:
   * - Current node must not be root (parentless).
   * 
   * Post Conditions:
   * - Sets current node to parent node.
   */
  public goToParent() : TypeParseTreeIterator
  {
    if(this.currentNode.isRoot())
    {
      throw new LogicErrorException("Iterator is already pointing at root! Parent is null!");
    }

    this.currentNode = this.currentNode.getParent()!; //Checking that it is not root guarantees that the paren't won't be null
    return this;
  }
  /**
   * Goes to nth zero index based child, if possible,
   * else throws exception.
   * Non-const.
   * 
   * Returns iterator.
   * 
   * Pre Conditions:
   * - Index must be associated with an existing child.
   * 
   * Post Conditions:
   * - Sets current node to its nth child.
   */
  public goToChild(index : number) : TypeParseTreeIterator
  {
    this.currentNode = this.currentNode.getNthChild(index);
    return this;
  }
  /**
   * Returns iterator's associated tree.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns iterator tree.
   */
  public getTree() : TypeParseTree
  {
    return this.tree;
  }
  /**
   * Deep copy.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns a deep copy of itself.
   */
  public clone() : TypeParseTreeIterator
  {
    const copy = new TypeParseTreeIterator(this.tree);
    copy.currentNode = this.currentNode;
    return copy;
  }
  /**
   * Associated [[TypeParsingTree]].
   */
  private readonly tree : TypeParseTree;
  /**
   * [[TypeParsingTreeNode]] that the iterator currently points to.
   */
  private currentNode : TypeParseTreeNode;
}