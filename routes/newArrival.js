import express from "express";
import { addArrival, deleteArrival, getArrival } from "../controllers/arrivalController.js";

const router = express.Router();

router.get('/get-arrivals', getArrival)
router.post('/add-arrival', addArrival)
router.delete('/delete-arrival', deleteArrival)


export default router