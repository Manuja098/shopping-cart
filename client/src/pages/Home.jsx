import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/products/categories').then(res => setCategories(res.data.data));
    api.get('/products?limit=4').then(res => setFeatured(res.data.data));
  }, []);

  const categoryIcons = {
    vegetables: '🥦',
    fruits: '🍎',
    cakes: '🎂',
    biscuits: '🍪',
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-400 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Fresh Groceries Delivered</h1>
          <p className="text-xl mb-8 opacity-90">Shop fresh vegetables, fruits, cakes and biscuits</p>
          <Link to="/shop" className="bg-white text-green-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition text-lg">
            Shop Now
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(cat => (
            <Link key={cat.id} to={`/shop?category=${cat.slug}`}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-8 text-center group">
              <div className="text-5xl mb-3">{categoryIcons[cat.slug] || '🛒'}</div>
              <h3 className="text-lg font-semibold text-gray-700 group-hover:text-green-600 transition">{cat.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{cat._count.products} products</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      {featured.length > 0 && (
        <div className="bg-gray-50 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featured.map(product => (
                <Link key={product.id} to={`/product/${product.id}`}
                  className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group">
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0].imageUrl} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <span className="text-5xl">🛒</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-green-600 font-medium mb-1">{product.category?.name}</p>
                    <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-green-600 font-bold">${parseFloat(product.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/shop" className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition font-semibold">
                View All Products
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}