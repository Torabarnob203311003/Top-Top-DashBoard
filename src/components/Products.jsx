import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader, MapPin, Clock, Users, DollarSign, Circle, Video, Shield, Key, Gavel, Lock, Unlock, Trash2, X } from 'lucide-react';
import CreateLobbyForm from './CreateLobbyForm';
import { jwtDecode } from 'jwt-decode';

function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [updatingLobby, setUpdatingLobby] = useState(null);
  const [deletingLobby, setDeletingLobby] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, lobby: null });

  // Decode token and get user role
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserRole('user');
      }
    } else {
      setUserRole('user');
    }
  }, []);

  // Fetch lobbies from API - আলাদা ফাংশন
  const fetchLobbies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `${token}`;
      }

      const response = await fetch('http://localhost:5000/api/v1/lobby/all-match', {
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setLobbies(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch lobbies');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching lobbies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lobbies on component mount
  useEffect(() => {
    fetchLobbies();
  }, []);

  // Refresh lobbies function
  const refreshLobbies = () => {
    fetchLobbies();
  };

  // Block/Unblock lobby function
  const toggleLobbyBlock = async (lobbyId, currentStatus) => {
    try {
      setUpdatingLobby(lobbyId);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        alert('Authentication required');
        return;
      }

      // Determine new status
      const newStatus = currentStatus === 'block' ? 'ongoing' : 'block';

      const formData = new FormData();
      formData.append('lobbyStatus', newStatus);

      const response = await fetch(`http://localhost:5000/api/v1/lobby/${lobbyId}/lobby-info`, {
        method: 'PUT',
        headers: {
          'Authorization': `${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        setLobbies(prevLobbies =>
          prevLobbies.map(lobby =>
            lobby._id === lobbyId
              ? { ...lobby, lobbyStatus: newStatus }
              : lobby
          )
        );

        // Show success message
        alert(`Lobby ${newStatus === 'block' ? 'blocked' : 'unblocked'} successfully!`);
      } else {
        throw new Error(result.message || 'Failed to update lobby status');
      }
    } catch (err) {
      console.error('Error updating lobby status:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingLobby(null);
    }
  };

  // Delete lobby function
  const deleteLobby = async (lobbyId) => {
    try {
      setDeletingLobby(lobbyId);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/v1/lobby/delete/${lobbyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Remove lobby from local state
        setLobbies(prevLobbies => prevLobbies.filter(lobby => lobby._id !== lobbyId));

        // Close modal and show success message
        setDeleteModal({ isOpen: false, lobby: null });
        alert('Lobby deleted successfully!');
      } else {
        throw new Error(result.message || 'Failed to delete lobby');
      }
    } catch (err) {
      console.error('Error deleting lobby:', err);
      alert(`Error: ${err.message}`);
      setDeleteModal({ isOpen: false, lobby: null });
    } finally {
      setDeletingLobby(null);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (lobby) => {
    setDeleteModal({ isOpen: true, lobby });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, lobby: null });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  // Get team name based on match type
  const getTeam1Name = (lobby) => {
    if (lobby.matchType === 'solo') {
      return lobby.defaultTeam1?.teamName || 'Team 1';
    } else if (lobby.matchType === 'teams') {
      return lobby.team1Data?.teamName || 'Team 1';
    }
    return 'Team 1';
  };

  const getTeam2Name = (lobby) => {
    if (lobby.matchType === 'solo') {
      return lobby.defaultTeam2?.teamName || 'Team 2';
    } else if (lobby.matchType === 'teams') {
      return lobby.team2Data?.teamName || 'Team 2';
    }
    return 'Team 2';
  };

  // Get team initials
  const getTeamInitials = (teamName) => {
    if (!teamName) return 'T1';
    return teamName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getJoinedCount = (lobby) => {
    let totalPlayers = 0;

    if (lobby.matchType === 'teams') {
      const team1Count = lobby.team1?.players?.length || 0;
      const team2Count = lobby.team2?.players?.length || 0;
      totalPlayers = team1Count + team2Count;
    } else if (lobby.matchType === 'solo') {
      const defaultTeam1Count = lobby.defaultTeam1Players?.length || 0;
      const defaultTeam2Count = lobby.defaultTeam2Players?.length || 0;
      totalPlayers = defaultTeam1Count + defaultTeam2Count;
    }

    return `${totalPlayers}/${lobby.maxSlot || 'N/A'}`;
  };

  // Get category based on team size
  const getCategory = (teamSize) => {
    return `${teamSize}v${teamSize}`;
  };

  // Get status icon and color
  const getStatusIcon = (lobbyStatus) => {
    switch (lobbyStatus) {
      case 'ongoing':
        return <Circle className="w-3 h-3 fill-green-500 text-green-500" />;
      case 'completed':
        return <Circle className="w-3 h-3 fill-gray-400 text-gray-400" />;
      case 'upcoming':
        return <Circle className="w-3 h-3 fill-yellow-400 text-yellow-400" />;
      case 'block':
        return <Circle className="w-3 h-3 fill-red-500 text-red-500" />;
      default:
        return <Circle className="w-3 h-3 fill-gray-400 text-gray-400" />;
    }
  };

  // Get status text
  const getStatusText = (lobbyStatus) => {
    switch (lobbyStatus) {
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'upcoming':
        return 'Upcoming';
      case 'block':
        return 'Blocked';
      default:
        return 'Unknown';
    }
  };

  // Check if user can view private key
  const canViewPrivateKey = userRole === 'admin';

  // Check if user can block/unblock lobbies (admin only)
  const canManageLobbies = userRole === 'admin';

  // Filter lobbies based on search term
  const filteredLobbies = lobbies.filter(lobby =>
    lobby.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTeam1Name(lobby).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTeam2Name(lobby).toLowerCase().includes(searchTerm.toLowerCase()) ||
    lobby.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => {
    if (!deleteModal.isOpen || !deleteModal.lobby) return null;

    const { lobby } = deleteModal;
    const team1Name = getTeam1Name(lobby);
    const team2Name = getTeam2Name(lobby);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-600 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Lobby
            </h3>
            <button
              onClick={closeDeleteModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={deletingLobby}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">
              Are you sure you want to delete this lobby? This action cannot be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{lobby.title}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Match:</strong> {team1Name} vs {team2Name}</p>
                <p><strong>Date:</strong> {formatDate(lobby.date)}</p>
                <p><strong>Time:</strong> {formatTime(lobby.time)}</p>
                <p><strong>Location:</strong> {lobby.location?.address || 'N/A'}</p>
                <p><strong>Status:</strong> <span className="capitalize">{getStatusText(lobby.lobbyStatus)}</span></p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will permanently delete the lobby and all associated data.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeDeleteModal}
              disabled={deletingLobby}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteLobby(lobby._id)}
              disabled={deletingLobby}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {deletingLobby ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Lobby</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showCreate) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <CreateLobbyForm
          onClose={() => setShowCreate(false)}
          onLobbyCreated={refreshLobbies}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 animate-spin text-green-500" />
          <span className="text-gray-600">Loading lobbies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Lobbies</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Lobbies</h1>
            {userRole && (
              <p className="text-sm text-gray-500 mt-1">
                Logged in as: <span className="font-medium capitalize">{userRole}</span>
                {canManageLobbies && (
                  <span className="ml-2 text-green-600">(Can manage lobbies)</span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Create Lobby</span>
            </button>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, team, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* Lobbies Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredLobbies.length} of {lobbies.length} lobbies
          </p>
        </div>

        {/* Lobbies List */}
        <div className="space-y-6">
          {filteredLobbies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No lobbies found</div>
              {searchTerm && (
                <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
              )}
            </div>
          ) : (
            filteredLobbies.map((lobby) => {
              const team1Name = getTeam1Name(lobby);
              const team2Name = getTeam2Name(lobby);
              const isBlocked = lobby.lobbyStatus === 'block';
              const isUpdating = updatingLobby === lobby._id;
              const isDeleting = deletingLobby === lobby._id;

              return (
                <div
                  key={lobby._id}
                  className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border ${isBlocked ? 'border-red-200 bg-red-50' : 'border-gray-100'
                    }`}
                >
                  {/* Blocked Banner */}
                  {isBlocked && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-red-600" />
                          <span className="text-red-700 font-medium">This lobby is blocked</span>
                        </div>
                        {canManageLobbies && (
                          <button
                            onClick={() => toggleLobbyBlock(lobby._id, lobby.lobbyStatus)}
                            disabled={isUpdating}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                              <Unlock className="w-3 h-3" />
                            )}
                            <span>Unblock</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {/* Left Team */}
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {getTeamInitials(team1Name)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {team1Name}
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {lobby.goalTeam1 || 0}
                        </p>
                      </div>
                    </div>

                    {/* Center - Match Info */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(lobby.lobbyStatus)}
                        {getStatusIcon(lobby.lobbyStatus)}
                        {getStatusIcon(lobby.lobbyStatus)}
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(lobby.date)}</p>
                      <p className="text-xl font-bold text-gray-900">VS</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {lobby.matchType} • {lobby.matchPrivacy}
                        {lobby.matchType === 'solo' && ' (Solo Players)'}
                        {lobby.matchType === 'teams' && ' (Team vs Team)'}
                      </p>
                    </div>

                    {/* Right Team */}
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 text-right">
                          {team2Name}
                        </p>
                        <p className="text-2xl font-bold text-green-600 text-right">
                          {lobby.goalTeam2 || 0}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {getTeamInitials(team2Name)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Title */}
                  <div className="text-center mt-4">
                    <h3 className="text-lg font-semibold text-gray-800">{lobby.title}</h3>
                  </div>

                  {/* Match Details */}
                  <div className="flex flex-wrap gap-6 mt-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{lobby.location?.address || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{formatTime(lobby.time)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{lobby.matchTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{getCategory(lobby.teamSize)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-700">{lobby.price || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{getJoinedCount(lobby)} joined</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Circle className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700 capitalize">{getStatusText(lobby.lobbyStatus)}</span>
                    </div>

                    {/* Private Key - Show only for admin users and private lobbies */}
                    {lobby.matchPrivacy === 'private' && lobby.privateKey && (
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700">
                          {canViewPrivateKey ? lobby.privateKey : 'Private Key: ******'}
                        </span>
                        {canViewPrivateKey && (
                          <span className="text-xs text-purple-600 font-medium">(Admin View)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    {lobby.goalkeeper && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Goalkeeper
                      </span>
                    )}
                    {lobby.referee && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Gavel className="w-3 h-3 mr-1" />
                        Referee
                      </span>
                    )}
                    {lobby.camera && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Video className="w-3 h-3 mr-1" />
                        Camera
                      </span>
                    )}
                    {lobby.matchPrivacy === 'private' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Key className="w-3 h-3 mr-1" />
                        Private Lobby
                      </span>
                    )}
                  </div>

                  {/* Organizer Info and Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Organized by: <span className="font-medium">{lobby.organizerData?.FullName || 'Unknown Organizer'}</span>
                    </p>

                    <div className="flex items-center space-x-2">
                      {/* Block/Unblock Button (Admin Only) */}
                      {canManageLobbies && !isBlocked && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to block this lobby?')) {
                              toggleLobbyBlock(lobby._id, lobby.lobbyStatus);
                            }
                          }}
                          disabled={isUpdating}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          <span>Block Lobby</span>
                        </button>
                      )}

                      {/* Delete Button (Admin Only) */}
                      {canManageLobbies && (
                        <button
                          onClick={() => openDeleteModal(lobby)}
                          disabled={isDeleting}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;