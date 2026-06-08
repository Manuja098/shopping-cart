import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(res => setOrder(res.data.data));
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-6">Thank you for your order. We will deliver it soon.</p>

        {order && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-500 mb-3">Order ID: <span className="font-mono text-xs">{order.id}</span></p>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span className="font-medium">${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-green-600">${parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <p>Delivering to: {order.fullName}</p>
              <p>{order.address}, {order.city}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link to="/orders" className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition">
            View My Orders
          </Link>
          <Link to="/shop" className="border border-green-600 text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}