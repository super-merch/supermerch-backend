import express from "express";
// import router from express.Router();
import UserRoutes from "./userRoutes.js"
import checkoutRoutes from "./checkoutRoutes.js";
import discontRoutes from "./discountRoute.js";
import blogRouter from "./blogRoutes.js";
import favouriteRouter from "./favouriteRoute.js";
// <<<<<<< HEAD
// =======
import marginRoutes from './marginRoutes.js';
// >>>>>>> 9676ff4 (Initial commit)
const router = express.Router();

router.use("/auth", UserRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/add-discount", discontRoutes);
router.use("/blogs", blogRouter);
router.use("/favourites", favouriteRouter);
// <<<<<<< HEAD
// =======
router.use('/product-margin', marginRoutes);
// >>>>>>> 9676ff4 (Initial commit)

export default router;
