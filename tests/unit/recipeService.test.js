// MOCK: isolate dependency (fs)
jest.mock("fs");

const fs = require("fs");
const { getRecipeByIdFromJson } = require("../../services/recipeService");

describe("getRecipeByIdFromJson", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Happy path: id=1 returns Pasta Carbonara", () => {
    // Arrange (STUB: fixed test data)
    const fakeRecipes = [
      { id: 1, title: "Pasta Carbonara" },
      { id: 2, title: "Spaghetti Bolognese" },
    ];
    fs.readFileSync.mockReturnValue(JSON.stringify(fakeRecipes));

    // Act
    const result = getRecipeByIdFromJson("1");

    // Assert
    expect(result).not.toBeNull();
    expect(result.title).toBe("Pasta Carbonara");

    // SPY (verify function call)
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
  });

  test("Edge case: recipe not found returns null", () => {
    // Arrange (stub data)
    fs.readFileSync.mockReturnValue(JSON.stringify([{ id: 2, title: "Spaghetti Bolognese" }]));

    // Act
    const result = getRecipeByIdFromJson("1");

    // Assert
    expect(result).toBeNull();
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
  });

  test("Edge case: invalid id throws INVALID_ID", () => {
    // Arrange
    fs.readFileSync.mockReturnValue("[]"); // not used, but safe

    // Act + Assert
    expect(() => getRecipeByIdFromJson("abc")).toThrow("INVALID_ID");

    // Assert: fs should NOT be called when id is invalid
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });
});
