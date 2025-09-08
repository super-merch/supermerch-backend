import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js"; // Adjust path as needed

// admin authentication middleware
const adminMiddleware = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res
        .status(400)
        .json({ success: false, message: "Not Authorized Login Again" });
    }

    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
    
    // Check if the decoded token has admin role and valid email
    if (token_decode.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    // Verify the admin exists in database
    const admin = await Admin.findOne({ email: token_decode.email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    // Add admin info to request object for use in next middleware/controller
    req.admin = admin;
    next();
    
  } catch (error) {
    // handle expired / invalid tokens explicitly but keep your response shape
    if (error && error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Not Authorized Login Again",
        expiredAt: error.expiredAt, // optional extra info
      });
    }

    if (error && error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    // fallback to original behavior for unexpected errors
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default adminMiddleware;
