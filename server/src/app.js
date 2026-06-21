import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from './config/passport.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes    from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import adminRoutes   from './routes/admin.routes.js';
import cartRoutes    from './routes/cart.routes.js';
import orderRoutes   from './routes/order.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

app.use('/api/', apiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(passport.initialize());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Shopping Cart API is running', environment: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Shopping Cart API v1.0' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
