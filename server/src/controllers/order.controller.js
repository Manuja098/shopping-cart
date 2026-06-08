import prisma from '../config/database.js';

export const placeOrder = async (req, res, next) => {
  try {
    const { fullName, address, city, phone } = req.body;
    const userId = req.user.id;

    // Get user cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
    }

    // Calculate total
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        fullName,
        address,
        city,
        phone,
        totalAmount,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity:  item.quantity,
            unitPrice: item.product.price,
          })),
        },
      },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    });

    // Deduct stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({ success: true, data: order });
  } catch (error) { next(error); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    });
    res.json({ success: true, data: orders });
  } catch (error) { next(error); }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};