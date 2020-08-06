import { ParsingException } from "../../src/Utils/ParsingException";

describe("Class Invariants", () =>
{
  test("errorBeginOffset must be an integer", () =>
  {
    expect(() => {new ParsingException("", 1.2, 2, "Dummy String");}).toThrow(/errorBeginOffset is expected to be an integer/);
  });

  test("errorEndOffset must be an integer", () => 
  {
    expect(() => {new ParsingException("", 1, 5.7, "Dummy String");}).toThrow(/errorEndOffset is expected to be an integer/);
  });
  
  test("errorBeginOffset must be >= 0", () =>
  {
    expect(() => {new ParsingException("", -2, 3, "Dummy String");}).toThrow(/errorBeginOffset is expected to be a positive number/);
  });

  test("errorEndOffset must be >= 0", () =>
  {
    expect(() => {new ParsingException("", 23, -3, "Dummy String");}).toThrow(/errorEndOffset is expected to be a positive number/);
  });

  test("errorEndOffset must be <= tokenString.length", () =>
  {
    expect(() => {new ParsingException("", 0, 20, "Dummy String");}).toThrow(/errorEndOffset is expected to be < tokenString/);
  });

  test("errorBeginOffset and errorEndOffset must not cross", () =>
  {
    expect(() => {new ParsingException("", 8, 5, "Dummy String");}).toThrow(/errorBeginOffset is expected to be <= errorEndOffset/);
  });

  test("Error message is rendered correctly", () =>
  {
    expect(new ParsingException("There are unmatched parenthesis!", 3, 6, "(2+(3+4)").message).toBe("There are unmatched parenthesis!\n(2+(3+4)\n   ^^^^ ");
  });

  test("ParsingException is instanceof Error", () =>
  {
    expect(new ParsingException("There are unmatched parenthesis!", 3, 6, "(2+(3+4)") instanceof Error).toBe(true);
  });

  test("Coverage completeness", () =>
  {
    const exception = new ParsingException("There are unmatched parenthesis!", 3, 6, "(2+(3+4)");
    expect(exception.getErrorBeginOffset()).toBe(3);
    expect(exception.getErrorEndOffset()).toBe(6);
    expect(exception.getExplanation()).toBe("There are unmatched parenthesis!");
    expect(exception.getTokenString()).toBe("(2+(3+4)");
  });
});
