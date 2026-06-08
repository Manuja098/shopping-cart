import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useCartStore from '../store/cartStore';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const { addToCart } = useCartStore();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data.data))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    const result = await addToCart(product.id, quantity);
    if (result.success) {
      setMessage('Added to cart!');
    } else {
      setMessage(result.message || 'Failed to add');
    }
    setAdding(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="animate-pulse text-gray-400 text-lg">Loading...</div>
    </div>
  );

  if (!product) return null;

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-green-600 hover:underline mb-6 flex items-center gap-1">
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-2xl overflow-hidden h-96 flex items-center justify-center mb-4">
            {product.images?.length > 0 ? (
              <img src={product.images[activeImage]?.imageUrl} alt={product.name}
                className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">🛒</span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={img.id} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${activeImage === i ? 'border-green-500' : 'border-transparent'}`}>
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-green-600 font-medium mb-2">{product.category?.name}</p>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <p className="text-4xl font-bold text-green-600 mb-6">${parseFloat(product.price).toFixed(2)}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition">-</button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition">+</button>
              </div>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('Added') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition disabled:opacity-50">
            {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}