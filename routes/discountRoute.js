import express from "express";
import { addDiscount, getDiscountByProductId, listDiscount, loginAdmin } from "../controllers/productDiscount.js";
import adminMiddlewere from "../middleware/adminMiddlewere.js";
const router = express.Router();

router.post("/add-discount", addDiscount, adminMiddlewere);
router.post("/admin-login", loginAdmin);
router.get("/discounts/:productId", getDiscountByProductId, adminMiddlewere);
router.get("/list-discounts", listDiscount);

export default router;
