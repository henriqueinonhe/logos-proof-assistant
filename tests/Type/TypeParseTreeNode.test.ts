import { TypeParseTreeNode } from "../../src/Type/TypeParseTreeNode";
import { TypeParseTree } from "../../src/Type/TypeParseTree";

describe("constructor", () =>
{
  describe("Pre Conditions", () =>
  {
    const dummyTree = new TypeParseTree("[i,o,o]->o->o");

    test("substringBeginOffset must be an integer", () =>
    {
      expect(() => {new TypeParseTreeNode(dummyTree, null, 7.1, 9);})
        .toThrow(/substringBeginOffset is expected to be an integer/);
    });
  
    test("substringEndOffset must be an integer", () => 
    {
      expect(() => {new TypeParseTreeNode(dummyTree, null, 2, 9.8);})
        .toThrow(/substringEndOffset is expected to be an integer/);
    });
    
    test("substringBeginOffset must be >= 0", () =>
    {
      expect(() => {new TypeParseTreeNode(dummyTree, null, -1, 2);})
        .toThrow(/substringBeginOffset is expected to be a positive number/);
    });
  
    test("substringEndOffset must be >= 0", () =>
    {
      expect(() => {new TypeParseTreeNode(dummyTree, null, 1, -2);})
        .toThrow(/substringEndOffset is expected to be a positive number/);
    });
  
    test("substringEndOffset must be <= tokenString.length", () =>
    {
      expect(() => {new TypeParseTreeNode(dummyTree, null, 2, 232);})
        .toThrow(/substringEndOffset is expected to be < tokenList/);
    });
  
    test("substringBeginOffset and substringEndOffset must not cross", () =>
    {
      expect(() => {new TypeParseTreeNode(dummyTree, null, 7, 5);})
        .toThrow(/substringBeginOffset is expected to be <= substringEndOffset/);
    });
  });

  describe("Post Conditions", () =>
  {
    const dummyTree = new TypeParseTree("[i,o,o]->o->o");

    test("Tree is set properly", () =>
    {
      expect(new TypeParseTreeNode(dummyTree, null, 0, 0).getTree())
        .toBe(dummyTree);
    });

    test("Parent is set properly", () =>
    {
      const parentNode = new TypeParseTreeNode(dummyTree, null, 0, 0);
      expect(new TypeParseTreeNode(dummyTree, parentNode, 0, 0).getParent())
        .toBe(parentNode);
    });
    
    test("Substring offsets are set properly", () =>
    {
      const dummyNode = new TypeParseTreeNode(dummyTree, null, 2, 5);
      expect(dummyNode.getSubstringBeginOffset()).toBe(2);
      expect(dummyNode.getSubstringEndOffset()).toBe(5);
    });

    test("Children is initialized to empty array", () =>
    {
      expect(new TypeParseTreeNode(dummyTree, null, 2, 7).getChildren())
        .toStrictEqual([]);
    });

    test("Main operator is initialized to undefined", () =>
    {
      expect(new TypeParseTreeNode(dummyTree, null, 2, 7).getMainOperator())
        .toBe(undefined);
    });
  });
});

describe("getTypeString()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("substringEndOffset cannot be undefined", () =>
    {
      const dummyTree = new TypeParseTree("[i,o,o]->o->Duba");

      expect(() => new TypeParseTreeNode(dummyTree, null, 0).getTypeString()).toThrow("Cannot retrieve this node's typestring as the substring end offset is undefined!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("", () =>
    {
      const dummyTree = new TypeParseTree("[i,o,o]->o->Duba");

      expect(new TypeParseTreeNode(dummyTree, null, 0, 6).getTypeString().toString()).toBe("[i,o,o]");
      expect(new TypeParseTreeNode(dummyTree, null, 7, 7).getTypeString().toString()).toBe("->");
      expect(new TypeParseTreeNode(dummyTree, null, 9, 10).getTypeString().toString()).toBe("->Duba");
    });
  });
});

describe("isRoot()", () =>
{
  describe("Post Conditions", () =>
  {
    const dummyTree = new TypeParseTree("[i,o,o]->o->Duba");

    expect(new TypeParseTreeNode(dummyTree, null, 0, 1).isRoot()).toBe(true);
  });
});

describe("appendChild()", () =>
{
  describe("Post Conditions", () =>
  {
    test("", () =>
    {
      const dummyTree = new TypeParseTree("[i,o,o]->o->Duba");
      const root = dummyTree.getRoot();
  
      root.appendChild(0, 3);
      expect(root.getNthChild(0).getTypeString().toString()).toBe("[i,o");
  
      root.appendChild(1, 3);
      expect(root.getNthChild(1).getTypeString().toString()).toBe("i,o");
  
      const secondChild = root.getNthChild(1);
      
      secondChild.appendChild(3, 6);
      expect(secondChild.getNthChild(0).getTypeString().toString()).toBe("o,o]");
    });
  });
});

describe("getNthChild()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Index must be valid", () =>
    {
      const dummyTree = new TypeParseTree("(i->i)->i");
      const root = dummyTree.getRoot();
      root.appendChild(0, 2);
      root.appendChild(2, 4);

      expect(() => root.getNthChild(2)).toThrow("There is no element");
    });
  });
});