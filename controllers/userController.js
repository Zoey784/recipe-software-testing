const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/user');

const createUser = async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);
    try {
        // Check if user already exists
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role === "admin" ? "admin" : "user";

        const userData = {
            username,
            email,
            password_hash: hashedPassword,
            created_at: new Date(),
            role: userRole,
        };

        const newUser = await User.createUser(userData);
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.status(200).json({ message: 'Users retrieved successfully', users });
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.getUserById(Number(id));
        if (user) {
            res.status(200).json({ message: 'User retrieved successfully', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        await User.updateUser(Number(id), updatedData);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.deleteUser(Number(id));
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};
  
  const loginUser = async (req, res) => {
    console.log(process.env.JWT_SECRET);
    const { email, password } = req.body; // Ensure the data is coming from req.body
  
    try {
        const user = await User.getUserByEmail(email);
        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).send("Invalid credentials");
        }
  
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET, // JWT secret from .env file
            { expiresIn: '1h' }
        );
  
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Error logging in user", error: error.message });
    }
  };
  



module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    // searchUsers,
    // getUsersWithRecipe,
    loginUser,
};