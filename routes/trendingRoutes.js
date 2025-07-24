import express from "express";
import { addTrending, deleteTrending, getTrending } from "../controllers/trendController.js";

const router = express.Router();

router.get('/get-trending', getTrending)
router.post('/add-trending', addTrending)
router.delete('/delete-trending', deleteTrending)


export default router