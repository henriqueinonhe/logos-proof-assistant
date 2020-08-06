import { TypeParseTree } from "../../src/Type/TypeParseTree";
import { TypeParseTreeIterator } from "../../src/Type/TypeParseTreeIterator";

describe("constructor", () =>
{
  describe("Post Conditions", () =>
  {
    const dummyTree = new TypeParseTree("([i,i]->o)->o");
    const iterator = new TypeParseTreeIterator(dummyTree);

    test("Tree is initialized properly", () =>
    {
      expect(iterator.getTree()).toBe(dummyTree);
    });

    test("Current node is initialized properly", () =>
    {
      expect(iterator.node()).toBe(dummyTree.getRoot());
    });
  });
});

describe("goToRoot(), goToParent(), goToChild()", () =>
{
  //These methods cannot be tested separately, nor can
  //their pre and post conditions.
  test("", () =>
  {
    const dummyTree = new TypeParseTree("[Individual, Individual] -> Individual");
    const iter = new TypeParseTreeIterator(dummyTree);
    expect(iter.goToRoot().node().isRoot()).toBe(true);

    expect(() => {iter.goToParent();}).toThrow(/Iterator is already pointing at root!/);
    expect(() => {iter.goToChild(0);}).toThrow(/There is no element/);
    expect(() => {iter.goToChild(1);}).toThrow(/There is no element/);

    iter.node().appendChild(0, 4);
    iter.node().appendChild(6, 6);
    
    iter.goToChild(0);
    expect(iter.node().isRoot()).toBe(false);
    expect(iter.node().getTypeString().toString()).toBe("[Individual,Individual]");
    
    iter.goToParent();
    expect(iter.node().isRoot()).toBe(true);

    iter.goToChild(1);
    expect(iter.node().getTypeString().toString()).toBe("Individual");

    iter.goToRoot();
    expect(iter.node().isRoot()).toBe(true);

    iter.goToChild(0);
    iter.node().appendChild(1, 1);
    iter.node().appendChild(3, 3);

    iter.goToChild(0);
    expect(iter.node().getTypeString().toString()).toBe("Individual");

    iter.goToParent();
    iter.goToChild(1);
    expect(iter.node().getTypeString().toString()).toBe("Individual");
  });
});

describe("clone()", () =>
{
  describe("Post Conditions", () =>
  {
    const dummyTree = new TypeParseTree("([i,i]->o)->o");
    dummyTree.getRoot().appendChild(2, 2);
    const original = new TypeParseTreeIterator(dummyTree);
    const copy = original.clone();
    copy.goToChild(0);

    test("Modifying copy doesn't alter original", () =>
    {
      expect(original.node().isRoot()).toBe(true);
    });

    test("Iterator is properly cloned", () =>
    {
      expect(copy.node().getSubstringBeginOffset()).toBe(2);
    });
  });
});