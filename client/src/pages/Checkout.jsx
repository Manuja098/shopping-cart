import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

export default function Checkout() {
  const { items, total, resetCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '', address: '', city: '', phone: ''
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Login Required</h2>
        <Link to="/login" className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition font-semibold">
          Login to Checkout
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
        <Link to="/shop" className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition font-semibold">
          Shop Now
        </Link>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/orders', form);
      resetCart();
      navigate(`/order-success/${res.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery Form */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Delivery Details</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} required rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="123 Main Street" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Colombo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0771234567" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition disabled:opacity-50 mt-4">
              {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.product.name} x {item.quantity}</span>
                <span className="font-medium">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}