const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const {authenticateToken}= require("../middleware/Authentication");
const { create_user, delete_user, login ,getUser} = require("../Resolvers/userResolver");

// Path to the log file
const logFilePath = path.join(__dirname, "../Logs/user.log");

// Ensure Logs directory exists
if (!fs.existsSync(path.join(__dirname, "../Logs"))) {
  fs.mkdirSync(path.join(__dirname, "../Logs"));
}

// Utility function to write logs
const logEvent = (action, name, establishmentId) => {
  const dateTime = new Date().toISOString();
  const logMessage = `${action} user: ${name}, establishmentId: ${establishmentId} at ${dateTime}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });
};

// Route to create a new user
router.post("/create",authenticateToken, async (req, res) => {
  const { name, password, role, establishmentId } = req.body;
  const result = await create_user(name, password, role, establishmentId);

  // Log the user creation event
  if (result.success) {
    logEvent("Created", name, establishmentId);
  }

  res.json(result);
});

// Route to login a user
router.post("/login",async (req, res) => {
  const { name, password, establishmentId } = req.body;
  const result = await login(name, password, establishmentId);

  // Log the login event
  if (result.success) {
    logEvent("Logged in", name, establishmentId);
  }

  res.json(result);
});

// Route to delete a user
router.delete("/delete",authenticateToken, async (req, res) => {
  const { name, establishmentId } = req.body;
  const result = await delete_user(name, establishmentId);

  // Log the user deletion event
  if (result.success) {
    logEvent("Deleted", name, establishmentId);
  }

  res.json(result);
});




router.get("/",async(req,res)=>{
  console.log("called");

  const result = await getUser();
res.json(result);

})


const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key';
// Middleware to protect routes
router.post("/tokendata", (req, res) => {
  console.log("called");
const {token}=req.body;
console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Check that the payload contains the expected properties
    if (!user.username || !user.role) {
      return res.status(403).json({ message: 'Token payload invalid' });
    }
    // Attach the user details to the request object for access in the route
    res.json(user);
     if(user.role!='admin'){
        return res.status(403).json({ message: 'Not Authorized For This Route' });
     }
    // Proceed to the next middleware or route handler

  });
})


module.exports = router;

