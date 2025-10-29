import React, { useState, useEffect } from "react";
import { Plus, Search, Ban, CheckCircle, Trash2, Loader, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [positionFilter, setPositionFilter] = useState("all");

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

  // Extract all unique positions from users
  const getAllPositions = () => {
    const allPositions = new Set();

    users.forEach(user => {
      if (user.position && Array.isArray(user.position)) {
        user.position.forEach(pos => {
          if (pos && pos !== 'N/A' && pos.trim() !== '') {
            allPositions.add(pos);
          }
        });
      }
      // Also check matchPosition field
      if (user.matchPosition && user.matchPosition !== 'N/A' && user.matchPosition.trim() !== '') {
        allPositions.add(user.matchPosition);
      }
    });

    return Array.from(allPositions).sort();
  };

  // Get position count for each position
  const getPositionCounts = () => {
    const counts = {};

    users.forEach(user => {
      // Count positions from position array
      if (user.position && Array.isArray(user.position)) {
        user.position.forEach(pos => {
          if (pos && pos !== 'N/A' && pos.trim() !== '') {
            counts[pos] = (counts[pos] || 0) + 1;
          }
        });
      }

      // Count matchPosition
      if (user.matchPosition && user.matchPosition !== 'N/A' && user.matchPosition.trim() !== '') {
        counts[user.matchPosition] = (counts[user.matchPosition] || 0) + 1;
      }
    });

    return counts;
  };

  // Filter users based on search term and position filter
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch =
      user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase());

    // Position filter
    const matchesPosition = positionFilter === "all" ||
      (user.position && Array.isArray(user.position) && user.position.includes(positionFilter)) ||
      user.matchPosition === positionFilter;

    return matchesSearch && matchesPosition;
  });

  // Get users by position for the counter
  const getUsersByPosition = (position) => {
    return users.filter(user =>
      (user.position && Array.isArray(user.position) && user.position.includes(position)) ||
      user.matchPosition === position
    );
  };

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

  // Format position display
  const formatPosition = (user) => {
    const positions = [];

    if (user.position && Array.isArray(user.position) && user.position.length > 0) {
      positions.push(...user.position.filter(pos => pos && pos !== 'N/A'));
    }

    if (user.matchPosition && user.matchPosition !== 'N/A') {
      positions.push(user.matchPosition);
    }

    return positions.length > 0 ? positions.join(', ') : 'Not specified';
  };

  const allPositions = getAllPositions();
  const positionCounts = getPositionCounts();

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
              {positionFilter !== "all" && ` in ${positionFilter} position`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${showFilters || positionFilter !== "all"
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {(positionFilter !== "all") && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                  {positionCounts[positionFilter] || 0}
                </span>
              )}
            </button>
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

        {/* Position Filter Section */}
        {showFilters && (
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Filter by Position</h3>
              <button
                onClick={() => {
                  setPositionFilter("all");
                  setShowFilters(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </button>
            </div>

            {/* Position Counters */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPositionFilter("all")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${positionFilter === "all"
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  All Positions ({users.length})
                </button>

                {allPositions.map(position => (
                  <button
                    key={position}
                    onClick={() => setPositionFilter(position)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${positionFilter === position
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {position}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${positionFilter === position
                        ? 'bg-emerald-400 text-white'
                        : 'bg-gray-200 text-gray-700'
                      }`}>
                      {positionCounts[position] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Position Statistics */}
            {positionFilter !== "all" && (
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {positionFilter} Position Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">
                      {getUsersByPosition(positionFilter).length}
                    </div>
                    <div className="text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {getUsersByPosition(positionFilter).filter(u => u.role === 'player').length}
                    </div>
                    <div className="text-gray-600">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {getUsersByPosition(positionFilter).filter(u => u.role === 'organizer').length}
                    </div>
                    <div className="text-gray-600">Organizers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {getUsersByPosition(positionFilter).filter(u => u.isBlocked === 'active').length}
                    </div>
                    <div className="text-gray-600">Active</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Phone</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Position</th>
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {formatPosition(user)}
                    </span>
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
              <p className="text-gray-500">
                {positionFilter !== "all"
                  ? `No users found for position "${positionFilter}"`
                  : "No users found"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;