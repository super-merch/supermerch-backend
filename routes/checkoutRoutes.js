import multer from 'multer';

import express from 'express';
import { body } from 'express-validator';
import {
  createCheckout,
  getAllProducts,
  userOrders,
  updateCheckoutDetails,
  updateStatus,
  quoteSaver,
  getAllQuotes,
} from '../controllers/checkoutController.js';
import authMiddleware, { optionalAuth } from '../middleware/authMiddleware.js';
import adminMiddlewere from '../middleware/adminMiddlewere.js';
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
router.post(
  '/checkout',

  optionalAuth,
  createCheckout
);
router.post('/quote', upload.single('file'), quoteSaver);

router.get('/products/:id?', getAllProducts);

router.get('/user-order', authMiddleware, userOrders);

router.get('/list-quote', adminMiddlewere, getAllQuotes);


router.put('/checkout/:id', authMiddleware, updateCheckoutDetails);

router.put('/status/:id', adminMiddlewere, updateStatus);

export default router;
