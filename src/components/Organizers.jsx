/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Plus, Search, Loader, Ban, CheckCircle, X, User, Calendar, Clock, MapPin, Users, ChevronRight, Trophy, Target, Shield, Gamepad2, Crown, DollarSign, CheckCircle2, Clock3 } from 'lucide-react';
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
  const [lobbyData, setLobbyData] = useState({ upcomingLobby: [], completeLobby: [], totalEarning: 0 });
  const [matchLoading, setMatchLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableLobbies, setAvailableLobbies] = useState([]);
  const [selectedLobbyId, setSelectedLobbyId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'completed'

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

  // Fetch lobbies for selected organizer
  const fetchOrganizerLobbies = async (organizerId) => {
    setMatchLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`https://api.toptopfootball.com/api/v1/lobby/organizer-lobby/${organizerId}`, {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lobbies');
      }

      const result = await response.json();

      if (result.success) {
        console.log('Lobby Data:', result.data); // Debug log
        setLobbyData({
          upcomingLobby: result.data.upcomingLobby || [],
          completeLobby: result.data.completeLobby || [],
          totalEarning: result.data.totalEarning || 0
        });
      } else {
        toast.error(result.message || 'Failed to fetch lobbies');
      }
    } catch (error) {
      console.error('Error fetching lobbies:', error);
      toast.error('Failed to load lobby data');
    } finally {
      setMatchLoading(false);
    }
  };

  // Fetch available lobbies for assignment
  const fetchAvailableLobbies = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('https://api.toptopfootball.com/api/v1/lobby/all-match', {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lobbies');
      }

      const result = await response.json();

      if (result.success) {
        // Filter lobbies that don't have an organizer or have different organizer
        const filteredLobbies = result.data.filter(lobby =>
          !lobby.organizer || lobby.organizer !== selectedOrganizer?._id
        );
        console.log('Available Lobbies:', filteredLobbies); // Debug log
        setAvailableLobbies(filteredLobbies);
      } else {
        toast.error(result.message || 'Failed to fetch available lobbies');
      }
    } catch (error) {
      console.error('Error fetching lobbies:', error);
      toast.error('Failed to load available lobbies');
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
    setActiveTab('upcoming'); // Reset to upcoming tab
    fetchOrganizerLobbies(organizer._id);
    setShowDetailsModal(true);
  };

  const handleAssignMatch = async () => {
    setShowAssignModal(true);
    await fetchAvailableLobbies();
  };

  const handleAssignLobby = async () => {
    if (!selectedLobbyId) {
      toast.error('Please select a lobby');
      return;
    }

    setAssignLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`https://api.toptopfootball.com/api/v1/lobby/assign-lobby/${selectedOrganizer._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lobbyId: selectedLobbyId })
      });

      if (!response.ok) {
        throw new Error('Failed to assign lobby');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Lobby assigned successfully');
        setShowAssignModal(false);
        setSelectedLobbyId('');
        // Refresh lobby data
        fetchOrganizerLobbies(selectedOrganizer._id);
      } else {
        toast.error(result.message || 'Failed to assign lobby');
      }
    } catch (error) {
      console.error('Error assigning lobby:', error);
      toast.error('Failed to assign lobby');
    } finally {
      setAssignLoading(false);
    }
  };

  // Helper function to get team details based on match type
  const getTeamDetails = (lobby) => {
    if (lobby.matchType === 'teams') {
      // Team match - check if team1 and team2 exist with teamId
      const team1Name = lobby.team1?.teamId?.teamName || 'Team X';
      const team2Name = lobby.team2?.teamId?.teamName || 'Team Y';
      const team1Image = lobby.team1?.teamId?.image || '/default-team.png';
      const team2Image = lobby.team2?.teamId?.image || '/default-team.png';

      return {
        team1Name,
        team2Name,
        team1Image,
        team2Image,
        isTeams: true
      };
    } else {
      // Solo match - use defaultTeam
      const team1Name = lobby.defaultTeam1?.teamName || 'Team X';
      const team2Name = lobby.defaultTeam2?.teamName || 'Team Y';

      return {
        team1Name,
        team2Name,
        team1Image: null,
        team2Image: null,
        isTeams: false
      };
    }
  };

  // Calculate total joined players
  const calculateTotalPlayers = (lobby) => {
    if (lobby.matchType === 'teams') {
      const team1Players = lobby.team1?.players?.length || 0;
      const team2Players = lobby.team2?.players?.length || 0;
      return team1Players + team2Players;
    } else {
      const defaultTeam1Players = lobby.defaultTeam1?.players?.length || 0;
      const defaultTeam2Players = lobby.defaultTeam2?.players?.length || 0;
      return defaultTeam1Players + defaultTeam2Players;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format date and time for completed lobbies
  const formatDateTime = (dateString, timeString) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })} • ${timeString}`;
    } catch (error) {
      return `${dateString} • ${timeString}`;
    }
  };

  // Get lobby type badge color
  const getLobbyTypeColor = (type) => {
    switch (type) {
      case 'teams':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'solo':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get privacy badge color
  const getPrivacyColor = (privacy) => {
    switch (privacy) {
      case 'public':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'private':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-red-100 text-red-800 border border-red-200';
  };

  // Get result badge color
  const getResultColor = (goalTeam1, goalTeam2, teamIndex = 1) => {
    if (goalTeam1 > goalTeam2) {
      return teamIndex === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    } else if (goalTeam1 < goalTeam2) {
      return teamIndex === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
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

  // Filter organizers based on search term
  const filteredOrganizers = organizers.filter(organizer =>
    organizer.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
            <Gamepad2 className="w-8 h-8 text-green-500 absolute inset-0 m-auto" />
          </div>
          <span className="text-gray-600 font-medium">Loading organizers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Organizers</h1>
          <p className="text-sm text-gray-600 mt-1 md:mt-2">
            Total {filteredOrganizers.length} organizer{filteredOrganizers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          <button
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl w-full md:w-auto justify-center"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-5 h-5" />
            Add Organizer
          </button>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search organizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none w-full bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Phone</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100">
              {filteredOrganizers.map((organizer) => (
                <tr key={organizer._id} className="hover:bg-gray-50 transition-colors duration-150">
                  {/* Name with Avatar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={organizer.imageUrl || '/default-avatar.png'}
                          alt={organizer.FullName}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                        {organizer.role === 'admin' && (
                          <div className="absolute -top-1 -right-1 bg-purple-500 text-white p-1 rounded-full">
                            <Crown className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block">{organizer.FullName}</span>
                        {organizer.userName && organizer.userName !== 'N/A' && (
                          <span className="text-xs text-gray-500">@{organizer.userName}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">{organizer.email}</span>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">
                      {organizer.mobile && organizer.mobile !== 'N/A' ? organizer.mobile : 'Not provided'}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getRoleColor(organizer.role)}`}>
                        <User className="w-3 h-3 mr-1.5" />
                        {formatRole(organizer.role)}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(organizer.isBlocked)}`}>
                      {organizer.isBlocked === 'active' ? 'Active' : 'Blocked'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDetails(organizer)}
                        className="p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 text-blue-600 hover:shadow-md"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Block/Unblock Button */}
                      <button
                        onClick={() => handleBlockToggle(organizer._id, organizer.isBlocked)}
                        disabled={actionLoading === `block-${organizer._id}`}
                        className={`p-2 rounded-lg transition-all duration-200 hover:shadow-md ${organizer.isBlocked === 'active'
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
                        className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200 text-red-600 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No organizers found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>

      {/* Organizer Details Modal */}
      {showDetailsModal && selectedOrganizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={selectedOrganizer.imageUrl || '/default-avatar.png'}
                      alt={selectedOrganizer.FullName}
                      className="w-16 h-16 rounded-xl object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                      <Trophy className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedOrganizer.FullName}</h2>
                    <p className="text-gray-600">{selectedOrganizer.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getRoleColor(selectedOrganizer.role)}`}>
                        {formatRole(selectedOrganizer.role)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getStatusColor(selectedOrganizer.isBlocked)}`}>
                        {selectedOrganizer.isBlocked === 'active' ? 'Active' : 'Blocked'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Assign Match Button */}
              <div className="mb-8">
                <button
                  onClick={handleAssignMatch}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Assign New Lobby
                </button>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Earnings</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        AED {lobbyData.totalEarning ? lobbyData.totalEarning.toLocaleString() : '0'}
                      </p>
                      {lobbyData.totalEarning && (
                        <p className="text-xs text-blue-500 mt-1">
                          ${(lobbyData.totalEarning * 0.27).toFixed(2)} USD
                        </p>
                      )}
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Upcoming Lobbies</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{lobbyData.upcomingLobby?.length || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Completed Lobbies</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{lobbyData.completeLobby?.length || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <CheckCircle2 className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lobby Tabs */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('upcoming')}
                      className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${activeTab === 'upcoming'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <Clock3 className="w-4 h-4" />
                      Upcoming Lobbies
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === 'upcoming'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {lobbyData.upcomingLobby?.length || 0}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('completed')}
                      className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${activeTab === 'completed'
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Completed Lobbies
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === 'completed'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {lobbyData.completeLobby?.length || 0}
                      </span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Lobby Content */}
              {matchLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
                      <Target className="w-8 h-8 text-green-500 absolute inset-0 m-auto" />
                    </div>
                    <p className="text-gray-600 mt-4">Loading lobbies...</p>
                  </div>
                </div>
              ) : activeTab === 'upcoming' ? (
                <div>
                  {lobbyData.upcomingLobby && lobbyData.upcomingLobby.length > 0 ? (
                    <div className="space-y-4">
                      {lobbyData.upcomingLobby.map((lobby) => {
                        const teamDetails = getTeamDetails(lobby);
                        const totalPlayers = calculateTotalPlayers(lobby);

                        return (
                          <div key={lobby._id} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="text-lg font-bold text-gray-900">{lobby.title}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getLobbyTypeColor(lobby.matchType)}`}>
                                      {lobby.matchType === 'teams' ? 'Team Match' : 'Solo Match'}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getPrivacyColor(lobby.matchPrivacy)}`}>
                                      {lobby.matchPrivacy}
                                    </span>
                                    {lobby.privateKey && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                        Key: {lobby.privateKey}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.location?.address}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.time}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{formatDate(lobby.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.teamSize}v{lobby.teamSize}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">AED {lobby.price}</div>
                                <div className="text-sm text-gray-500">per player</div>
                              </div>
                            </div>

                            {/* Teams Display */}
                            <div className="mt-6">
                              <div className="flex items-center justify-center gap-6">
                                {/* Team 1 */}
                                <div className="flex-1 text-center">
                                  {teamDetails.isTeams ? (
                                    <div className="flex flex-col items-center">
                                      {teamDetails.team1Image && (
                                        <img
                                          src={teamDetails.team1Image}
                                          alt={teamDetails.team1Name}
                                          className="w-16 h-16 rounded-xl object-cover border-2 border-blue-200 mb-2 shadow-sm"
                                          onError={(e) => {
                                            e.target.src = '/default-team.png';
                                          }}
                                        />
                                      )}
                                      <span className="font-semibold text-gray-900">{teamDetails.team1Name}</span>
                                      {lobby.matchType === 'teams' && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {lobby.team1?.teamId?.userName || ''}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                                      <span className="font-bold text-gray-900 text-lg">{teamDetails.team1Name}</span>
                                      <p className="text-xs text-gray-500 mt-1">Default Team</p>
                                    </div>
                                  )}
                                </div>

                                {/* VS */}
                                <div className="px-4">
                                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-bold px-4 py-2 rounded-full">
                                    VS
                                  </div>
                                </div>

                                {/* Team 2 */}
                                <div className="flex-1 text-center">
                                  {teamDetails.isTeams ? (
                                    <div className="flex flex-col items-center">
                                      {teamDetails.team2Image && (
                                        <img
                                          src={teamDetails.team2Image}
                                          alt={teamDetails.team2Name}
                                          className="w-16 h-16 rounded-xl object-cover border-2 border-red-200 mb-2 shadow-sm"
                                          onError={(e) => {
                                            e.target.src = '/default-team.png';
                                          }}
                                        />
                                      )}
                                      <span className="font-semibold text-gray-900">{teamDetails.team2Name}</span>
                                      {lobby.matchType === 'teams' && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {lobby.team2?.teamId?.userName || ''}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl">
                                      <span className="font-bold text-gray-900 text-lg">{teamDetails.team2Name}</span>
                                      <p className="text-xs text-gray-500 mt-1">Default Team</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                  <div className="text-gray-500">Duration</div>
                                  <div className="font-medium text-gray-900">{lobby.matchTime}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-500">Joined</div>
                                  <div className="font-medium text-gray-900">{totalPlayers}/{lobby.maxSlot}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-500">Format</div>
                                  <div className="font-medium text-gray-900">
                                    {lobby.matchType === 'teams' ? 'Team vs Team' : 'Solo Players'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-500">Status</div>
                                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${lobby.lobbyStatus === 'ongoing' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {lobby.lobbyStatus || 'Upcoming'}
                                  </div>
                                </div>
                              </div>

                              {/* Additional Features */}
                              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center">
                                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg ${lobby.goalkeeper ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    <span className="text-xs">GK:</span>
                                    <span className="font-medium">{lobby.goalkeeper ? 'Yes' : 'No'}</span>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg ${lobby.referee ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    <span className="text-xs">Referee:</span>
                                    <span className="font-medium">{lobby.referee ? 'Yes' : 'No'}</span>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg ${lobby.camera ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    <span className="text-xs">Camera:</span>
                                    <span className="font-medium">{lobby.camera ? 'Yes' : 'No'}</span>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg ${lobby.matchPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    <span className="text-xs">Published:</span>
                                    <span className="font-medium">{lobby.matchPublished ? 'Yes' : 'No'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Note */}
                              {lobby.note && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">{lobby.note}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-sm">
                        <Clock3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-lg">No upcoming lobbies</p>
                      <p className="text-gray-400 text-sm mt-1">Assign new lobbies to this organizer</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Completed Lobbies */}
                  {lobbyData.completeLobby && lobbyData.completeLobby.length > 0 ? (
                    <div className="space-y-4">
                      {lobbyData.completeLobby.map((lobby) => {
                        const teamDetails = getTeamDetails(lobby);
                        const totalPlayers = calculateTotalPlayers(lobby);

                        return (
                          <div key={lobby._id} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="text-lg font-bold text-gray-900">{lobby.title}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getLobbyTypeColor(lobby.matchType)}`}>
                                      {lobby.matchType === 'teams' ? 'Team Match' : 'Solo Match'}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getPrivacyColor(lobby.matchPrivacy)}`}>
                                      {lobby.matchPrivacy}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                      Completed
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.location?.address}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.time}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{formatDate(lobby.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.teamSize}v{lobby.teamSize}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-2xl font-bold text-orange-600">AED {lobby.price}</div>
                                <div className="text-sm text-gray-500">per player</div>
                              </div>
                            </div>

                            {/* Teams Display with Results */}
                            <div className="mt-6">
                              <div className="flex items-center justify-center gap-6">
                                {/* Team 1 */}
                                <div className="flex-1 text-center">
                                  {teamDetails.isTeams ? (
                                    <div className="flex flex-col items-center">
                                      {teamDetails.team1Image && (
                                        <img
                                          src={teamDetails.team1Image}
                                          alt={teamDetails.team1Name}
                                          className="w-16 h-16 rounded-xl object-cover border-2 border-blue-200 mb-2 shadow-sm"
                                          onError={(e) => {
                                            e.target.src = '/default-team.png';
                                          }}
                                        />
                                      )}
                                      <span className="font-semibold text-gray-900">{teamDetails.team1Name}</span>
                                      <div className={`mt-2 px-3 py-1 rounded-lg text-sm font-medium ${getResultColor(lobby.goalTeam1, lobby.goalTeam2, 1)}`}>
                                        {lobby.goalTeam1}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                                      <span className="font-bold text-gray-900 text-lg">{teamDetails.team1Name}</span>
                                      <div className={`mt-2 px-3 py-1 rounded-lg text-sm font-medium ${getResultColor(lobby.goalTeam1, lobby.goalTeam2, 1)}`}>
                                        {lobby.goalTeam1}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* VS */}
                                <div className="px-4">
                                  <div className="text-gray-400 font-bold text-xl">VS</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {formatDateTime(lobby.date, lobby.time)}
                                  </div>
                                </div>

                                {/* Team 2 */}
                                <div className="flex-1 text-center">
                                  {teamDetails.isTeams ? (
                                    <div className="flex flex-col items-center">
                                      {teamDetails.team2Image && (
                                        <img
                                          src={teamDetails.team2Image}
                                          alt={teamDetails.team2Name}
                                          className="w-16 h-16 rounded-xl object-cover border-2 border-red-200 mb-2 shadow-sm"
                                          onError={(e) => {
                                            e.target.src = '/default-team.png';
                                          }}
                                        />
                                      )}
                                      <span className="font-semibold text-gray-900">{teamDetails.team2Name}</span>
                                      <div className={`mt-2 px-3 py-1 rounded-lg text-sm font-medium ${getResultColor(lobby.goalTeam1, lobby.goalTeam2, 2)}`}>
                                        {lobby.goalTeam2}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl">
                                      <span className="font-bold text-gray-900 text-lg">{teamDetails.team2Name}</span>
                                      <div className={`mt-2 px-3 py-1 rounded-lg text-sm font-medium ${getResultColor(lobby.goalTeam1, lobby.goalTeam2, 2)}`}>
                                        {lobby.goalTeam2}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Match Result */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                              <div className="flex items-center justify-center">
                                <div className={`px-4 py-2 rounded-lg text-lg font-bold ${lobby.goalTeam1 > lobby.goalTeam2
                                    ? 'bg-green-100 text-green-800'
                                    : lobby.goalTeam1 < lobby.goalTeam2
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {lobby.goalTeam1 > lobby.goalTeam2
                                    ? `${teamDetails.team1Name} Wins!`
                                    : lobby.goalTeam1 < lobby.goalTeam2
                                      ? `${teamDetails.team2Name} Wins!`
                                      : 'Match Drawn'}
                                </div>
                              </div>

                              {/* Additional Info */}
                              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                  <div className="text-gray-500">Duration</div>
                                  <div className="font-medium text-gray-900">{lobby.matchTime}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-500">Total Players</div>
                                  <div className="font-medium text-gray-900">{totalPlayers}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-500">Format</div>
                                  <div className="font-medium text-gray-900">
                                    {lobby.matchType === 'teams' ? 'Team vs Team' : 'Solo Players'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-500">Earnings</div>
                                  <div className="font-medium text-green-700">AED {lobby.price * totalPlayers}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-sm">
                        <CheckCircle2 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-lg">No completed lobbies</p>
                      <p className="text-gray-400 text-sm mt-1">This organizer hasn't completed any lobbies yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Lobby Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Assign Lobby</h2>
                <p className="text-gray-600 text-sm mt-1">Select a lobby to assign to {selectedOrganizer?.FullName}</p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedLobbyId('');
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Lobbies
                  </label>
                  {availableLobbies.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {availableLobbies.map((lobby) => {
                        const teamDetails = getTeamDetails(lobby);
                        return (
                          <div
                            key={lobby._id}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedLobbyId === lobby._id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                              }`}
                            onClick={() => setSelectedLobbyId(lobby._id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{lobby.title}</span>
                              <span className="text-green-600 font-bold">AED {lobby.price}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {teamDetails.team1Name} vs {teamDetails.team2Name}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{formatDate(lobby.date)}</span>
                              <span>•</span>
                              <span>{lobby.location?.address}</span>
                              <span>•</span>
                              <span className={`px-2 py-0.5 rounded ${getLobbyTypeColor(lobby.matchType)}`}>
                                {lobby.matchType}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                        <Target className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No available lobbies</p>
                      <p className="text-gray-400 text-sm mt-1">All lobbies are already assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedLobbyId('');
                }}
                className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                disabled={assignLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignLobby}
                disabled={assignLoading || !selectedLobbyId}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Assigning...
                  </span>
                ) : (
                  'Assign Lobby'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizers;