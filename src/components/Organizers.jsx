/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Plus, Search, Loader, Ban, CheckCircle, X, User, Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
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
  const [matches, setMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

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

  // Fetch matches for selected organizer
  const fetchOrganizerMatches = async (organizerId) => {
    setMatchLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      // This endpoint would need to be created in your backend
      const response = await fetch(`https://api.toptopfootball.com/api/v1/matches/organizer/${organizerId}`, {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const result = await response.json();

      if (result.success) {
        setMatches(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch matches');
        // Mock data for demonstration
        setMatches(getMockMatches());
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Mock data for demonstration
      setMatches(getMockMatches());
    } finally {
      setMatchLoading(false);
    }
  };

  // Mock matches data for demonstration
  const getMockMatches = () => {
    return {
      upcoming: [
        {
          id: 1,
          teamName: 'Raging Bulls FC',
          location: 'New Westbury',
          time: '05:45 PM',
          duration: '80 Minutes',
          format: '7v7',
          league: 'S13',
          joined: 5,
          total: 16,
          date: '2025-07-30'
        },
        {
          id: 2,
          teamName: 'Thunder Strikers',
          location: 'Central Park',
          time: '07:30 PM',
          duration: '90 Minutes',
          format: '11v11',
          league: 'Premier',
          joined: 11,
          total: 22,
          date: '2025-08-02'
        }
      ],
      history: [
        {
          id: 3,
          date: '2025-07-22',
          teamName: 'Thunder Strikers',
          result: 'W 3-2',
          location: 'New Westbury'
        },
        {
          id: 4,
          date: '2025-07-18',
          teamName: 'Red Dragons',
          result: 'L 1-4',
          location: 'Central Park'
        },
        {
          id: 5,
          date: '2025-07-15',
          teamName: 'Blue Tigers',
          result: 'D 2-2',
          location: 'East Field'
        }
      ]
    };
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
    fetchOrganizerMatches(organizer._id);
    setShowDetailsModal(true);
  };

  const handleAssignMatch = () => {
    setShowAssignModal(true);
    // Here you would fetch available lobbies/matches
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

      {/* Organizer Details Modal */}
      {showDetailsModal && selectedOrganizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <img
                  src={selectedOrganizer.imageUrl || '/default-avatar.png'}
                  alt={selectedOrganizer.FullName}
                  className="w-12 h-12 rounded-full object-cover border"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedOrganizer.FullName}</h2>
                  <p className="text-gray-600">{selectedOrganizer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Assign Match Button */}
              <div className="mb-8">
                <button
                  onClick={handleAssignMatch}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Assign New Match
                </button>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Collection</p>
                      <p className="text-2xl font-bold text-gray-900">$45,023</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Upcoming Matches</p>
                      <p className="text-2xl font-bold text-gray-900">{matches.upcoming?.length || 0}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Match History</p>
                      <p className="text-2xl font-bold text-gray-900">{matches.history?.length || 0}</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Matches */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Matches</h3>
                {matchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-green-500" />
                  </div>
                ) : matches.upcoming && matches.upcoming.length > 0 ? (
                  <div className="space-y-4">
                    {matches.upcoming.map((match) => (
                      <div key={match.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{match.teamName}</h4>
                          <span className="text-sm text-gray-600">{match.date}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{match.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{match.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{match.format}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">League: {match.league}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-gray-600">Duration: {match.duration}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-green-600">{match.joined}/{match.total} joined</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No upcoming matches</p>
                  </div>
                )}
              </div>

              {/* Match History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Match History</h3>
                {matchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-green-500" />
                  </div>
                ) : matches.history && matches.history.length > 0 ? (
                  <div className="space-y-3">
                    {matches.history.map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-500 min-w-[100px]">{match.date}</div>
                          <div className="font-medium text-gray-900">{match.teamName}</div>
                          <div className="text-sm text-gray-600">{match.location}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${match.result.startsWith('W')
                            ? 'bg-green-100 text-green-800'
                            : match.result.startsWith('L')
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {match.result}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No match history</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Match Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Assign Match to {selectedOrganizer?.FullName}</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Match
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                    <option value="">Select a match</option>
                    <option value="match1">Raging Bulls FC vs Thunder Strikers</option>
                    <option value="match2">Red Dragons vs Blue Tigers</option>
                    <option value="match3">Golden Eagles vs Silver Hawks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Lobby
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                    <option value="">Select a lobby</option>
                    <option value="lobby1">Premier League Lobby</option>
                    <option value="lobby2">Championship Lobby</option>
                    <option value="lobby3">Friendly Match Lobby</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Match assigned successfully');
                  setShowAssignModal(false);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Assign Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizers;