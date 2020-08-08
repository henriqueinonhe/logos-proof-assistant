import { FunctionalSymbolsAndOperatorsTable } from "../../src/Parsing/FunctionalSymbolsAndOperatorsTable";
import { OperatorRecord, OperatorAssociativity } from "../../src/Parsing/OperatorRecord";

describe("constructor", () =>
{
  describe("Post Conditions", () =>
  {

  });
});

describe("addFunctionalSymbol()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Symbol must not already be registered as an operator", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      table["operatorsRecordsTable"].set("f", new OperatorRecord(1, 0, 0, OperatorAssociativity.Left));
      expect(() => table.addFunctionalSymbol("f")).toThrow("already registered as an operator!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Adds symbol to functional symbols set", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      table.addFunctionalSymbol("f");
      expect(table["functionalSymbolsSet"].has("f")).toBe(true);
    });
  });
});

describe("removeFunctionalSymbol()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Symbol must be registered as a functional symbol", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      expect(() => table.removeFunctionalSymbol("f")).toThrow("is not registered as a functional symbol!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Removes symbol properly", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      table.addFunctionalSymbol("f");
      table.removeFunctionalSymbol("f");
      expect(table["functionalSymbolsSet"].has("f")).toBe(false);
    });
  });
});

describe("addOperatorSymbol()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Token must not be already registered as a functional symbol", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      table.addFunctionalSymbol("f");
      expect(() => table.addOperatorSymbol("f", 1, 0, 0, OperatorAssociativity.Left)).toThrow("already registered as a functional symbol!");
    });

    test("Token must not be already registered as an operator", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      table.addOperatorSymbol("f", 1, 0, 0, OperatorAssociativity.Left);
      expect(() => table.addOperatorSymbol("f", 1, 0, 0, OperatorAssociativity.Left)).toThrow("already registered as an operator!");
    });

    test("Associativity conflict", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      table.addOperatorSymbol("f", 1, 0, 0, OperatorAssociativity.Left);
      expect(() => table.addOperatorSymbol("-", 2, 1, 0, OperatorAssociativity.Right)).toThrow("different associativity!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Actually registers token as operator", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      table.addOperatorSymbol("+", 2, 1, 10, OperatorAssociativity.Left);
      const record = table["operatorsRecordsTable"].get("+");
      expect(record?.arity).toBe(2);
      expect(record?.operatorPosition).toBe(1);
      expect(record?.precedence).toBe(10);
      expect(record?.associativity).toBe(OperatorAssociativity.Left);
    });
  });
});

describe("removeOperatorSymbol()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Token must actually be registered as an operator", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      expect(() => table.removeOperatorSymbol("f")).toThrow("is not registered as an operator!");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Operator is unregistered successfully", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      table.addOperatorSymbol("+", 2, 1, 0, OperatorAssociativity.Left);
      table.removeOperatorSymbol("+");
      expect(table["operatorsRecordsTable"].has("+")).toBe(false);
    });
  });
});

describe("tokenIsFunctionalSymbol()", () =>
{
  describe("Post Conditions", () =>
  {
    test("", () =>
    {
      const table = new FunctionalSymbolsAndOperatorsTable();
      table.addFunctionalSymbol("Foo");
      expect(table.tokenIsFunctionalSymbol("Foo")).toBe(true);
    });
  });
});

describe("getOperatorRecord()", () =>
{
  describe("Post Conditions", () =>
  {
    const table = new FunctionalSymbolsAndOperatorsTable();
    test("Undefined", () =>
    {
      expect(table.getOperatorRecord("+")).toBe(undefined);
    });

    test("Operator present", () =>
    {
      table.addOperatorSymbol("+", 2, 1, 0, OperatorAssociativity.Left);
      expect(table.getOperatorRecord("+")).toStrictEqual(new OperatorRecord(2, 1, 0, OperatorAssociativity.Left));
    });
  });
});