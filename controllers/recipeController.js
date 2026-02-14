const Recipe = require("../models/recipe");

const getAllRecipe = async (req, res) => {
    try {
      const recipe = await Recipe.getAllRecipe();
      res.json(recipe);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving Recipe");
    }
  };

  const getRecipeById = async (req, res) => {
    const recipeId = parseInt(req.params.id);
    try {
      const recipe = await Recipe.getRecipeById(recipeId);
      if (!recipe) {
        return res.status(404).send("Recipe not found");
      }
      res.json(recipe);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving Recipe");
    }
  };
  

const createRecipe = async (req, res) => {
  const newRecipe = req.body;
  try {
    const createdRecipe = await Recipe.createRecipe(newRecipe);
    res.status(201).json(createdRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating Recipe");
  }
};

const updateRecipe = async (req, res) => {
  const recipeId = parseInt(req.params.id);
  const newRecipeData = req.body;

  try {
    const updatedRecipe = await Recipe.updateRecipe(recipeId, newRecipeData);
    if (!updatedRecipe) {
      return res.status(404).send("Recipe not found");
    }
    res.json(updatedRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating Recipe");
  }
};

const deleteRecipe = async (req, res) => {
  const recipeId = parseInt(req.params.id);

  try {
    const success = await Recipe.deleteRecipe(recipeId);
    if (!success) {
      return res.status(404).send("Recipe not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    console.error(error);
    res.status(500).send("Error deleting Recipe");
  }
};

const getLatestRecipes = async (req, res) => {
    try {
      const recipe = await Recipe.getLatestRecipes();
      res.json(recipe);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving Recipe");
    }
  };

module.exports = {
  getAllRecipe,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getLatestRecipes,
};