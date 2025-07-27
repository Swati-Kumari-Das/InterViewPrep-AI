const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token=req.headers.authorization;

    // Check for authorization header
    if (token && token.startsWith("Bearer")) {
      // Extract token from header
      token = token.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (excluding password)
      req.user = await User.findById(decoded.id).select("-password");
      
      next();
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    res.status(401).json({ 
      message: "Not authorized, token failed",
      error: error.message 
    });
  }
};

module.exports = { protect };