import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Plus, Search, Loader, Ban, CheckCircle, X, User } from 'lucide-react';
import AddOrganizer from './AddOrganizer';
import toast from 'react-hot-toast';

const Organizers = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch organizers from API
  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('https://api.toptopfootball.com/api/v1/auth/all-player', {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organizers');
      }

      const result = await response.json();

      if (result.success) {
        // Filter only organizers from the response
        const organizersData = result.data.filter(user => user.role === 'organizer');
        setOrganizers(organizersData);
      } else {
        toast.error(result.message || 'Failed to fetch organizers');
      }
    } catch (error) {
      console.error('Error fetching organizers:', error);
      toast.error('Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (organizerId, organizerName) => {
    if (!window.confirm(`Are you sure you want to delete organizer "${organizerName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(`delete-${organizerId}`);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`https://api.toptopfootball.com/api/v1/auth/delete-player/${organizerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete organizer');
      }

      const result = await response.json();

      if (result.success) {
        setOrganizers(organizers.filter(organizer => organizer._id !== organizerId));
        toast.success('Organizer deleted successfully');
      } else {
        toast.error(result.message || 'Failed to delete organizer');
      }
    } catch (error) {
      console.error('Error deleting organizer:', error);
      toast.error('Failed to delete organizer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockToggle = async (organizerId, currentStatus) => {
    setActionLoading(`block-${organizerId}`);

    try {
      const token = localStorage.getItem('accessToken');
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

      const response = await fetch(`https://api.toptopfootball.com/api/v1/auth/update-status/${organizerId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBlocked: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update organizer status');
      }

      const result = await response.json();

      if (result.success) {
        setOrganizers(organizers.map(organizer =>
          organizer._id === organizerId
            ? { ...organizer, isBlocked: newStatus }
            : organizer
        ));

        toast.success(`Organizer ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
      } else {
        toast.error(result.message || 'Failed to update organizer status');
      }
    } catch (error) {
      console.error('Error updating organizer status:', error);
      toast.error('Failed to update organizer status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (organizer) => {
    setSelectedOrganizer(organizer);
    setShowDetailsModal(true);
  };



  // Filter organizers based on search term
  const filteredOrganizers = organizers.filter(organizer =>
    organizer.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge color
  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-red-100 text-red-800 border border-red-200';
  };

  // Get role badge color and icon
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'organizer':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'player':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Format role for display
  const formatRole = (role) => {
    if (!role) return 'Unknown';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Format array data for display
  const formatArrayData = (data) => {
    if (!data || data.length === 0) return 'Not specified';
    return data.join(', ');
  };

  if (showAdd) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 flex items-center justify-center">
        <AddOrganizer
          onClose={() => setShowAdd(false)}
          onOrganizerAdded={fetchOrganizers}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-green-500" />
          <span className="text-gray-600">Loading organizers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-black">Organizers</h1>
          <p className="text-sm text-gray-600 mt-1">
            Total {filteredOrganizers.length} organizer{filteredOrganizers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4" />
            Add Organizer
          </button>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search organizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Name</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Email</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Phone</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Role</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredOrganizers.map((organizer) => (
              <tr key={organizer._id} className="border-b border-gray-100 hover:bg-gray-50">
                {/* Name with Avatar */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src={organizer.imageUrl || '/default-avatar.png'}
                      alt={organizer.FullName}
                      className="w-10 h-10 rounded-full object-cover border"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div>
                      <span className="text-sm font-medium text-black block">{organizer.FullName}</span>
                      {organizer.userName && organizer.userName !== 'N/A' && (
                        <span className="text-xs text-gray-500">@{organizer.userName}</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-600">{organizer.email}</span>
                </td>

                {/* Phone */}
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-600">
                    {organizer.mobile && organizer.mobile !== 'N/A' ? organizer.mobile : 'Not provided'}
                  </span>
                </td>

                {/* Role */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(organizer.role)}`}>
                      <User className="w-3 h-3 mr-1" />
                      {formatRole(organizer.role)}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(organizer.isBlocked)}`}>
                    {organizer.isBlocked === 'active' ? 'Active' : 'Blocked'}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    {/* View Details Button */}
                    <button
                      onClick={() => handleViewDetails(organizer)}
                      className="p-2 rounded-md hover:bg-blue-50 transition-colors text-blue-600"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Block/Unblock Button */}
                    <button
                      onClick={() => handleBlockToggle(organizer._id, organizer.isBlocked)}
                      disabled={actionLoading === `block-${organizer._id}`}
                      className={`p-2 rounded-md transition-colors ${organizer.isBlocked === 'active'
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-green-600 hover:bg-green-50'
                        } ${actionLoading === `block-${organizer._id}` ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={organizer.isBlocked === 'active' ? 'Block organizer' : 'Unblock organizer'}
                    >
                      {actionLoading === `block-${organizer._id}` ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : organizer.isBlocked === 'active' ? (
                        <Ban className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(organizer._id, organizer.FullName)}
                      disabled={actionLoading === `delete-${organizer._id}`}
                      className="p-2 rounded-md hover:bg-red-50 transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete organizer"
                    >
                      {actionLoading === `delete-${organizer._id}` ? (
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

        {filteredOrganizers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No organizers found</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedOrganizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Organizer Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <img
                  src={selectedOrganizer.imageUrl || '/default-avatar.png'}
                  alt={selectedOrganizer.FullName}
                  className="w-20 h-20 rounded-full object-cover border"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedOrganizer.FullName}</h3>
                  <p className="text-gray-600">{selectedOrganizer.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedOrganizer.role)}`}>
                      <User className="w-3 h-3 mr-1" />
                      {formatRole(selectedOrganizer.role)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrganizer.isBlocked)}`}>
                      {selectedOrganizer.isBlocked === 'active' ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <p className="text-gray-900">{selectedOrganizer.userName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedOrganizer.mobile || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Age</label>
                    <p className="text-gray-900">{selectedOrganizer.age || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nationality</label>
                    <p className="text-gray-900">{selectedOrganizer.nationality || 'Not specified'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Game Mode</label>
                    <p className="text-gray-900">{selectedOrganizer.gameMode || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preferred Areas</label>
                    <p className="text-gray-900">{selectedOrganizer.preferredAreas || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Playing Days</label>
                    <p className="text-gray-900">{formatArrayData(selectedOrganizer.playingDays)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Positions</label>
                    <p className="text-gray-900">{formatArrayData(selectedOrganizer.position)}</p>
                  </div>
                </div>
              </div>



            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizers;