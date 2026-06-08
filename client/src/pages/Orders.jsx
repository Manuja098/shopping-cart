import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/orders/my-orders')
        .then(res => setOrders(res.data.data))
        .finally(() => setLoading(false));
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Login Required</h2>
        <Link to="/login" className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition font-semibold">
          Login
        </Link>
      </div>
    );
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link to="/shop" className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition font-semibold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{order.id}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product.name} x {item.quantity}</span>
                    <span>${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-green-600">${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}