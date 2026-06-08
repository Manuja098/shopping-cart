import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { signToken, authResponse } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, authProvider: 'local', role: 'customer' },
    });
    const token = signToken(user);
    res.status(201).json({ success: true, data: authResponse(user, token) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.role === 'admin') {
      return res.status(401).json({ success: false, message: 'Please use the admin login' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = signToken(user);
    res.json({ success: true, data: authResponse(user, token) });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({ success: true, data: authResponse(user, token) });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

export const oauthSuccess = (req, res) => {
  const token = signToken(req.user);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientUrl}/oauth-success?token=${token}`);
};