import prisma from '../config/database.js';

export const getProducts = async (req, res, next) => {
  try {
    const { search, categoryId, minPrice, maxPrice, page = 1, limit = 12, sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      isActive: true,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
      }),
    };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({
      success: true, data: products,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) { next(error); }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: true,
      },
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) { next(error); }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: category.id, isActive: true },
        skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.product.count({ where: { categoryId: category.id, isActive: true } }),
    ]);
    res.json({
      success: true, data: products, category,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) { next(error); }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};