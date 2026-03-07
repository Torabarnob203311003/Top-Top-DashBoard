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

  const fetchLobbies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `${token}`;

      const response = await fetch('https://api.toptopfootball.com/api/v1/lobby/all-match', { headers });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setLobbies(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch lobbies');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLobbies(); }, []);

  const refreshLobbies = () => { fetchLobbies(); };

  const toggleLobbyBlock = async (lobbyId, currentStatus) => {
    try {
      setUpdatingLobby(lobbyId);
      const token = localStorage.getItem('accessToken');
      if (!token) { alert('Authentication required'); return; }
      const newStatus = currentStatus === 'block' ? 'ongoing' : 'block';
      const formData = new FormData();
      formData.append('lobbyStatus', newStatus);
      const response = await fetch(`https://api.toptopfootball.com/api/v1/lobby/${lobbyId}/lobby-info`, {
        method: 'PUT',
        headers: { 'Authorization': `${token}` },
        body: formData
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setLobbies(prev => prev.map(l => l._id === lobbyId ? { ...l, lobbyStatus: newStatus } : l));
        alert(`Lobby ${newStatus === 'block' ? 'blocked' : 'unblocked'} successfully!`);
      } else {
        throw new Error(result.message || 'Failed to update lobby status');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingLobby(null);
    }
  };

  const deleteLobby = async (lobbyId) => {
    try {
      setDeletingLobby(lobbyId);
      const token = localStorage.getItem('accessToken');
      if (!token) { alert('Authentication required'); return; }
      const response = await fetch(`https://api.toptopfootball.com/api/v1/lobby/delete/${lobbyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setLobbies(prev => prev.filter(l => l._id !== lobbyId));
        setDeleteModal({ isOpen: false, lobby: null });
        alert('Lobby deleted successfully!');
      } else {
        throw new Error(result.message || 'Failed to delete lobby');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
      setDeleteModal({ isOpen: false, lobby: null });
    } finally {
      setDeletingLobby(null);
    }
  };

  const openDeleteModal = (lobby) => setDeleteModal({ isOpen: true, lobby });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, lobby: null });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return 'Invalid Date'; }
  };

  const getTeam1Name = (lobby) => {
    if (lobby.matchType === 'solo') return lobby.defaultTeam1?.teamName || 'Team 1';
    if (lobby.matchType === 'teams') return lobby.team1Data?.teamName || 'Team 1';
    return 'Team 1';
  };

  const getTeam2Name = (lobby) => {
    if (lobby.matchType === 'solo') return lobby.defaultTeam2?.teamName || 'Team 2';
    if (lobby.matchType === 'teams') return lobby.team2Data?.teamName || 'Team 2';
    return 'Team 2';
  };

  // ✅ Team image getters
  const getTeam1Image = (lobby) => {
    if (lobby.matchType === 'teams') return lobby.team1Data?.image || null;
    return null;
  };

  const getTeam2Image = (lobby) => {
    if (lobby.matchType === 'teams') return lobby.team2Data?.image || null;
    return null;
  };

  const getTeamInitials = (teamName) => {
    if (!teamName) return 'T1';
    return teamName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // ✅ Team Avatar component — image থাকলে দেখাবে, না থাকলে initials
  const TeamAvatar = ({ name, image, bgColor = 'bg-black' }) => (
    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            // image load fail হলে initials দেখাও
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={`w-12 h-12 ${bgColor} rounded-full items-center justify-center ${image ? 'hidden' : 'flex'}`}
        style={{ display: image ? 'none' : 'flex' }}
      >
        <span className="text-white text-sm font-bold">{getTeamInitials(name)}</span>
      </div>
    </div>
  );

  const getJoinedCount = (lobby) => {
    let totalPlayers = 0;
    if (lobby.matchType === 'teams') {
      totalPlayers = (lobby.team1?.players?.length || 0) + (lobby.team2?.players?.length || 0);
    } else if (lobby.matchType === 'solo') {
      totalPlayers = (lobby.defaultTeam1?.players?.length || 0) + (lobby.defaultTeam2?.players?.length || 0);
    }
    return `${totalPlayers}/${lobby.maxSlot || 'N/A'}`;
  };

  const getCategory = (teamSize) => `${teamSize}v${teamSize}`;

  const getStatusIcon = (lobbyStatus) => {
    switch (lobbyStatus) {
      case 'ongoing': return <Circle className="w-3 h-3 fill-green-500 text-green-500" />;
      case 'completed': return <Circle className="w-3 h-3 fill-gray-400 text-gray-400" />;
      case 'block': return <Circle className="w-3 h-3 fill-red-500 text-red-500" />;
      default: return <Circle className="w-3 h-3 fill-gray-400 text-gray-400" />;
    }
  };

  const getStatusText = (lobbyStatus) => {
    switch (lobbyStatus) {
      case 'ongoing': return 'Ongoing';
      case 'completed': return 'Completed';
      case 'block': return 'Blocked';
      default: return 'Unknown';
    }
  };

  const canViewPrivateKey = userRole === 'admin';
  const canManageLobbies = userRole === 'admin';

  const filteredLobbies = lobbies.filter(lobby => {
    // ✅ completed lobby দেখাবে না
    if (lobby.lobbyStatus === 'completed') return false;

    // search filter
    return (
      lobby.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTeam1Name(lobby).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTeam2Name(lobby).toLowerCase().includes(searchTerm.toLowerCase()) ||
      lobby.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const DeleteConfirmationModal = () => {
    if (!deleteModal.isOpen || !deleteModal.lobby) return null;
    const { lobby } = deleteModal;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-600 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" /> Delete Lobby
            </h3>
            <button onClick={closeDeleteModal} disabled={deletingLobby} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 mb-3">Are you sure you want to delete this lobby? This action cannot be undone.</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{lobby.title}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Match:</strong> {getTeam1Name(lobby)} vs {getTeam2Name(lobby)}</p>
                <p><strong>Date:</strong> {formatDate(lobby.date)}</p>
                <p><strong>Status:</strong> {getStatusText(lobby.lobbyStatus)}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button onClick={closeDeleteModal} disabled={deletingLobby} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button onClick={() => deleteLobby(lobby._id)} disabled={deletingLobby} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2">
              {deletingLobby ? <><Loader className="w-4 h-4 animate-spin" /><span>Deleting...</span></> : <><Trash2 className="w-4 h-4" /><span>Delete Lobby</span></>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showCreate) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <CreateLobbyForm onClose={() => setShowCreate(false)} onLobbyCreated={refreshLobbies} />
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
          <button onClick={() => window.location.reload()} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DeleteConfirmationModal />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Lobbies</h1>
            {userRole && (
              <p className="text-sm text-gray-500 mt-1">
                Logged in as: <span className="font-medium capitalize">{userRole}</span>
                {canManageLobbies && <span className="ml-2 text-green-600">(Can manage lobbies)</span>}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /><span>Create Lobby</span>
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

        <div className="space-y-6">
          {filteredLobbies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No lobbies found</div>
              {searchTerm && <p className="text-gray-400 mt-2">Try adjusting your search terms</p>}
            </div>
          ) : (
            filteredLobbies.map((lobby) => {
              const team1Name = getTeam1Name(lobby);
              const team2Name = getTeam2Name(lobby);
              const team1Image = getTeam1Image(lobby);
              const team2Image = getTeam2Image(lobby);
              const isBlocked = lobby.lobbyStatus === 'block';
              const isUpdating = updatingLobby === lobby._id;
              const isDeleting = deletingLobby === lobby._id;

              return (
                <div key={lobby._id} className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border ${isBlocked ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                  {isBlocked && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-red-600" />
                          <span className="text-red-700 font-medium">This lobby is blocked</span>
                        </div>
                        {canManageLobbies && (
                          <button onClick={() => toggleLobbyBlock(lobby._id, lobby.lobbyStatus)} disabled={isUpdating} className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded disabled:opacity-50">
                            {isUpdating ? <Loader className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                            <span>Unblock</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {/* ✅ Left Team — image দেখাবে */}
                    <div className="flex items-center space-x-4">
                      <TeamAvatar name={team1Name} image={team1Image} bgColor="bg-black" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{team1Name}</p>
                        <p className="text-2xl font-bold text-green-600">{lobby.goalTeam1 || 0}</p>
                      </div>
                    </div>

                    {/* Center */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-1">
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

                    {/* ✅ Right Team — image দেখাবে */}
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 text-right">{team2Name}</p>
                        <p className="text-2xl font-bold text-green-600 text-right">{lobby.goalTeam2 || 0}</p>
                      </div>
                      <TeamAvatar name={team2Name} image={team2Image} bgColor="bg-blue-600" />
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <h3 className="text-lg font-semibold text-gray-800">{lobby.title}</h3>
                  </div>

                  <div className="flex flex-wrap gap-6 mt-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{lobby.location?.address || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{lobby.time}</span>
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
                    {lobby.matchPrivacy === 'private' && lobby.privateKey && (
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700">
                          {canViewPrivateKey ? lobby.privateKey : 'Private Key: ******'}
                        </span>
                        {canViewPrivateKey && <span className="text-xs text-purple-600 font-medium">(Admin View)</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    {lobby.goalkeeper && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><Shield className="w-3 h-3 mr-1" />Goalkeeper</span>}
                    {lobby.referee && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Gavel className="w-3 h-3 mr-1" />Referee</span>}
                    {lobby.camera && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><Video className="w-3 h-3 mr-1" />Camera</span>}
                    {lobby.matchPrivacy === 'private' && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><Key className="w-3 h-3 mr-1" />Private Lobby</span>}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Organized by: <span className="font-medium">{lobby.organizerData?.FullName || 'Unknown Organizer'}</span>
                    </p>
                    <div className="flex items-center space-x-2">
                      {canManageLobbies && !isBlocked && (
                        <button onClick={() => { if (window.confirm('Block this lobby?')) toggleLobbyBlock(lobby._id, lobby.lobbyStatus); }} disabled={isUpdating} className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded disabled:opacity-50">
                          {isUpdating ? <Loader className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                          <span>Block Lobby</span>
                        </button>
                      )}
                      {canManageLobbies && (
                        <button onClick={() => openDeleteModal(lobby)} disabled={isDeleting} className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded disabled:opacity-50">
                          {isDeleting ? <Loader className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
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