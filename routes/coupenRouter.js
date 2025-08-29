import express from "express";
import { addCoupen, deleteCoupen, getCoupen, matchCoupen } from "../controllers/coupenController.js";
const router = express.Router();

router.get("/get", getCoupen);
router.post("/add", addCoupen);
router.delete("/delete", deleteCoupen);
router.delete("/delete/:id", deleteCoupen);
router.post("/match",matchCoupen)

export default router;
