import express from 'express';
import multer from 'multer';
import { productStorage } from '../config/cloudinary.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  adminGetCategories,
  adminUpdateCategory,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminDeleteProductImage,
  adminSetPrimaryImage,
} from '../controllers/admin.controller.js';

const router = express.Router();
const upload = multer({ storage: productStorage });

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// Categories
router.get('/categories',          adminGetCategories);
router.put('/categories/:id',      adminUpdateCategory);

// Products
router.get('/products',            adminGetProducts);
router.post('/products',           upload.array('images', 5), adminCreateProduct);
router.put('/products/:id',        upload.array('images', 5), adminUpdateProduct);
router.delete('/products/:id',     adminDeleteProduct);
router.delete('/products/:productId/images/:imageId', adminDeleteProductImage);
router.patch('/products/:productId/images/:imageId/primary', adminSetPrimaryImage);

export default router;