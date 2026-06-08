import { Outlet, Link, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/login" />;
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-xl font-bold mb-8">🛒 Admin Panel</h2>
        <nav className="space-y-3">
          <Link to="/admin/products"   className="block hover:text-green-400 transition">Products</Link>
          <Link to="/admin/categories" className="block hover:text-green-400 transition">Categories</Link>
          <Link to="/"                 className="block hover:text-green-400 transition mt-8">← Back to Shop</Link>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-100 p-8">
        <Outlet />
      </main>
    </div>
  );
}