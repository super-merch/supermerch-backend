import express from "express";
import { body } from "express-validator";
import {
  getAllUsers,
  signUpUser,
  loginUser,
  updateUser,
  deleteUser,
  getUser,
  saveAddress,
  getWebUser,
  updateWebUser,

} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddlewere from "../middleware/adminMiddlewere.js";
const router = express.Router();

router.get("/user", getUser);

// Get All Users
router.get("/users", adminMiddlewere, getAllUsers);

// Signup User
router.post(
  "/signup",
  [
    body("name")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Name must be between 4 and 20 characters"),
    body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  signUpUser
);

// Login User
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginUser
);

// Update User
router.put(
  "/users/:id",
  [
    body("name").optional().trim().isLength({ min: 4 }).withMessage("Invalid name"),
    body("email").optional().isEmail().withMessage("Invalid email address"),
  ],
  updateUser
);

// Delete User
router.delete("/users/:id", deleteUser);


router.put("/update-address", authMiddleware, saveAddress);

router.get('/get-web-user', authMiddleware, getWebUser)
router.put("/updateWeb-user", authMiddleware, updateWebUser);

export default router;
