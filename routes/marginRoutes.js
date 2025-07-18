import express from 'express';
import {
  addMargin,
  addSupplierMargin,
  deleteSupplierMargin,
  getMarginByProductId,
  getSupplierMargin,
  listMargin,
  updateSupplierMargin,
} from '../controllers/productMargin.js';
import adminMiddlewere from '../middleware/adminMiddlewere.js';
const router = express.Router();

router.post('/add-margin', addMargin, adminMiddlewere);
router.get('/margin/:productId', getMarginByProductId, adminMiddlewere);
router.get('/list-margin', listMargin);
router.get('/list-margin/supplier', getSupplierMargin);
router.post('/add-margin/supplier', addSupplierMargin);
router.delete('/del-margin/supplier', deleteSupplierMargin);
router.put('/update-margin/supplier', updateSupplierMargin);

export default router;