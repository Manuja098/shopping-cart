import express from 'express';
import { placeOrder, getMyOrders, getOrder } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const orderRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
];

router.post('/',           protect, orderRules, validate, placeOrder);
router.get('/my-orders',   protect, getMyOrders);
router.get('/:id',         protect, getOrder);

export default router;