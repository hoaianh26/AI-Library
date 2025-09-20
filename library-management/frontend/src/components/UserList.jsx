import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', password: '' });

  const { token } = useAuth();

  const API_URL = "http://localhost:5000";

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    // Filter out empty password field
    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      await fetchUsers(); // Refresh the user list
      handleModalClose();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 hover:bg-white/80">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
          User Management
        </h2>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/80 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all placeholder:text-slate-400 mb-6"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-slate-100/80">
                <th className="p-4 font-semibold text-slate-700">Name</th>
                <th className="p-4 font-semibold text-slate-700">Email</th>
                <th className="p-4 font-semibold text-slate-700">Role</th>
                <th className="p-4 font-semibold text-slate-700">Joined</th>
                <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className="border-b border-slate-200/80 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 text-slate-800">{user.name}</td>
                  <td className="p-4 text-slate-600">{user.email}</td>
                  <td className="p-4 text-slate-600">{user.role}</td>
                  <td className="p-4 text-slate-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleEditClick(user)}
                      disabled={user.role === 'admin'}
                      className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-3 py-2 rounded-lg hover:from-amber-200 hover:to-orange-200 transition-all duration-300 font-semibold text-xs shadow-sm disabled:from-slate-100 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 m-4">
            <form onSubmit={handleFormSubmit} className="p-8">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Edit User</h2>
                <button type="button" onClick={handleModalClose} className="w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 transition-all duration-200 text-slate-500 hover:text-slate-700 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/80" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/80" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                  <select name="role" value={formData.role} onChange={handleFormChange} className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/80">
                    <option value="student">student</option>
                    <option value="teacher">teacher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password (optional)</label>
                  <input type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder="Leave blank to keep current password" className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-white/80" />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl font-semibold">Update User</button>
                <button type="button" onClick={handleModalClose} className="px-6 bg-gradient-to-r from-slate-400 to-slate-500 text-white p-4 rounded-2xl font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UserList;
