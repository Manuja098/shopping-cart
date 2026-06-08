import express from 'express';
import passport from 'passport';
import { register, login, adminLogin, getMe, oauthSuccess } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Local auth routes
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/admin/login', loginRules, validate, adminLogin);
router.get('/me', protect, getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), oauthSuccess);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login' }), oauthSuccess);

export default router;