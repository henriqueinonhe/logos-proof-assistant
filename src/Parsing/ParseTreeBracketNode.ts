import { ParseTreeNode } from "./ParseTreeNode";
import { LinkedListIterator } from "../Utils/LinkedList";

export class ParseTreeBracketNode extends ParseTreeNode
{
  public matchingBracketNodeIterator : LinkedListIterator<ParseTreeBracketNode> | undefined;
}