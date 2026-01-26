/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Plus, Search, Loader, Ban, CheckCircle, X, User, Calendar, Clock, MapPin, Users, ChevronRight, Trophy, Target, Shield, Gamepad2, Crown, DollarSign, CheckCircle2, Clock3, Award, Users2, Star, Crown as CrownIcon, Flag, AlertCircle } from 'lucide-react';
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
  const [lobbyData, setLobbyData] = useState({
    upcomingLobby: [],
    completeLobby: [],
    totalEarning: 0,
    hostTournaments: []
  });
  const [matchLoading, setMatchLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignTournamentModal, setShowAssignTournamentModal] = useState(false);
  const [availableLobbies, setAvailableLobbies] = useState([]);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [selectedLobbyId, setSelectedLobbyId] = useState('');
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignTournamentLoading, setAssignTournamentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [assignError, setAssignError] = useState('');
  const [assignTournamentError, setAssignTournamentError] = useState('');

  // Fetch organizers from API
  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('https://api.toptopfootball.com/api/v1/auth/all-player', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to fetch organizers (${response.status})`);
      }

      const result = await response.json();

      if (result.success) {
        // Filter only organizers from the response
        const organizersData = result.data?.filter(user => user.role === 'organizer') || [];
        setOrganizers(organizersData);
      } else {
        toast.error(result.message || 'Failed to fetch organizers');
      }
    } catch (error) {
      console.error('Error fetching organizers:', error);
      toast.error(error.message || 'Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch lobbies for selected organizer
  const fetchOrganizerLobbies = async (organizerId) => {
    if (!organizerId) return;

    setMatchLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`https://api.toptopfootball.com/api/v1/lobby/organizer-lobby/${organizerId}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to fetch lobbies (${response.status})`);
      }

      const result = await response.json();

      if (result.success) {
        const data = result.data || {};
        setLobbyData({
          upcomingLobby: Array.isArray(data.upcomingLobby) ? data.upcomingLobby : [],
          completeLobby: Array.isArray(data.completeLobby) ? data.completeLobby : [],
          totalEarning: data.totalEarning || 0,
          hostTournaments: Array.isArray(data.hostTournaments) ? data.hostTournaments : []
        });
      } else {
        toast.error(result.message || 'Failed to fetch lobbies');
      }
    } catch (error) {
      console.error('Error fetching lobbies:', error);
      toast.error(error.message || 'Failed to load lobby data');
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
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to fetch lobbies (${response.status})`);
      }

      const result = await response.json();

      if (result.success) {
        // Filter lobbies that don't have an organizer or have different organizer
        const allLobbies = Array.isArray(result.data) ? result.data : [];
        const filteredLobbies = allLobbies.filter(lobby =>
          !lobby.organizer || lobby.organizer !== selectedOrganizer?._id
        );
        setAvailableLobbies(filteredLobbies);
        setAssignError(''); // Clear any previous errors
      } else {
        const errorMessage = result.message || 'Failed to fetch available lobbies';
        setAssignError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching lobbies:', error);
      const errorMessage = error.message || 'Failed to load available lobbies';
      setAssignError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Fetch available tournaments for assignment
  const fetchAvailableTournaments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('https://api.toptopfootball.com/api/v1/tournament/all-tournament', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to fetch tournaments (${response.status})`);
      }

      const result = await response.json();

      if (result.success) {
        // Filter tournaments that don't have an organizer or have different organizer
        const allTournaments = Array.isArray(result.data) ? result.data : [];
        const filteredTournaments = allTournaments.filter(tournament =>
          !tournament.organizer || (tournament.organizer && tournament.organizer._id !== selectedOrganizer?._id)
        );
        setAvailableTournaments(filteredTournaments);
        setAssignTournamentError(''); // Clear any previous errors
      } else {
        const errorMessage = result.message || 'Failed to fetch available tournaments';
        setAssignTournamentError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      const errorMessage = error.message || 'Failed to load available tournaments';
      setAssignTournamentError(errorMessage);
      toast.error(errorMessage);
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
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to delete organizer (${response.status})`);
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
      toast.error(error.message || 'Failed to delete organizer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockToggle = async (organizerId, currentStatus) => {
    if (!organizerId) return;

    setActionLoading(`block-${organizerId}`);

    try {
      const token = localStorage.getItem('accessToken');
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

      const response = await fetch(`https://api.toptopfootball.com/api/v1/auth/update-status/${organizerId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBlocked: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update organizer status (${response.status})`);
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
      toast.error(error.message || 'Failed to update organizer status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (organizer) => {
    setSelectedOrganizer(organizer);
    setActiveTab('upcoming');
    fetchOrganizerLobbies(organizer._id);
    setShowDetailsModal(true);
  };

  const handleAssignMatch = () => {
    setAssignError(''); // Clear previous errors
    setShowAssignModal(true);
    fetchAvailableLobbies();
  };

  const handleAssignTournament = () => {
    setAssignTournamentError(''); // Clear previous errors
    setShowAssignTournamentModal(true);
    fetchAvailableTournaments();
  };

  const handleAssignLobby = async () => {
    if (!selectedLobbyId || !selectedOrganizer?._id) {
      setAssignError('Please select a lobby');
      return;
    }

    setAssignLoading(true);
    setAssignError(''); // Clear previous errors

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`https://api.toptopfootball.com/api/v1/lobby/assign-lobby/${selectedOrganizer._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lobbyId: selectedLobbyId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Failed to assign lobby (${response.status})`;

        // Try to get detailed error message
        let detailedError = errorMessage;
        if (errorData?.errorSources?.[0]?.message) {
          detailedError = errorData.errorSources[0].message;
        } else if (errorData?.errors?.[0]?.msg) {
          detailedError = errorData.errors[0].msg;
        } else if (errorData?.error) {
          detailedError = errorData.error;
        }

        setAssignError(detailedError);
        throw new Error(detailedError);
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Lobby assigned successfully');
        setShowAssignModal(false);
        setSelectedLobbyId('');
        setAssignError('');
        fetchOrganizerLobbies(selectedOrganizer._id);
      } else {
        const errorMessage = result.message || 'Failed to assign lobby';
        setAssignError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error assigning lobby:', error);
      if (!assignError) {
        const errorMessage = error.message || 'Failed to assign lobby';
        setAssignError(errorMessage);
      }
      toast.error(assignError || 'Failed to assign lobby');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignTournamentToOrganizer = async () => {
    if (!selectedTournamentId || !selectedOrganizer?._id) {
      setAssignTournamentError('Please select a tournament');
      return;
    }

    setAssignTournamentLoading(true);
    setAssignTournamentError(''); // Clear previous errors

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`https://api.toptopfootball.com/api/v1/lobby/assign-tournament/${selectedOrganizer._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tournamentId: selectedTournamentId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Failed to assign tournament (${response.status})`;

        // Try to get detailed error message
        let detailedError = errorMessage;
        if (errorData?.errorSources?.[0]?.message) {
          detailedError = errorData.errorSources[0].message;
        } else if (errorData?.errors?.[0]?.msg) {
          detailedError = errorData.errors[0].msg;
        } else if (errorData?.error) {
          detailedError = errorData.error;
        }

        setAssignTournamentError(detailedError);
        throw new Error(detailedError);
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Tournament assigned successfully');
        setShowAssignTournamentModal(false);
        setSelectedTournamentId('');
        setAssignTournamentError('');
        fetchOrganizerLobbies(selectedOrganizer._id);
      } else {
        const errorMessage = result.message || 'Failed to assign tournament';
        setAssignTournamentError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error assigning tournament:', error);
      if (!assignTournamentError) {
        const errorMessage = error.message || 'Failed to assign tournament';
        setAssignTournamentError(errorMessage);
      }
      toast.error(assignTournamentError || 'Failed to assign tournament');
    } finally {
      setAssignTournamentLoading(false);
    }
  };

  // Helper function to get team details based on match type
  const getTeamDetails = (lobby) => {
    if (!lobby) {
      return {
        team1Name: 'Team X',
        team2Name: 'Team Y',
        team1Image: null,
        team2Image: null,
        isTeams: false
      };
    }

    if (lobby.matchType === 'teams') {
      const team1Name = lobby.team1?.teamId?.teamName || lobby.team1?.teamName || 'Team X';
      const team2Name = lobby.team2?.teamId?.teamName || lobby.team2?.teamName || 'Team Y';
      const team1Image = lobby.team1?.teamId?.image || lobby.team1?.image || null;
      const team2Image = lobby.team2?.teamId?.image || lobby.team2?.image || null;

      return {
        team1Name,
        team2Name,
        team1Image,
        team2Image,
        isTeams: true
      };
    } else {
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
    if (!lobby) return 0;

    if (lobby.matchType === 'teams') {
      const team1Players = Array.isArray(lobby.team1?.players) ? lobby.team1.players.length : 0;
      const team2Players = Array.isArray(lobby.team2?.players) ? lobby.team2.players.length : 0;
      return team1Players + team2Players;
    } else {
      const defaultTeam1Players = Array.isArray(lobby.defaultTeam1?.players) ? lobby.defaultTeam1.players.length : 0;
      const defaultTeam2Players = Array.isArray(lobby.defaultTeam2?.players) ? lobby.defaultTeam2.players.length : 0;
      return defaultTeam1Players + defaultTeam2Players;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

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

  // Format tournament date for display
  const formatTournamentDate = (dateString) => {
    if (!dateString) return 'Date not set';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format date and time for completed lobbies
  const formatDateTime = (dateString, timeString) => {
    if (!dateString && !timeString) return 'Date/Time not set';

    try {
      if (dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return `${dateString} • ${timeString || ''}`;

        const datePart = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        return timeString ? `${datePart} • ${timeString}` : datePart;
      }
      return timeString || '';
    } catch (error) {
      return `${dateString || ''} • ${timeString || ''}`;
    }
  };

  // Get tournament type badge color
  const getTournamentTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'standing':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'knockout':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'league':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get tournament status badge color
  const getTournamentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get lobby type badge color
  const getLobbyTypeColor = (type) => {
    switch (type?.toLowerCase()) {
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
    switch (privacy?.toLowerCase()) {
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
    const goal1 = Number(goalTeam1) || 0;
    const goal2 = Number(goalTeam2) || 0;

    if (goal1 > goal2) {
      return teamIndex === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    } else if (goal1 < goal2) {
      return teamIndex === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get role badge color and icon
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
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
    organizer?.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer?.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer?.role?.toLowerCase().includes(searchTerm.toLowerCase())
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

            <tbody className="divide-y divide-gray-100">
              {filteredOrganizers.map((organizer) => (
                <tr key={organizer._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={organizer.imageUrl || '/default-avatar.png'}
                          alt={organizer.FullName || 'Organizer'}
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
                        <span className="text-sm font-semibold text-gray-900 block">{organizer.FullName || 'No Name'}</span>
                        {organizer.userName && organizer.userName !== 'N/A' && (
                          <span className="text-xs text-gray-500">@{organizer.userName}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">{organizer.email || 'No email'}</span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">
                      {organizer.mobile && organizer.mobile !== 'N/A' ? organizer.mobile : 'Not provided'}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getRoleColor(organizer.role)}`}>
                        <User className="w-3 h-3 mr-1.5" />
                        {formatRole(organizer.role)}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(organizer.isBlocked)}`}>
                      {organizer.isBlocked === 'active' ? 'Active' : 'Blocked'}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(organizer)}
                        className="p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 text-blue-600 hover:shadow-md"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

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

                      <button
                        onClick={() => handleDelete(organizer._id, organizer.FullName || 'Organizer')}
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
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={selectedOrganizer.imageUrl || '/default-avatar.png'}
                      alt={selectedOrganizer.FullName || 'Organizer'}
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
                    <h2 className="text-2xl font-bold text-gray-900">{selectedOrganizer.FullName || 'No Name'}</h2>
                    <p className="text-gray-600">{selectedOrganizer.email || 'No email'}</p>
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

            <div className="p-6">
              {/* Assign Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={handleAssignMatch}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Assign Lobby
                </button>
                <button
                  onClick={handleAssignTournament}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <Award className="w-5 h-5" />
                  Assign Tournament
                </button>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        AED {lobbyData.totalEarning ? lobbyData.totalEarning.toLocaleString() : '0'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Upcoming Lobbies</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{lobbyData.upcomingLobby.length}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Completed Lobbies</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{lobbyData.completeLobby.length}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <CheckCircle2 className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Hosted Tournaments</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {lobbyData.hostTournaments.length}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
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
                        {lobbyData.upcomingLobby.length}
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
                        {lobbyData.completeLobby.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('tournaments')}
                      className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${activeTab === 'tournaments'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <Award className="w-4 h-4" />
                      Hosted Tournaments
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === 'tournaments'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {lobbyData.hostTournaments.length}
                      </span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Content */}
              {matchLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
                      <Target className="w-8 h-8 text-green-500 absolute inset-0 m-auto" />
                    </div>
                    <p className="text-gray-600 mt-4">Loading data...</p>
                  </div>
                </div>
              ) : activeTab === 'upcoming' ? (
                <div>
                  {lobbyData.upcomingLobby.length > 0 ? (
                    <div className="space-y-4">
                      {lobbyData.upcomingLobby.map((lobby) => {
                        const teamDetails = getTeamDetails(lobby);
                        const totalPlayers = calculateTotalPlayers(lobby);

                        return (
                          <div key={lobby._id} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="text-lg font-bold text-gray-900">{lobby.title || 'No Title'}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getLobbyTypeColor(lobby.matchType)}`}>
                                      {lobby.matchType === 'teams' ? 'Team Match' : 'Solo Match'}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getPrivacyColor(lobby.matchPrivacy)}`}>
                                      {lobby.matchPrivacy || 'public'}
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
                                    <span className="text-gray-700">{lobby.location?.address || 'Location not specified'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.time || 'Time not set'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{formatDate(lobby.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.teamSize || 5}v{lobby.teamSize || 5}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">AED {lobby.price || '0'}</div>
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
                                  <div className="font-medium text-gray-900">{lobby.matchTime || 'Not specified'}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-500">Joined</div>
                                  <div className="font-medium text-gray-900">{totalPlayers}/{lobby.maxSlot || 'Not specified'}</div>
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
              ) : activeTab === 'completed' ? (
                <div>
                  {lobbyData.completeLobby.length > 0 ? (
                    <div className="space-y-4">
                      {lobbyData.completeLobby.map((lobby) => {
                        const teamDetails = getTeamDetails(lobby);
                        const totalPlayers = calculateTotalPlayers(lobby);

                        return (
                          <div key={lobby._id} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="text-lg font-bold text-gray-900">{lobby.title || 'No Title'}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getLobbyTypeColor(lobby.matchType)}`}>
                                      {lobby.matchType === 'teams' ? 'Team Match' : 'Solo Match'}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getPrivacyColor(lobby.matchPrivacy)}`}>
                                      {lobby.matchPrivacy || 'public'}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                      Completed
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.location?.address || 'Location not specified'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.time || 'Time not set'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{formatDate(lobby.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">{lobby.teamSize || 5}v{lobby.teamSize || 5}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-2xl font-bold text-orange-600">AED {lobby.price || '0'}</div>
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
                                        {lobby.goalTeam1 || 0}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                                      <span className="font-bold text-gray-900 text-lg">{teamDetails.team1Name}</span>
                                      <div className={`mt-2 px-3 py-1 rounded-lg text-sm font-medium ${getResultColor(lobby.goalTeam1, lobby.goalTeam2, 1)}`}>
                                        {lobby.goalTeam1 || 0}
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
                                        {lobby.goalTeam2 || 0}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl">
                                      <span className="font-bold text-gray-900 text-lg">{teamDetails.team2Name}</span>
                                      <div className={`mt-2 px-3 py-1 rounded-lg text-sm font-medium ${getResultColor(lobby.goalTeam1, lobby.goalTeam2, 2)}`}>
                                        {lobby.goalTeam2 || 0}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Match Result */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                              <div className="flex items-center justify-center">
                                <div className={`px-4 py-2 rounded-lg text-lg font-bold ${(lobby.goalTeam1 || 0) > (lobby.goalTeam2 || 0)
                                  ? 'bg-green-100 text-green-800'
                                  : (lobby.goalTeam1 || 0) < (lobby.goalTeam2 || 0)
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {(lobby.goalTeam1 || 0) > (lobby.goalTeam2 || 0)
                                    ? `${teamDetails.team1Name} Wins!`
                                    : (lobby.goalTeam1 || 0) < (lobby.goalTeam2 || 0)
                                      ? `${teamDetails.team2Name} Wins!`
                                      : 'Match Drawn'}
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
              ) : (
                <div>
                  {/* Hosted Tournaments */}
                  {lobbyData.hostTournaments.length > 0 ? (
                    <div className="space-y-4">
                      {lobbyData.hostTournaments.map((tournament) => (
                        <div key={tournament._id} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                {tournament.imageUrl && (
                                  <img
                                    src={tournament.imageUrl}
                                    alt={tournament.name}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                    onError={(e) => {
                                      e.target.src = '/default-tournament.png';
                                    }}
                                  />
                                )}
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">{tournament.name || 'No Name'}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getTournamentTypeColor(tournament.type)}`}>
                                      {tournament.type || 'Unknown'}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${getTournamentStatusColor(tournament.status)}`}>
                                      {tournament.status || 'unknown'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{tournament.location?.address || 'Location not specified'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">Starts {formatTournamentDate(tournament.startDate)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{tournament.teams?.length || 0}/{tournament.maxTeam || 0} teams</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Flag className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{tournament.fieldSize || 5}-a-side</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-2xl font-bold text-purple-600">AED {tournament.price || '0'}</div>
                              <div className="text-sm text-gray-500">Prize Pool</div>
                            </div>
                          </div>

                          {/* Tournament Details */}
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center">
                                <div className="text-gray-500">Duration</div>
                                <div className="font-medium text-gray-900">{tournament.duration || 0} days</div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500">Registered</div>
                                <div className="font-medium text-gray-900">{tournament.teams?.length || 0} teams</div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500">Qualified</div>
                                <div className="font-medium text-gray-900">{tournament.qualifiedTeams?.length || 0} teams</div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500">Winner</div>
                                <div className="font-medium text-gray-900">
                                  {tournament.winner?.teamName || 'TBD'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-sm">
                        <Award className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-lg">No hosted tournaments</p>
                      <p className="text-gray-400 text-sm mt-1">Assign tournaments to this organizer</p>
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Assign Lobby</h2>
                <p className="text-gray-600 text-sm mt-1">Select a lobby to assign to {selectedOrganizer?.FullName}</p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedLobbyId('');
                  setAssignError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Error Display for Assign Lobby */}
                {assignError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-800 font-medium text-sm">Error</p>
                        <p className="text-red-700 text-sm mt-1">{assignError}</p>
                      </div>
                    </div>
                  </div>
                )}

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
                            onClick={() => {
                              setSelectedLobbyId(lobby._id);
                              setAssignError(''); // Clear error when selecting a lobby
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{lobby.title || 'No Title'}</span>
                              <span className="text-green-600 font-bold">AED {lobby.price || '0'}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {teamDetails.team1Name} vs {teamDetails.team2Name}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{formatDate(lobby.date)}</span>
                              <span>•</span>
                              <span>{lobby.location?.address || 'No location'}</span>
                              <span>•</span>
                              <span className={`px-2 py-0.5 rounded ${getLobbyTypeColor(lobby.matchType)}`}>
                                {lobby.matchType || 'unknown'}
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

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedLobbyId('');
                  setAssignError('');
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

      {/* Assign Tournament Modal */}
      {showAssignTournamentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Assign Tournament</h2>
                <p className="text-gray-600 text-sm mt-1">Select a tournament to assign to {selectedOrganizer?.FullName}</p>
              </div>
              <button
                onClick={() => {
                  setShowAssignTournamentModal(false);
                  setSelectedTournamentId('');
                  setAssignTournamentError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Error Display for Assign Tournament */}
                {assignTournamentError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-800 font-medium text-sm">Error</p>
                        <p className="text-red-700 text-sm mt-1">{assignTournamentError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Tournaments
                  </label>
                  {availableTournaments.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {availableTournaments.map((tournament) => (
                        <div
                          key={tournament._id}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedTournamentId === tournament._id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          onClick={() => {
                            setSelectedTournamentId(tournament._id);
                            setAssignTournamentError(''); // Clear error when selecting a tournament
                          }}
                        >
                          <div className="flex items-start gap-3 mb-2">
                            {tournament.imageUrl && (
                              <img
                                src={tournament.imageUrl}
                                alt={tournament.name}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                  e.target.src = '/default-tournament.png';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{tournament.name || 'No Name'}</span>
                                <span className="text-purple-600 font-bold">AED {tournament.price || '0'}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs rounded ${getTournamentTypeColor(tournament.type)}`}>
                                  {tournament.type || 'Unknown'}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded ${getTournamentStatusColor(tournament.status)}`}>
                                  {tournament.status || 'unknown'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-2 mt-2">
                            {tournament.location?.address || 'Location not specified'}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Starts: {formatTournamentDate(tournament.startDate)}</span>
                            <span>•</span>
                            <span>{tournament.duration || 0} days</span>
                            <span>•</span>
                            <span>{tournament.maxTeam || 0} teams max</span>
                          </div>
                          {tournament.organizer && tournament.organizer._id && (
                            <div className="mt-2 text-xs text-gray-500">
                              Currently organized by: {tournament.organizer.FullName || 'Unknown'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                        <Award className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No available tournaments</p>
                      <p className="text-gray-400 text-sm mt-1">All tournaments are already assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAssignTournamentModal(false);
                  setSelectedTournamentId('');
                  setAssignTournamentError('');
                }}
                className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                disabled={assignTournamentLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTournamentToOrganizer}
                disabled={assignTournamentLoading || !selectedTournamentId}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignTournamentLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Assigning...
                  </span>
                ) : (
                  'Assign Tournament'
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