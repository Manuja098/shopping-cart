import express from 'express';
import {
  getProducts,
  getProduct,
  getProductsByCategory,
  getCategories,
} from '../controllers/product.controller.js';

const router = express.Router();

router.get('/',               getProducts);
router.get('/categories',     getCategories);
router.get('/category/:slug', getProductsByCategory);
router.get('/:id',            getProduct);

export default router;