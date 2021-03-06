import { OperatorRecord, OperatorAssociativity } from "../../src/Parsing/OperatorRecord";

describe("constructor", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Arity must be a non null positive integer", () =>
    {
      expect(() => new OperatorRecord(0, 0, 2, OperatorAssociativity.Left)).toThrow(">= 0");
      expect(() => new OperatorRecord(1.3, 0, 2, OperatorAssociativity.Left)).toThrow(">= 0");
      expect(() => new OperatorRecord(-2, 0, 2, OperatorAssociativity.Left)).toThrow(">= 0");
    });

    test("Operator position must be a positive integer", () =>
    {
      expect(() => new OperatorRecord(1, 4.5, 3, OperatorAssociativity.Left)).toThrow("positive integer");
      expect(() => new OperatorRecord(1, -1, 3, OperatorAssociativity.Left)).toThrow("positive integer");
    });

    test("Precedence must be a positive integer", () =>
    {
      expect(() => new OperatorRecord(2, 0, 1.2, OperatorAssociativity.Left)).toThrow("a positive integer");
      expect(() => new OperatorRecord(2, 0, -999, OperatorAssociativity.Right)).toThrow("a positive integer");
    });

    test("Operator precedence must not be greater than arity", () =>
    {
      expect(() => new OperatorRecord(2, 3, 10, OperatorAssociativity.Right)).toThrow("cannot be greater");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Arity, operator position, precedence and associativity are initialized to input values", () =>
    {
      const record = new OperatorRecord(2, 1, 10, OperatorAssociativity.Left);
      expect(record.arity).toBe(2);
      expect(record.operatorPosition).toBe(1);
      expect(record.precedence).toBe(10);
      expect(record.associativity).toBe(OperatorAssociativity.Left);
    });
  });
});