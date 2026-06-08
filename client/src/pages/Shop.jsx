import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import useCartStore from '../store/cartStore';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCartStore();
  const [addingId, setAddingId] = useState(null);

  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const page     = searchParams.get('page')     || 1;

  useEffect(() => {
    api.get('/products/categories').then(res => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)   params.set('search', search);
    if (page)     params.set('page', page);
    if (category) {
      api.get(`/products/category/${category}`)
        .then(res => { setProducts(res.data.data); setPagination(res.data.pagination); })
        .finally(() => setLoading(false));
    } else {
      api.get(`/products?${params.toString()}`)
        .then(res => { setProducts(res.data.data); setPagination(res.data.pagination); })
        .finally(() => setLoading(false));
    }
  }, [search, category, page]);

  const handleAddToCart = async (productId) => {
    setAddingId(productId);
    await addToCart(productId, 1);
    setAddingId(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.search.value;
    setSearchParams(val ? { search: val } : {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shop</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                name="search"
                defaultValue={search}
                placeholder="Search products..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">
                Go
              </button>
            </div>
          </form>

          {/* Categories */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSearchParams({})}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!category ? 'bg-green-50 text-green-600 font-medium' : 'hover:bg-gray-50'}`}>
                  All Products
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSearchParams({ category: cat.slug })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${category === cat.slug ? 'bg-green-50 text-green-600 font-medium' : 'hover:bg-gray-50'}`}>
                    {cat.name} ({cat._count.products})
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden">
                    <Link to={`/product/${product.id}`}>
                      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0].imageUrl} alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition" />
                        ) : (
                          <span className="text-5xl">🛒</span>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <p className="text-xs text-green-600 font-medium mb-1">{product.category?.name}</p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-gray-800 mb-1 hover:text-green-600 transition">{product.name}</h3>
                      </Link>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-green-600 font-bold">${parseFloat(product.price).toFixed(2)}</p>
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addingId === product.id || product.stock === 0}
                          className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                          {addingId === product.id ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                      {product.stock <= 5 && product.stock > 0 && (
                        <p className="text-xs text-orange-500 mt-1">Only {product.stock} left!</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button key={i}
                      onClick={() => setSearchParams({ page: i + 1, ...(category && { category }), ...(search && { search }) })}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition ${parseInt(page) === i + 1 ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}