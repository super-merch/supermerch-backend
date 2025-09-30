import express from "express";
import { addDiscount, changePassword, getDiscountByProductId, listDiscount, loginAdmin, sendOTP } from "../controllers/productDiscount.js";
import adminMiddlewere from "../middleware/adminMiddlewere.js";
const router = express.Router();

router.post("/add-discount", addDiscount, adminMiddlewere);
router.post("/admin-login", loginAdmin);
router.post("/send-otp", sendOTP);
router.post("/change-password", changePassword);
router.get("/discounts/:productId", getDiscountByProductId, adminMiddlewere);
router.get("/list-discounts", listDiscount);

export default router;
