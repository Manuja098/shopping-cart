import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, mergeCart } from '../controllers/cart.controller.js';
import { optionalAuth, protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/',              optionalAuth, getCart);
router.post('/items',        optionalAuth, addToCart);
router.put('/items/:itemId', optionalAuth, updateCartItem);
router.delete('/items/:itemId', optionalAuth, removeCartItem);
router.delete('/',           optionalAuth, clearCart);
router.post('/merge',        protect, mergeCart);

export default router;