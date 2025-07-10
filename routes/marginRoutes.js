import express from 'express';
import {
  addMargin,
  getMarginByProductId,
  listMargin,
} from '../controllers/productMargin.js';
import adminMiddlewere from '../middleware/adminMiddlewere.js';
const router = express.Router();

router.post('/add-margin', addMargin, adminMiddlewere);
router.get('/margin/:productId', getMarginByProductId, adminMiddlewere);
router.get('/list-margin', listMargin);

export default router;
