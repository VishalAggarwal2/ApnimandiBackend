const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Assuming you're using bcrypt for password hashing

// JWT Secret (you can store this in environment variables for security)
const JWT_SECRET = 'your-secret-key';

async function create_user(name, password, role, establishmentId) {
  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, password: hashedPassword, role, establishmentId });
    await user.save();
    return { success: true, message: "User created successfully" };
  } catch (error) {
    return { success: false, message: "Error creating user", error };
  }
}

async function login(name, password) {
  try {
    // Find the user by name and establishmentId
    const user = await User.findOne({ name });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Compare the password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return { success: false, message: "Invalid password" };
    }

    // Create a JWT token, valid for 24 hours
    const token = jwt.sign(
      { username: user.name, role: user.role ,establishmentId:user.establishmentId}, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: "24h" } // Token expiry time
    );

    return { success: true, message: "Login successful", token ,username: user.name, role: user.role,establishmentId:user.establishmentId};
  } catch (error) {
    return { success: false, message: "Error logging in", error };
  }
}

async function delete_user(name, establishmentId) {
  try {
    const user = await User.findOneAndDelete({ name, establishmentId });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    return { success: false, message: "Error deleting user", error };
  }


}

async function getUser(){
const users = await User.find();
return users;
}


module.exports = { create_user, login, delete_user,getUser };

