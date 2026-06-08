import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white text-xl font-bold mb-3">🛒 FreshMart</h3>
          <p className="text-sm">Your one-stop shop for fresh vegetables, fruits, cakes, and biscuits.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/"     className="hover:text-white transition">Home</Link></li>
            <li><Link to="/shop" className="hover:text-white transition">Shop</Link></li>
            <li><Link to="/cart" className="hover:text-white transition">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Categories</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop?category=vegetables" className="hover:text-white transition">Vegetables</Link></li>
            <li><Link to="/shop?category=fruits"     className="hover:text-white transition">Fruits</Link></li>
            <li><Link to="/shop?category=cakes"      className="hover:text-white transition">Cakes</Link></li>
            <li><Link to="/shop?category=biscuits"   className="hover:text-white transition">Biscuits</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center py-4 text-sm">
        © 2026 FreshMart. All rights reserved.
      </div>
    </footer>
  );
}