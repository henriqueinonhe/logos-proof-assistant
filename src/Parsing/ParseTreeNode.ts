import { LinkedList } from "../Utils/LinkedList";
import { TokenString } from "../Token/TokenString";
import { LogicErrorException } from "../Utils/LogosUtils";

export class ParseTreeNode
{
  constructor(inputTokenString : TokenString, substringBeginOffset ?: number, substringEndOffset ?: number)
  {
    this.inputTokenString = inputTokenString;
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
    for(const nodeList of this.children)
    {
      const nodeArray : Array<ReducedNodeObject> = [];
      for(const node of nodeList)
      {
        nodeArray.push(node.reducedNodeObject());
      }
      children.push(nodeArray);
    }

    let substring;
    try
    {
      substring = this.getCorrespondingInputSubstring().toString();
    }
    catch(error)
    {
      substring = undefined;
    }

    return {
      substring : substring,
      substringBeginOffset : this.substringBeginOffset,
      substringEndOffset : this.substringEndOffset,
      children
    };
  }

  public isSingleToken() : boolean
  {
    return this.children.length === 0;
  }

  public getInputTokenString() : TokenString
  {
    return this.inputTokenString;
  }

  private inputTokenString : TokenString;
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