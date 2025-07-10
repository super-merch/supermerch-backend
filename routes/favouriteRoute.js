import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js';
import { saveFavouriteProducts } from '../controllers/favouriteController.js';

const favouriteRouter = express.Router();

favouriteRouter.post('/save-favourite', authMiddleware, saveFavouriteProducts)

export default favouriteRouter;