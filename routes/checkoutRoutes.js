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
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddlewere from '../middleware/adminMiddlewere.js';
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
router.post(
  '/checkout',
  // [
  //   // Validate user fields
  //   body('user.firstName').notEmpty().withMessage('First name is required'),
  //   // body("user.lastName").notEmpty().withMessage("Last name is required"),
  //   body('user.email').isEmail().withMessage('Valid email is required'),
  //   body('user.phone').notEmpty().withMessage('Phone number is required'),

  //   // Validate address fields
  //   body('address.country').notEmpty().withMessage('Country is required'),
  //   body('address.state').notEmpty().withMessage('State is required'),
  //   body('address.city').notEmpty().withMessage('City is required'),
  //   body('address.postalCode')
  //     .notEmpty()
  //     .withMessage('Postal code is required'),
  //   body('address.addressLine')
  //     .notEmpty()
  //     .withMessage('Address line is required'),
  //   body('products')
  //     .isArray({ min: 1 })
  //     .withMessage('At least one product is required'),
  //   body('products.*.name').notEmpty().withMessage('Product name is required'),
  //   body('products.*.image')
  //     .notEmpty()
  //     .withMessage('Product image is required'),
  //   body('products.*.quantity')
  //     .isInt({ min: 1 })
  //     .withMessage('Product quantity must be at least 1'),
  //   body('products.*.price')
  //     .isNumeric()
  //     .withMessage('Product price is required'),
  //   body('products.*.subTotal')
  //     .isNumeric()
  //     .withMessage('Product subTotal is required'),

  //   // Validate checkout summary fields
  //   body('shipping').isNumeric().withMessage('Shipping amount is required'),
  //   body('discount').isNumeric().withMessage('Discount is required'),
  //   body('tax').isNumeric().withMessage('Tax is required'),
  //   body('total').isNumeric().withMessage('Total is required'),
  // ],
  authMiddleware,
  createCheckout
);
router.post('/quote', upload.single('file'), quoteSaver);

router.get('/products/:id?', getAllProducts);

router.get('/user-order', authMiddleware, userOrders);

router.get('/list-quote', adminMiddlewere, getAllQuotes);


router.put('/checkout/:id', authMiddleware, updateCheckoutDetails);

router.put('/status/:id', adminMiddlewere, updateStatus);

export default router;
