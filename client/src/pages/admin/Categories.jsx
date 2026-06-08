import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    api.get('/admin/categories').then(res => setCategories(res.data.data));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleEdit = (cat) => {
    setEditing(cat);
    setName(cat.name);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/categories/${editing.id}`, { name });
      setEditing(null);
      setName('');
      fetchCategories();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Categories</h1>
      <p className="text-sm text-gray-500 mb-6">Categories are fixed. You can rename them here.</p>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Slug</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Products</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {editing?.id === cat.id ? (
                    <form onSubmit={handleSave} className="flex gap-2">
                      <input value={name} onChange={e => setName(e.target.value)} required
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      <button type="submit" disabled={saving}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition">
                        {saving ? '...' : 'Save'}
                      </button>
                      <button type="button" onClick={() => setEditing(null)}
                        className="border border-gray-300 px-3 py-1 rounded-lg text-sm hover:bg-gray-50 transition">
                        Cancel
                      </button>
                    </form>
                  ) : cat.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{cat.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{cat._count?.products || 0}</td>
                <td className="px-6 py-4">
                  {editing?.id !== cat.id && (
                    <button onClick={() => handleEdit(cat)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Rename
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}