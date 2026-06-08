import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

export default function Cart() {
  const { items, total, itemCount, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-8">Add some products to get started</p>
        <Link to="/shop" className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition font-semibold">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow p-4 flex gap-4 items-center">
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-3xl">🛒</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                <p className="text-green-600 font-bold">${item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => updateItem(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30">-</button>
                <span className="px-3 py-1 font-medium">{item.quantity}</span>
                <button onClick={() => updateItem(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30">+</button>
              </div>
              <p className="font-bold text-gray-800 w-20 text-right">${item.subtotal.toFixed(2)}</p>
              <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition ml-2">
                ✕
              </button>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition">
            Clear cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Items ({itemCount})</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>
          {isAuthenticated ? (
            <button onClick={() => navigate('/checkout')}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">
              Proceed to Checkout
            </button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Please login to checkout</p>
              <Link to="/login" className="w-full block bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition text-center">
                Login to Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}