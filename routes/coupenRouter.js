import express from "express";
import { addCoupen, deleteCoupen, getCoupen, matchCoupen, toggleCoupenStatus } from "../controllers/coupenController.js";

const router = express.Router();

router.get("/get", getCoupen);
router.post("/add", addCoupen);
router.delete("/delete", deleteCoupen);
router.delete("/delete/:id", deleteCoupen);
router.post("/match", matchCoupen);
router.patch("/toggle/:id", toggleCoupenStatus); // New route for activate/deactivate

export default router;