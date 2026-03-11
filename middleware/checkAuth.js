const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "may@123"); // Decode and verify the token

    // Set req.user with the decoded token data
    req.user = decoded; // This should contain the _id field

    console.log("req.user:", req.user); // Now this will show the user object
    console.log("req.user._id:", req.user?._id); // Now this will show the ID

    next();
  } catch (err) {
    console.log("Auth error:", err);
    return res.status(401).json({
      // Use 401 for authentication errors
      error: "Invalid token or user not authenticated",
    });
  }
};
