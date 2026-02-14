const express = require("express");
const recipeController = require("./controllers/recipeController");
const userController = require('./controllers/userController');
const authenticateJWT = require('./middleware/authMiddleware');
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend (static files)
app.use(express.static('public'));

// Public routes (No authentication required)
app.post('/user', userController.createUser); // Register new user
app.post('/user/login', userController.loginUser); // Login user

// Protected routes (Authentication required)
app.get("/recipe", recipeController.getAllRecipe); // Example of protected route
app.get("/recipe/:id", recipeController.getRecipeById);
app.delete("/recipe/:id", authenticateJWT, recipeController.deleteRecipe);
app.get("/latest-recipes", recipeController.getLatestRecipes);


// Frontend-friendly aliases
app.get('/recipes', recipeController.getAllRecipe);
app.get('/recipes/:id', recipeController.getRecipeById);

// User routes
app.get('/user', authenticateJWT, userController.getAllUsers);
app.get('/user/:id', authenticateJWT, userController.getUserById);
app.put('/user/:id', authenticateJWT, userController.updateUser);
app.delete('/user/:id', authenticateJWT, userController.deleteUser);

app.listen(port, async () => {
    try {
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }

    console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});