import jwt from "jsonwebtoken";

// admin authentication middleware
const adminMiddlewere = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res
        .status(400)
        .json({ success: false, message: "Not Authorized Login Again" });
    }

      const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
      
    if (token_decode.email !== process.env.ADMIN_EMAIL) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default adminMiddlewere;
