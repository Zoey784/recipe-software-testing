const fs = require("fs");
const path = require("path");

// Business logic: validate id, load JSON, find recipe
function getRecipeByIdFromJson(idParam) {
  // Arrange (inside function): validation
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("INVALID_ID");
  }

  const filePath = path.join(__dirname, "..", "recipes.json");
  const raw = fs.readFileSync(filePath, "utf8"); // dependency to mock
  const recipes = JSON.parse(raw);

  return recipes.find((r) => r.id === id) || null;
}

module.exports = { getRecipeByIdFromJson };
