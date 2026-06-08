import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth }           = useAuthStore();
  const { mergeCart, fetchCart } = useCartStore();
  const navigate              = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      const { token, user } = res.data.data;
      setAuth(user, token);
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) await mergeCart(sessionId);
      else await fetchCart();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Create account</h2>
        <p className="text-center text-gray-500 mb-8">Join FreshMart today</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
        </div>

        <div className="mt-4 border-t pt-4">
          <p className="text-center text-xs text-gray-400 mb-3">Or continue with</p>
          <div className="flex gap-3">
            <a href="http://localhost:5000/api/auth/google"
              className="flex-1 border border-gray-300 rounded-lg py-2 text-center text-sm hover:bg-gray-50 transition">
              Google
            </a>
            <a href="http://localhost:5000/api/auth/facebook"
              className="flex-1 border border-gray-300 rounded-lg py-2 text-center text-sm hover:bg-gray-50 transition">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}