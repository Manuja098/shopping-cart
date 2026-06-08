import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/common/Layout';
import useCartStore from './store/cartStore';
import useAuthStore from './store/authStore';

// Pages (we'll create these next)
import Home       from './pages/Home';
import Shop       from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart       from './pages/Cart';
import Checkout   from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Orders     from './pages/Orders';
import NotFound   from './pages/NotFound';

// Admin pages
import AdminLayout    from './pages/admin/AdminLayout';
import AdminProducts  from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';

function App() {
  const { fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/shop" element={<Layout><Shop /></Layout>} />
      <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
      <Route path="/cart" element={<Layout><Cart /></Layout>} />
      <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
      <Route path="/order-success/:id" element={<Layout><OrderSuccess /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route path="/orders" element={<Layout><Orders /></Layout>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminProducts />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
      </Route>

      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
}

export default App;