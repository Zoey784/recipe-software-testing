require('dotenv').config();
module.exports = {
    user: "recipe_user",
    password: "recipe_user",
    server: "localhost",
    database: "RecipeManagement_db",
    trustServerCertificate: true,
    options: {
        port: 1433,
        connectionTimeout: 60000,
    },
    jwtSecret: process.env.JWT_SECRET,
};