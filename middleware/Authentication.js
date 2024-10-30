const jwt = require('jsonwebtoken');

// JWT Secret (store this in an environment variable for security)
const JWT_SECRET = 'your-secret-key';

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  // Extract the token from the Authorization header
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
// console.log(token);
//   if (!token) {
//     return res.status(401).json({ message: 'Access Denied. No token provided.' });
//   }

//   // Verify the token
//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: 'Invalid or expired token' });
//     }

//     // Check that the payload contains the expected properties
//     if (!user.username || !user.role) {
//       return res.status(403).json({ message: 'Token payload invalid' });
//     }
//     // Attach the user details to the request object for access in the route
//     req.user = user;
//      if(user.role!='admin'){
//         return res.status(403).json({ message: 'Not Authorized For This Route' });
//      }
//     // Proceed to the next middleware or route handler
    next();
  // });
};

module.exports = {
  authenticateToken,
};
