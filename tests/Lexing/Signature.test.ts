import { Signature } from "../../src/Lexing/Signature";
import { PunctuationTokenRecord } from "../../src/Lexing/PunctuationTokenRecord";
import { TypedTokenRecord } from "../../src/Lexing/TypedTokenRecord";
import { Type } from "../../src/Type/Type";

describe("addRecord()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Token already associated with a record", () =>
    {
      const signature = new Signature();
      signature["tokenRecords"].set("<Whitespace>", new PunctuationTokenRecord());

      expect(() => signature.addRecord("<Whitespace>", new PunctuationTokenRecord())).toThrow("record associated");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Adds token record properly", () =>
    {
      const signature = new Signature();
      signature.addRecord("R", new TypedTokenRecord(new Type("[i,i]->o")));
      expect((signature["tokenRecords"].get("R") as TypedTokenRecord).getType().toString()).toBe("[i,i]->o");
    });
  });
});

describe("removeRecord()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("No record associated with token", () =>
    {
      const signature = new Signature();
      expect(() => signature.removeRecord("A")).toThrow("There is no record");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Record is removed properly", () =>
    {
      const signature = new Signature();
      signature.addRecord("Dobs", new PunctuationTokenRecord());
      signature.removeRecord("Dobs");
      expect(signature["tokenRecords"].get("Dobs")).toBe(undefined);
    });
  });
});

describe("getRecord()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("No record associated with token", () =>
    {
      const signature = new Signature();
      expect(() => signature.getRecord("+")).toThrow("There is no record associated");
    });
  });

  describe("Post Conditions", () =>
  {
    const signature = new Signature();
    signature.addRecord("+", new TypedTokenRecord(new Type("[i,i]->o")));
    expect(signature.getRecord("+").sort()).toBe("TypedToken");
  });
});