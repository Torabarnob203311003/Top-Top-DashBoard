import React, { useState, useEffect } from "react";
import { Plus, Search, Ban, CheckCircle, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/v1/auth/all-player', {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (userId, currentStatus) => {
    setActionLoading(`block-${userId}`);

    try {
      const token = localStorage.getItem('accessToken');
      const newStatus = currentStatus === 'active' ? 'block' : 'active';

      const response = await fetch(`http://localhost:5000/api/v1/auth/update-status/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBlocked: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        setUsers(users.map(user =>
          user._id === userId
            ? { ...user, isBlocked: newStatus }
            : user
        ));

        toast.success(`User ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
      } else {
        toast.error(result.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(`delete-${userId}`);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/v1/auth/delete-player/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      const result = await response.json();

      if (result.success) {
        // Remove user from local state
        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      } else {
        toast.error(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  // const handleAddUser = () => {
  //   console.log('Add new user');
  // };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge color
  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  // Get role badge color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'organizer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'player':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-emerald-500" />
          <span className="text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <button
              onClick={handleAddUser}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button> */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Phone</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.imageUrl || '/default-avatar.png'}
                        alt={user.FullName}
                        className="w-10 h-10 rounded-full object-cover border"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{user.FullName}</div>
                        {user.userName && user.userName !== 'N/A' && (
                          <div className="text-sm text-gray-500">@{user.userName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{user.email}</td>
                  <td className="py-4 px-6 text-gray-600">
                    {user.mobile && user.mobile !== 'N/A' ? user.mobile : 'Not provided'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.isBlocked)}`}>
                      {user.isBlocked === 'active' ? 'active' : 'block'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {/* Block/Unblock Button */}
                      <button
                        onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                        disabled={actionLoading === `block-${user._id}`}
                        className={`p-2 rounded-lg transition-colors ${user.isBlocked === 'active'
                            ? 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
                            : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                          } ${actionLoading === `block-${user._id}` ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={user.isBlocked === 'active' ? 'Block user' : 'Unblock user'}
                      >
                        {actionLoading === `block-${user._id}` ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : user.isBlocked === 'active' ? (
                          <Ban className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(user._id, user.FullName)}
                        disabled={actionLoading === `delete-${user._id}`}
                        className={`p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${actionLoading === `delete-${user._id}` ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        title="Delete user"
                      >
                        {actionLoading === `delete-${user._id}` ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;