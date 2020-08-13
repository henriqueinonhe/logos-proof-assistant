import { TypedTokenRecord } from "../../src/Lexing/TypedTokenRecord";
import { Type } from "../../src/Type/Type";
import { LogosSignature } from "../../src/Lexing/LogosSignature";
import { WhitespaceTokenRecord } from "../../src/Lexing/WhitespaceTokenRecord";

describe("constructor", () =>
{
  describe("Post Conditions", () =>
  {
    test("Punctuation tokens are added to the signature", () =>
    {
      const signature = new LogosSignature();
      expect(signature["tokenRecords"].has("(")).toBe(true);
      expect(signature["tokenRecords"].has(")")).toBe(true);
      expect(signature["tokenRecords"].has(" ")).toBe(true);
      expect(signature["tokenRecords"].has(",")).toBe(true);
    });
  });
});

describe("addRecord()", () =>
{
  describe("Pre Conditions", () =>
  {
    test("Token already associated with a record", () =>
    {
      const signature = new LogosSignature();
      signature["tokenRecords"].set("<Whitespace>", new WhitespaceTokenRecord());

      expect(() => signature.addRecord("<Whitespace>", new WhitespaceTokenRecord())).toThrow("record associated");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Adds token record properly", () =>
    {
      const signature = new LogosSignature();
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
      const signature = new LogosSignature();
      expect(() => signature.removeRecord("A")).toThrow("There is no record");
    });
  });

  describe("Post Conditions", () =>
  {
    test("Record is removed properly", () =>
    {
      const signature = new LogosSignature();
      signature.addRecord("Dobs", new WhitespaceTokenRecord());
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
      const signature = new LogosSignature();
      expect(() => signature.getRecord("+")).toThrow("There is no record associated");
    });
  });

  describe("Post Conditions", () =>
  {
    const signature = new LogosSignature();
    signature.addRecord("+", new TypedTokenRecord(new Type("[i,i]->o")));
    expect(signature.getRecord("+").sort()).toBe("TypedToken");
  });
});