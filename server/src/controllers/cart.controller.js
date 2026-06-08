import prisma from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Helper: get or create cart for guest or user
const getOrCreateCart = async (userId, sessionId) => {
  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } },
      });
    }
    return cart;
  } else {
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
        include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } },
      });
    }
    return cart;
  }
};

// Helper: format cart response with total
const formatCart = (cart) => {
  const items = cart.items.map((item) => ({
    id:       item.id,
    quantity: item.quantity,
    product:  {
      id:          item.product.id,
      name:        item.product.name,
      price:       parseFloat(item.product.price),
      stock:       item.product.stock,
      image:       item.product.images[0]?.imageUrl || null,
    },
    subtotal: parseFloat(item.product.price) * item.quantity,
  }));

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return { id: cart.id, items, total: parseFloat(total.toFixed(2)), itemCount: items.reduce((sum, item) => sum + item.quantity, 0) };
};

// GET /api/cart
export const getCart = async (req, res, next) => {
  try {
    const userId    = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    if (!userId && !sessionId) {
      return res.json({ success: true, data: { items: [], total: 0, itemCount: 0 } });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    res.json({ success: true, data: formatCart(cart) });
  } catch (error) { next(error); }
};

// POST /api/cart/items
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId    = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || uuidv4();

    // Validate product exists and has stock
    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Check if product already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + parseInt(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data:  { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: parseInt(quantity) },
      });
    }

    // Return updated cart
    const updatedCart = await getOrCreateCart(userId, sessionId);
    res.json({ success: true, data: formatCart(updatedCart), sessionId });
  } catch (error) { next(error); }
};

// PUT /api/cart/items/:itemId
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const userId    = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { product: true },
    });

    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    if (quantity > item.product.stock) {
      return res.status(400).json({ success: false, message: `Only ${item.product.stock} items available` });
    }

    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: parseInt(quantity) } });

    const updatedCart = await getOrCreateCart(userId, sessionId);
    res.json({ success: true, data: formatCart(updatedCart) });
  } catch (error) { next(error); }
};

// DELETE /api/cart/items/:itemId
export const removeCartItem = async (req, res, next) => {
  try {
    const userId    = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    await prisma.cartItem.delete({ where: { id: req.params.itemId } });

    const updatedCart = await getOrCreateCart(userId, sessionId);
    res.json({ success: true, data: formatCart(updatedCart) });
  } catch (error) { next(error); }
};

// DELETE /api/cart
export const clearCart = async (req, res, next) => {
  try {
    const userId    = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    const cart = await getOrCreateCart(userId, sessionId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.json({ success: true, data: { items: [], total: 0, itemCount: 0 } });
  } catch (error) { next(error); }
};

// POST /api/cart/merge
// Called after login to merge guest cart into user cart
export const mergeCart = async (req, res, next) => {
  try {
    const userId    = req.user.id;
    const sessionId = req.body.sessionId;

    if (!sessionId) {
      return res.json({ success: true, message: 'No guest cart to merge' });
    }

    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return res.json({ success: true, message: 'No guest cart to merge' });
    }

    // Get or create user cart
    let userCart = await prisma.cart.findUnique({ where: { userId } });
    if (!userCart) {
      userCart = await prisma.cart.create({ data: { userId } });
    }

    // Merge items — add quantities if product already in user cart
    for (const guestItem of guestCart.items) {
      const existingItem = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: userCart.id, productId: guestItem.productId } },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data:  { quantity: existingItem.quantity + guestItem.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: userCart.id, productId: guestItem.productId, quantity: guestItem.quantity },
        });
      }
    }

    // Delete guest cart after merge
    await prisma.cart.delete({ where: { id: guestCart.id } });

    const updatedCart = await getOrCreateCart(userId, null);
    res.json({ success: true, data: formatCart(updatedCart) });
  } catch (error) { next(error); }
};