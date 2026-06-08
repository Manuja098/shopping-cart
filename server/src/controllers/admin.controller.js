import prisma from '../config/database.js';
import cloudinary from '../config/cloudinary.js';

export const adminGetCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};

export const adminUpdateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { name, slug },
    });
    res.json({ success: true, data: category });
  } catch (error) { next(error); }
};

export const adminGetProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
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

export const adminCreateProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const files = req.files || [];
    const product = await prisma.product.create({
      data: { name, description, price: parseFloat(price), stock: parseInt(stock), categoryId: parseInt(categoryId) },
    });
    if (files.length > 0 && process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder') {
      const imageData = files.map((file, index) => ({
        productId: product.id, imageUrl: file.path, publicId: file.filename, isPrimary: index === 0,
      }));
      await prisma.productImage.createMany({ data: imageData });
    }
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, category: true },
    });
    res.status(201).json({ success: true, data: fullProduct });
  } catch (error) { next(error); }
};

export const adminUpdateProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, isActive } = req.body;
    const files = req.files || [];
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name        && { name }),
        ...(description && { description }),
        ...(price       && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(categoryId  && { categoryId: parseInt(categoryId) }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
    });
    if (files.length > 0 && process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder') {
      const imageData = files.map((file) => ({
        productId: product.id, imageUrl: file.path, publicId: file.filename, isPrimary: false,
      }));
      await prisma.productImage.createMany({ data: imageData });
    }
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, category: true },
    });
    res.json({ success: true, data: fullProduct });
  } catch (error) { next(error); }
};

export const adminDeleteProduct = async (req, res, next) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) { next(error); }
};

export const adminDeleteProductImage = async (req, res, next) => {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: req.params.imageId } });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    await cloudinary.uploader.destroy(image.publicId);
    await prisma.productImage.delete({ where: { id: image.id } });
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) { next(error); }
};

export const adminSetPrimaryImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;
    await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    await prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } });
    res.json({ success: true, message: 'Primary image updated' });
  } catch (error) { next(error); }
};