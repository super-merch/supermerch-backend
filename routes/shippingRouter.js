import express from "express";
import { addShippingCharges, deleteShippingCharges, getShippingCharges } from "../controllers/shippingController.js";
const router = express.Router();

router.get("/get",getShippingCharges)
router.delete("/delete", deleteShippingCharges);
router.post("/add", addShippingCharges);


export default router;
