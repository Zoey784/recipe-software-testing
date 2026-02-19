const express = require("express");
const recipeController = require("./controllers/recipeController");
const userController = require("./controllers/userController");
const authenticateJWT = require("./middleware/authMiddleware");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ============================
   TEST MODE ROUTES (No DB)
   Must be BEFORE normal routes
   ============================ */
if (process.env.NODE_ENV === "test") {
  const filePath = path.join(__dirname, "recipes.json");

  app.get("/recipes", (req, res) => {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return res.status(200).json(data);
  });

  app.get("/recipes/:id", (req, res) => {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const recipeId = Number(req.params.id);
    const recipe = data.find((r) => r.id === recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    return res.status(200).json(recipe);
  });

  // optional alias support
  app.get("/recipe/:id", (req, res) => {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const recipeId = Number(req.params.id);
    const recipe = data.find((r) => r.id === recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    return res.status(200).json(recipe);
  });
}

/* ============================
   NORMAL ROUTES
   ============================ */

// Public user routes
app.post("/user", userController.createUser);
app.post("/user/login", userController.loginUser);

// Recipe routes (DB-backed)
app.get("/recipe", recipeController.getAllRecipe);
app.get("/recipe/:id", recipeController.getRecipeById);
app.delete("/recipe/:id", authenticateJWT, recipeController.deleteRecipe);
app.get("/latest-recipes", recipeController.getLatestRecipes);

// Frontend-friendly aliases (DB-backed)
app.get("/recipes", recipeController.getAllRecipe);
app.get("/recipes/:id", recipeController.getRecipeById);

// Protected user routes
app.get("/user", authenticateJWT, userController.getAllUsers);
app.get("/user/:id", authenticateJWT, userController.getUserById);
app.put("/user/:id", authenticateJWT, userController.updateUser);
app.delete("/user/:id", authenticateJWT, userController.deleteUser);

module.exports = app;

/* ============================
   START SERVER ONLY WHEN RUN DIRECTLY
   ============================ */
if (require.main === module) {
  app.listen(port, async () => {
    // Only connect DB when not test mode
    if (process.env.NODE_ENV !== "test") {
      try {
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
      } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
      }
    }

    console.log(`Server listening on port ${port}`);
  });

  process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
  });
}


// const express = require("express");
// const recipeController = require("./controllers/recipeController");
// const userController = require("./controllers/userController");
// const authenticateJWT = require("./middleware/authMiddleware");
// const sql = require("mssql");
// const dbConfig = require("./dbConfig");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// const port = 3000;

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve frontend (static files)
// app.use(express.static("public"));

// /* ============================
//    TEST MODE ROUTE (No DB)
//    This MUST come BEFORE the real /recipe/:id route
//    ============================ */
// if (process.env.NODE_ENV === "test") {
//   app.get("/recipe/:id", (req, res) => {
//     const filePath = path.join(__dirname, "recipes.json");
//     const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

//     const recipeId = Number(req.params.id);
//     const recipe = data.find((r) => r.id === recipeId);

//     if (!recipe) return res.status(404).json({ message: "Recipe not found" });

//     return res.status(200).json(recipe);
//   });
// }

// /* ============================
//    NORMAL ROUTES
//    ============================ */

// // Public routes (No authentication required)
// app.post("/user", userController.createUser);
// app.post("/user/login", userController.loginUser);

// // Recipe routes
// app.get("/recipe", recipeController.getAllRecipe);
// app.get("/recipe/:id", recipeController.getRecipeById);
// app.delete("/recipe/:id", authenticateJWT, recipeController.deleteRecipe);
// app.get("/latest-recipes", recipeController.getLatestRecipes);

// // Frontend-friendly aliases
// app.get("/recipes", recipeController.getAllRecipe);
// app.get("/recipes/:id", recipeController.getRecipeById);

// // User routes
// app.get("/user", authenticateJWT, userController.getAllUsers);
// app.get("/user/:id", authenticateJWT, userController.getUserById);
// app.put("/user/:id", authenticateJWT, userController.updateUser);
// app.delete("/user/:id", authenticateJWT, userController.deleteUser);

// /* ============================
//    EXPORT FOR TESTING
//    ============================ */
// module.exports = app;

// /* ============================
//    START SERVER ONLY WHEN RUN DIRECTLY
//    ============================ */
// if (require.main === module) {
//   app.listen(port, async () => {
//     if (process.env.NODE_ENV === "test") {
//     const fs = require("fs");
//     const path = require("path");

//     app.get("/recipes", (req, res) => {
//         const filePath = path.join(__dirname, "recipes.json");
//         const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
//         return res.status(200).json(data);
//     });

//     app.get("/recipes/:id", (req, res) => {
//         const filePath = path.join(__dirname, "recipes.json");
//         const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
//         const recipeId = Number(req.params.id);
//         const recipe = data.find(r => r.id === recipeId);
//         if (!recipe) return res.status(404).json({ message: "Recipe not found" });
//         return res.status(200).json(recipe);
//     });
//     }


//     console.log(`Server listening on port ${port}`);
//   });

//   process.on("SIGINT", async () => {
//     console.log("Server is gracefully shutting down");
//     await sql.close();
//     console.log("Database connection closed");
//     process.exit(0);
//   });
// }



// const express = require("express");
// const recipeController = require("./controllers/recipeController");
// const userController = require('./controllers/userController');
// const authenticateJWT = require('./middleware/authMiddleware');
// const sql = require("mssql");
// const dbConfig = require("./dbConfig");
// const cors = require('cors');
// const fs = require("fs");
// const path = require("path");

// const app = express();
// const port = 3000;

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve frontend (static files)
// app.use(express.static('public'));

// // Public routes (No authentication required)
// app.post('/user', userController.createUser); // Register new user
// app.post('/user/login', userController.loginUser); // Login user

// // Protected routes (Authentication required)
// app.get("/recipe", recipeController.getAllRecipe); // Example of protected route
// app.get("/recipe/:id", recipeController.getRecipeById);
// app.delete("/recipe/:id", authenticateJWT, recipeController.deleteRecipe);
// app.get("/latest-recipes", recipeController.getLatestRecipes);


// // Frontend-friendly aliases
// app.get('/recipes', recipeController.getAllRecipe);
// app.get('/recipes/:id', recipeController.getRecipeById);

// // User routes
// app.get('/user', authenticateJWT, userController.getAllUsers);
// app.get('/user/:id', authenticateJWT, userController.getUserById);
// app.put('/user/:id', authenticateJWT, userController.updateUser);
// app.delete('/user/:id', authenticateJWT, userController.deleteUser);

// app.listen(port, async () => {
//     try {
//         await sql.connect(dbConfig);
//         console.log("Database connection established successfully");
//     } catch (err) {
//         console.error("Database connection error:", err);
//         process.exit(1);
//     }

//     console.log(`Server listening on port ${port}`);
// });

// if (process.env.NODE_ENV === "test") {
//   app.get("/recipe/:id", (req, res) => {
//     const filePath = path.join(__dirname, "recipes.json");
//     const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

//     const recipeId = Number(req.params.id);
//     const recipe = data.find(r => r.id === recipeId);

//     if (!recipe) return res.status(404).json({ message: "Recipe not found" });

//     return res.status(200).json(recipe);
//   });
// }

// module.exports = app;

// if (require.main === module) {
//   app.listen(port, async () => {
//     try {
//       await sql.connect(dbConfig);
//       console.log("Database connection established successfully");
//     } catch (err) {
//       console.error("Database connection error:", err);
//       process.exit(1);
//     }

//     console.log(`Server listening on port ${port}`);
//   });

//   process.on("SIGINT", async () => {
//     console.log("Server is gracefully shutting down");
//     await sql.close();
//     console.log("Database connection closed");
//     process.exit(0);
//   });
// }

// process.on("SIGINT", async () => {
//     console.log("Server is gracefully shutting down");
//     await sql.close();
//     console.log("Database connection closed");
//     process.exit(0);
// });