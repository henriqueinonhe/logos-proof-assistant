import { TypeParseTreeNode, TypeParsingTreeNodeMainOperator } from "./TypeParseTreeNode";
import { TypeTokenString } from "./TypeTokenString";
import { InvalidArgumentException } from "../Utils/LogosUtils";

/**
 * Represents a parse tree specialized to deal
 * with Types in the Logos framework.
 * 
 * This is a Abstract Syntax Tree and therefore there is no notion
 * of non terminals, so each node refer to a substring of the original input
 * string instead.
 * 
 * The tree holds the candidate string (that if well formed, represents a type)
 * and each of its nodes holds two indexes representing the beginning and the 
 * end of the substrings they refer to.
 * 
 * Class Invariants:
 * - The tree's [[TypeTokenString]] never changes after construction.
 */
export class TypeParseTree
{
  /**
   * Constructs a [[TypeParseTree]].
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - The tree's [[TypeTokenString]] must be set according to the input 
   * `string.
   * - The tree's root must be set and its range should encompass the entire
   * tree's [[TypeTokenString]].
   * 
   * @param typeString 
   */
  constructor(typeString : string)
  {
    
    this.typeString = new TypeTokenString(typeString);
    const typeStringIsEmpty = this.typeString.size() === 0;
    if(typeStringIsEmpty)
    {
      throw new InvalidArgumentException("Type string cannot be empty!");
    }

    const typeStringFirstOffset = 0;
    const typeStringLastOffset = this.typeString.size() - 1;
    this.root = new TypeParseTreeNode(this, null, typeStringFirstOffset, typeStringLastOffset);
  }
  /**
   * Gets associated [[TypeTokenString]].
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns tree's [[TypeTokenString]].
   */
  public getTypeString() : TypeTokenString
  {
    return this.typeString;
  }
  /**
   * Returns root [[TypeParsingTreeNode]].
   * Non-const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns root node.
   */
  public getRoot() : TypeParseTreeNode
  {
    return this.root;
  }
  /**
   * Deep copy.
   * Const.
   * 
   * Pre Conditions:
   * None
   * 
   * Post Conditions:
   * - Returns deep copy.
   * 
   */
  public clone() : TypeParseTree
  {
    //This is a fucking mess
    const cloneTree = new TypeParseTree(this.typeString.toString());
    const originalTreeNodesQueue = [this.root];
    const cloneTreeNodesQueue = [cloneTree.root];
    while(originalTreeNodesQueue.length !== 0)
    {
      const currentOriginalTreeNode = originalTreeNodesQueue[0];
      const currentCloneTreeNode = cloneTreeNodesQueue[0];

      //Copy Data
      currentCloneTreeNode.setMainOperator(currentOriginalTreeNode.getMainOperator() as TypeParsingTreeNodeMainOperator);

      //Handle Children
      for(const originalChild of currentOriginalTreeNode.getChildren())
      {
        currentCloneTreeNode.appendChild(originalChild.getSubstringBeginOffset(), originalChild.getSubstringEndOffset());
        originalTreeNodesQueue.push(originalChild);
      }

      for(const cloneChild of currentCloneTreeNode.getChildren())
      {
        cloneTreeNodesQueue.push(cloneChild);
      }

      //Shift
      originalTreeNodesQueue.shift();
      cloneTreeNodesQueue.shift();
    }
    return cloneTree;
  }
  private root : TypeParseTreeNode;
  private typeString : TypeTokenString;
}