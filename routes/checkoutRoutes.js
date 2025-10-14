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
  deleteOrder,
  updateOrderStatus,
  sendDeliveryEmail,
  sendNote,
  getEmailTemplates,
  updateEmailTemplate,
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
router.post('/send-note',sendNote)

router.get('/products/:id?', getAllProducts);

router.get('/user-order', authMiddleware, userOrders);

router.get('/list-quote', adminMiddlewere, getAllQuotes);


router.put('/checkout/:id', updateCheckoutDetails);

router.put('/status/:id', adminMiddlewere, updateStatus);
router.delete('/delete/:id', deleteOrder);
router.put('/update-payment', updateOrderStatus);
router.post('/send-email', sendDeliveryEmail);
router.get('/email-templates', getEmailTemplates);
router.put('/email-templates', updateEmailTemplate);

export default router;
