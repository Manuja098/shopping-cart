import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { ShoppingCart, User, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-green-600">
            🛒 FreshMart
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/"        className="text-gray-600 hover:text-green-600 transition">Home</Link>
            <Link to="/shop"    className="text-gray-600 hover:text-green-600 transition">Shop</Link>
            <Link to="/shop?category=vegetables" className="text-gray-600 hover:text-green-600 transition">Vegetables</Link>
            <Link to="/shop?category=fruits"     className="text-gray-600 hover:text-green-600 transition">Fruits</Link>
            <Link to="/shop?category=cakes"      className="text-gray-600 hover:text-green-600 transition">Cakes</Link>
            <Link to="/shop?category=biscuits"   className="text-gray-600 hover:text-green-600 transition">Biscuits</Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition">
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium">
                    <Shield size={16} /> Admin
                  </Link>
                )}
                <Link to="/orders" className="flex items-center gap-1 text-gray-600 hover:text-green-600">
                  <User size={16} /> {user?.name?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"    className="text-gray-600 hover:text-green-600">Login</Link>
                <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}