import express from "express";
import { addBestSeller, deleteBestSeller, getBestSeller } from "../controllers/bestSellerController.js";

const router = express.Router();

router.get('/get-bestSeller', getBestSeller)
router.post('/add-bestSeller', addBestSeller)
router.delete('/delete-bestSeller', deleteBestSeller)


export default router