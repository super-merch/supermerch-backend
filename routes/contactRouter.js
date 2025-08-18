import express from "express";
import { deleteQuery, getAllQueries, getOneQuery, saveQuery } from "../controllers/contactController.js";
const router = express.Router();

router.get("/get",getAllQueries)
router.post("/add",saveQuery)
router.delete("/delete/:id",deleteQuery)
router.get("/get-one/:id",getOneQuery)



export default router;
