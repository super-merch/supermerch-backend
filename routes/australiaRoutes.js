import express from "express";
import { addToAustralia, getAllAustralia, getAustraliaProducts, removeFromAustralia } from "../controllers/australiaController.js";

const router = express.Router();

router.post('/add', addToAustralia)
router.delete('/delete/:id', removeFromAustralia)
router.get('/get', getAllAustralia)
router.get('/get-products', getAustraliaProducts)


export default router