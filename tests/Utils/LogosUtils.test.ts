import { Utils } from "../../src/Utils/LogosUtils";

describe("validateIndex()", () =>
{
  describe("Post Conditions", () =>
  {
    test("Pass", () =>
    {
      expect(() => {Utils.validateIndex(0, "foo");}).not.toThrow();
      expect(() => {Utils.validateIndex(1, "foo");}).not.toThrow();
      expect(() => {Utils.validateIndex(23123123, "foo");}).not.toThrow();
      expect(() => {Utils.validateIndex(2, "foo", 32);}).not.toThrow();
      expect(() => {Utils.validateIndex(0, "foo", 54);}).not.toThrow();
      expect(() => {Utils.validateIndex(123123, "foo", 4333332);}).not.toThrow();
    });

    test("Fail due to not being an integer", () =>
    {
      expect(() => {Utils.validateIndex(1232.6, "foo");}).toThrow(/foo is expected to be an integer/);
    });
  
    test("Fail due to not being a positive number", () =>
    {
      expect(() => {Utils.validateIndex(-232, "bar");}).toThrow(/bar is expected to be a positive number/);
    });
  
    test("Fail due to index being out of bounds", () =>
    {
      expect(() => {Utils.validateIndex(3, "index", 3, "array");}).toThrow(/associated with index 3 in array/);
    });
  });
});

describe("cloneArray()", () =>
{
  describe("Post Conditions", () =>
  {
    class DummyCloneable 
    {
      constructor(attribute : number)
      {
        this.attribute = attribute;
      }

      public clone() : DummyCloneable
      {
        return new DummyCloneable(this.attribute);
      }

      public attribute : number;
    }

    const seed = [1, 2, 3, 4, 5];
    const original = seed.map(val => new DummyCloneable(val));
    const clone = Utils.cloneArray(original);

    test("Array is deep copied", () =>
    {
      expect(clone.map(obj => obj.attribute)).toStrictEqual(seed);
    });

    test("Modifying clone doesn't affect original", () =>
    {
      clone.forEach(obj => obj.attribute = 10);
      expect(original.map(obj => obj.attribute)).toStrictEqual(seed);
    });
  });
});