import express from 'express';
import { 
    saveFavouriteProducts, 
    getFavouriteItems, 
    deleteFavouriteItem 
} from '../controllers/favouriteController.js';

const favouriteRouter = express.Router();

favouriteRouter.post('/save-favourite', saveFavouriteProducts);
favouriteRouter.get('/get-favourite', getFavouriteItems);
favouriteRouter.delete('/delete-favourite', deleteFavouriteItem);

export default favouriteRouter;