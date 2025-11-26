import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


const TIER_COLORS = {
  bronze: "bg-amber-200 text-amber-800",
  silver: "bg-slate-200 text-slate-800",
  gold: "bg-yellow-200 text-yellow-800",
};

function UserList() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', password: '' });
  const [membershipEdit, setMembershipEdit] = useState({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { token } = useAuth();

  const API_URL = "http://localhost:5000";

  const fetchUsers = async (currentPage, currentSearch, currentSort) => {
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 10,
            search: currentSearch,
            sort: currentSort.key,
            order: currentSort.direction === 'ascending' ? 'asc' : 'desc'
        });

      const res = await fetch(`${API_URL}/api/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data.users);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (token) {
      // Reset to page 1 whenever search or sort changes
      if (page !== 1) setPage(1);
      else fetchUsers(1, debouncedSearchTerm, sortConfig);
    }
  }, [token, debouncedSearchTerm, sortConfig]);

  useEffect(() => {
      if(token) {
        fetchUsers(page, debouncedSearchTerm, sortConfig);
      }
  }, [page, token]);


  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


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

      await fetchUsers(page, debouncedSearchTerm, sortConfig);
      handleModalClose();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleMembershipChange = (userId, field, value) => {
    setMembershipEdit(prev => {
      const currentUser = users.find(u => u._id === userId);
      const existingEdit = prev[userId] || {};
      
      return {
        ...prev,
        [userId]: {
          ...existingEdit,
          tier: existingEdit.tier || currentUser?.membershipTier,
          [field]: value,
        },
      };
    });
  };

  const handleMembershipSave = async (userId) => {
    const editData = membershipEdit[userId];
    if (!editData || !editData.tier) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/membership`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier: editData.tier,
          expiresInDays: editData.expiresInDays || 0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update membership');
      }
      
      await fetchUsers(page, debouncedSearchTerm, sortConfig);
      
      setMembershipEdit(prev => {
        const newEdit = { ...prev };
        delete newEdit[userId];
        return newEdit;
      });

    } catch (error) {
      console.error('Error updating membership:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

    const Pagination = ({ page, pages, onPageChange }) => {
    if (pages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          Previous
        </button>
        <span className="text-slate-600 font-semibold">
          Page {page} of {pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
        >
          Next
        </button>
      </div>
    );
  };


  return (
    <>
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 hover:bg-white/80">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              User Management ({total} Users)
            </h2>
        </div>
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
                <th className="p-4 font-semibold text-slate-700">
                  <button onClick={() => requestSort('name')} className="w-full text-left">Name{getSortIndicator('name')}</button>
                </th>
                <th className="p-4 font-semibold text-slate-700">
                  <button onClick={() => requestSort('email')} className="w-full text-left">Email{getSortIndicator('email')}</button>
                </th>
                <th className="p-4 font-semibold text-slate-700">
                   <button onClick={() => requestSort('role')} className="w-full text-left">Role{getSortIndicator('role')}</button>
                </th>
                <th className="p-4 font-semibold text-slate-700">
                  <button onClick={() => requestSort('membershipTier')} className="w-full text-left">Membership{getSortIndicator('membershipTier')}</button>
                </th>
                <th className="p-4 font-semibold text-slate-700">
                  <button onClick={() => requestSort('createdAt')} className="w-full text-left">Joined{getSortIndicator('createdAt')}</button>
                </th>
                <th className="p-4 font-semibold text-slate-700">Membership Actions</th>
                <th className="p-4 font-semibold text-slate-700 text-right">User Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b border-slate-200/80 hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 text-slate-800">{user.name}</td>
                  <td className="p-4 text-slate-600">{user.email}</td>
                  <td className="p-4 text-slate-600">{user.role}</td>
                  <td className="p-4 text-slate-600">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${TIER_COLORS[user.membershipTier] || 'bg-gray-200 text-gray-800'}`}>
                      {user.membershipTier || 'N/A'}
                    </span>
                    <div className="text-xs text-slate-500 mt-1">
                      {user.membershipExpiresAt ? `Expires: ${new Date(user.membershipExpiresAt).toLocaleDateString()}` : 'Permanent'}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 space-y-2">
                    {user.role !== 'admin' && (
                      <>
                        <select 
                          value={membershipEdit[user._id]?.tier || user.membershipTier}
                          onChange={(e) => handleMembershipChange(user._id, 'tier', e.target.value)}
                          className="w-full border-slate-300 rounded-md text-sm p-1"
                        >
                          <option value="bronze">Bronze</option>
                          <option value="silver">Silver</option>
                          <option value="gold">Gold</option>
                        </select>
                        <input 
                          type="number"
                          placeholder="Days (blank = permanent)"
                          value={membershipEdit[user._id]?.expiresInDays || ''}
                          onChange={(e) => handleMembershipChange(user._id, 'expiresInDays', e.target.value)}
                          className="w-full border-slate-300 rounded-md text-sm p-1 placeholder:text-slate-400"
                        />
                        <button
                          onClick={() => handleMembershipSave(user._id)}
                          disabled={!membershipEdit[user._id]}
                          className="w-full bg-indigo-500 text-white px-2 py-1 rounded-md text-xs font-semibold hover:bg-indigo-600 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                          Save
                        </button>
                      </>
                    )}
                  </td>
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
        <Pagination page={page} pages={pages} onPageChange={setPage} />
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
                    <option value="user">user</option>
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
