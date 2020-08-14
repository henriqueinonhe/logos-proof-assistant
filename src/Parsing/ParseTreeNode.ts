import { LinkedList } from "../Utils/LinkedList";
import { TokenString } from "../Token/TokenString";
import { LogicErrorException } from "../Utils/LogosUtils";

export class ParseTreeNode
{
  constructor(inputTokenString : TokenString, /*parent : ParseTreeNode | null,*/ substringBeginOffset ?: number, substringEndOffset ?: number)
  {
    this.inputTokenString = inputTokenString;
    //this.parent = parent;
    this.children = [];
    this.substringBeginOffset = substringBeginOffset;
    this.substringEndOffset = substringEndOffset;
  }

  public getCorrespondingInputSubstring() : TokenString
  {
    if(this.substringBeginOffset === undefined)
    {
      throw new LogicErrorException("Substring begin offset is undefined!");
    }

    if(this.substringEndOffset === undefined)
    {
      throw new LogicErrorException("Substring end offset is undefined!");
    }

    const exclusiveEndOffset = this.substringEndOffset + 1;
    return this.inputTokenString.slice(this.substringBeginOffset, exclusiveEndOffset);
  }

  private reducedNodeObject() : ReducedNodeObject
  {
    const children : Array<Array<ReducedNodeObject>> = [];
    for(const child of this.children)
    {
      const nodeArray : Array<ReducedNodeObject> = [];
      for(const node of child)
      {
        nodeArray.push(node.reducedNodeObject());
      }
      children.push(nodeArray);
    }

    return {
      substring : this.getCorrespondingInputSubstring().toString(),
      substringBeginOffset : this.substringBeginOffset,
      substringEndOffset : this.substringEndOffset,
      children
    };
  }

  private inputTokenString : TokenString;
  //public parent : ParseTreeNode | null;
  public children : Array<LinkedList<ParseTreeNode>>;
  public substringBeginOffset : number | undefined;
  public substringEndOffset : number | undefined;
}

interface ReducedNodeObject
{
  substring : string | undefined;
  substringBeginOffset : number | undefined;
  substringEndOffset : number | undefined;
  children : Array<Array<ReducedNodeObject>>;
}