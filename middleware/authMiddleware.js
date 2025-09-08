import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();
const authMiddleware = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Not Authorized Login Again" });
  }
  
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decode.id || token_decode._id;
    next();
  } catch (error) {
    // fixed logging typo and handle JWT-specific errors gracefully
    console.log(error);

    if (error && error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ success: false, message: "Not Authorized Login Again", expiredAt: error.expiredAt });
    }

    if (error && error.name === "JsonWebTokenError") {
      return res
        .status(400)
        .json({ success: false, message: "Not Authorized Login Again" });
    }

    // keep your original behavior for other errors (status/message)
    res.status(400).json({ success: false, message: error.message });
  }
};

export const optionalAuth = (req, res, next) => {
  const { token } = req.headers;

  // No token => guest checkout
  if (!token) {
    req.body.userId = null;
    return next();
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decode.id || token_decode._id;
    next();
  } catch (error) {
    // token was provided but invalid -> block (you can change to treat as guest if desired)
    console.log("Invalid token in optionalAuth:", error.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
export default authMiddleware;
