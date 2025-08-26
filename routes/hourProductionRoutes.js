import express from "express";
import { addTo24HourProduction, get24HourProducts, getAll24HourProduction, removeFrom24HourProduction } from "../controllers/24hourProductionController.js";

const router = express.Router();


router.post('/add', addTo24HourProduction)
router.delete('/delete/:id', removeFrom24HourProduction)
router.get('/get', getAll24HourProduction)
router.get('/get-products', get24HourProducts)

export default router