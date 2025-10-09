import express from "express";
import { addComment, deleteComment, getCommentById, updateComment } from "../controllers/orderCommentController.js";

const router = express.Router();

router.post("/add-comment", addComment);
router.put("/update-comment/:OrderId", updateComment);
router.get("/get-comment/:OrderId", getCommentById);
router.delete("/delete-comment/:OrderId", deleteComment);


export default router