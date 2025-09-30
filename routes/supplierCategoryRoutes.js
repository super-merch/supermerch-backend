import { getSupplierCategory } from '../controllers/getSupplierCategory.js';
import express from "express";

import adminMiddlewere from '../middleware/adminMiddlewere.js';
import { activateSupplierCategory } from '../controllers/getSupplierCategory.js';
import { deactivateSupplierCategory } from '../controllers/getSupplierCategory.js';
import { getActivatedSupplierCategories } from '../controllers/getSupplierCategory.js';
const router = express.Router();

router.get('/list-supplier-category', getSupplierCategory);
router.delete('/activate-supplier-category', activateSupplierCategory);
router.post('/deactivate-supplier-category', deactivateSupplierCategory);
router.get('/list-activated-supplier-category', getActivatedSupplierCategories);
    
export default router;