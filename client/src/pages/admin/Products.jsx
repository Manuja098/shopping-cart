import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    api.get('/admin/products').then(res => setProducts(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get('/products/categories').then(res => setCategories(res.data.data));
  }, []);

  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('description', form.description);
      data.append('price', form.price);
      data.append('stock', form.stock);
      data.append('categoryId', form.categoryId);
      if (editing) {
        await api.put(`/admin/products/${editing.id}`, data);
      } else {
        await api.post('/admin/products', data);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', price: '', stock: '', categoryId: '' });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '', price: '', stock: '', categoryId: '' }); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
          + Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Product'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Product</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Price</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Stock</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img src={product.images[0].imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : <span>🛒</span>}
                      </div>
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name}</td>
                  <td className="px-6 py-4 text-sm font-medium">${parseFloat(product.price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}