import express from 'express';
import {
  addCategoryMargin,
  addMargin,
  addSupplierMargin,
  deleteCategoryMargin,
  deleteSupplierMargin,
  getCategoryMargin,
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
router.post('/add-category-margin/supplier', addCategoryMargin);
router.delete('/delete-category-margin/supplier', deleteCategoryMargin);
router.get('/get-category-margin/supplier', getCategoryMargin);

export default router;