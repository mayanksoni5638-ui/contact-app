import jwt from "jsonwebtoken";

const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "may@123");

    // Attach decoded user data to request
    req.user = decoded;

    console.log("req.user:", req.user);
    console.log("req.user._id:", req.user?._id);

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({
      error: "Invalid token or user not authenticated",
    });
  }
};

export default checkAuth;
