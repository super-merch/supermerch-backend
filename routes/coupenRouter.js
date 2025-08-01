import express from "express";
import { addCoupen, deleteCoupen, getCoupen, matchCoupen } from "../controllers/coupenController.js";
const router = express.Router();

router.get("/get",getCoupen)
router.post("/add",addCoupen)
router.post("/match",matchCoupen)
router.delete("/delete",deleteCoupen)

export default router;
