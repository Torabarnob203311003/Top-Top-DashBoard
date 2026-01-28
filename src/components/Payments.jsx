/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, TrendingUp, User, MapPin, Calendar, Clock, Trophy, Star, X, Users, Shield, Footprints, DollarSign, LogOut, Eye, EyeOff, Award, CheckCircle, XCircle, UsersIcon, Gamepad2, Crown, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('All Payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    paymentMethod: 'all',
    paymentStatus: 'all',
    matchType: 'all',
    position: 'all'
  });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundRequests, setRefundRequests] = useState([]);
  const [refundLoading, setRefundLoading] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState({});
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch payments data from API
  useEffect(() => {
    fetchPayments();
  }, []);

  // Fetch refund requests when tab changes to Refund Requests
  useEffect(() => {
    if (activeTab === 'Refund Requests') {
      fetchRefundRequests();
    }
  }, [activeTab]);

  const fetchPayments = async () => {
    const token = getToken();

    if (!token) {
      toast.error('Please login to view payments');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://api.toptopfootball.com/api/v1/payment/all-payment', {
        method: 'GET',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setPayments(result.data);
      } else {
        toast.error(result.message || 'Failed to load payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch refund requests from API
  const fetchRefundRequests = async () => {
    const token = getToken();

    if (!token) {
      toast.error('Please login to view refund requests');
      return;
    }

    try {
      setRefundLoading(true);
      const response = await fetch('https://api.toptopfootball.com/api/v1/refund/all-refund-request', {
        method: 'GET',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setRefundRequests(result.data);
      } else {
        toast.error(result.message || 'Failed to load refund requests');
      }
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      toast.error('Error loading refund requests');
    } finally {
      setRefundLoading(false);
    }
  };

  // Update payment status function
  const updatePaymentStatus = async (paymentId, newStatus) => {
    const token = getToken();

    if (!token) {
      toast.error('Please login to update payment status');
      return;
    }

    try {
      if (newStatus === 'success') {
        const response = await fetch(`https://api.toptopfootball.com/api/v1/payment/payment-success?paymentId=${paymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Payment marked as successful');
          fetchPayments();
        } else {
          toast.error(result.message || 'Failed to update payment status');
        }
      } else {
        const response = await fetch(`https://api.toptopfootball.com/api/v1/payment/payment-cancel?paymentId=${paymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          }
        });

        const result = await response.json();

        if (result.success) {
          toast.success(`Payment marked as ${newStatus}`);
          fetchPayments();
        } else {
          toast.error(result.message || 'Failed to update payment status');
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Error updating payment status');
    }
  };

  // Handle refund approval
  const handleApproveRefund = async (refundRequest) => {
    const token = getToken();

    if (!token) {
      toast.error('Please login to process refund');
      return;
    }

    try {
      const requestBody = {
        lobbyId: refundRequest.lobbyId?._id,
        playerId: refundRequest.playerId?._id
      };

      // Validate required fields
      if (!requestBody.lobbyId || !requestBody.playerId) {
        toast.error('Missing required data for refund approval');
        return;
      }

      const response = await fetch('https://api.toptopfootball.com/api/v1/refund/accept-refund-request', {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Refund approved successfully');
        // Refresh refund requests
        fetchRefundRequests();
      } else {
        toast.error(result.message || 'Failed to approve refund');
      }
    } catch (error) {
      console.error('Error approving refund:', error);
      toast.error('Error approving refund');
    }
  };

  // Handle refund rejection
  const handleRejectRefund = async (refundRequest) => {
    const token = getToken();

    if (!token) {
      toast.error('Please login to process refund');
      return;
    }

    try {
      const requestBody = {
        lobbyId: refundRequest.lobbyId?._id,
        playerId: refundRequest.playerId?._id
      };

      // Validate required fields
      if (!requestBody.lobbyId || !requestBody.playerId) {
        toast.error('Missing required data for refund rejection');
        return;
      }

      const response = await fetch('https://api.toptopfootball.com/api/v1/refund/reject-refund-request', {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Refund rejected successfully');
        // Refresh refund requests
        fetchRefundRequests();
      } else {
        toast.error(result.message || 'Failed to reject refund');
      }
    } catch (error) {
      console.error('Error rejecting refund:', error);
      toast.error('Error rejecting refund');
    }
  };

  // Toggle private key visibility
  const togglePrivateKeyVisibility = (paymentId) => {
    setShowPrivateKey(prev => ({
      ...prev,
      [paymentId]: !prev[paymentId]
    }));
  };

  // Format date from API
  const formatMatchDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format time from API
  const formatMatchTime = (timeString) => {
    if (!timeString) return 'N/A';

    try {
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
      }

      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  // Format tournament date
  const formatTournamentDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format payment creation date
  const formatPaymentDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get player avatar or default
  const getPlayerAvatar = (player) => {
    if (player?.imageUrl) {
      return (
        <img
          src={player.imageUrl}
          alt={player.FullName}
          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
        <User className="w-4 h-4 text-blue-600" />
      </div>
    );
  };

  // Get team logo or default
  const getTeamLogo = (team) => {
    if (team?.image || team?.imageUrl) {
      return (
        <img
          src={team.image || team.imageUrl}
          alt={team.teamName || 'Team'}
          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center border-2 border-gray-200">
        <Shield className="w-4 h-4 text-purple-600" />
      </div>
    );
  };

  // Get team name safely
  const getTeamName = (team) => {
    if (!team) return 'Unknown Team';
    return team.teamName || 'Unknown Team';
  };

  // Get player stats for display
  const getPlayerStats = (player) => {
    if (!player) return null;

    return {
      matches: player.match || 0,
      rating: player.rating?.toFixed(1) || '0.0',
      goals: player.goal || 0,
      assists: player.assists || 0,
      yellowCards: player.yellowCard || 0,
      redCards: player.redCard || 0
    };
  };

  // Transform API data
  const transformedPayments = useMemo(() => {
    return payments.map(payment => {
      const lobby = payment.lobbyId;
      const tournament = payment.tournamentId;
      const player = payment.playerId;
      const team = payment.teamId;

      // Common fields
      const baseData = {
        id: payment._id,
        rawPayment: payment,
        paymentDate: formatPaymentDate(payment.createdAt),
        amount: payment.price || 0,
        formattedAmount: `${payment.price || 0} AED`,
        status: payment.status,
        method: payment.method || 'cash',
        pending: payment.status === 'pending',
        paymentType: payment.paymentType || 'team fee',
        playerPosition: payment.matchPosition || 'Player',
        guestPlayer: payment.guest_player || false
      };

      // Team Fee Payment (Player payment for lobby)
      if (payment.paymentType === 'team fee' && lobby) {
        const playerStats = getPlayerStats(player);

        return {
          ...baseData,
          type: 'TEAM_FEE',
          title: 'Player Match Payment',
          subtitle: lobby?.title || 'Unknown Lobby',
          player: player ? {
            id: player._id,
            name: player.FullName || 'Unknown Player',
            userName: player.userName || 'N/A',
            email: player.email || 'N/A',
            nationality: player.nationality || 'N/A',
            age: player.age || 'N/A',
            avatar: getPlayerAvatar(player),
            stats: playerStats
          } : null,
          lobby: {
            id: lobby?._id,
            title: lobby?.title || 'Unknown Lobby',
            date: formatMatchDate(lobby?.date),
            time: formatMatchTime(lobby?.time),
            location: lobby?.location?.address || 'Unknown Location',
            matchTime: lobby?.matchTime || 'N/A',
            teamSize: lobby?.teamSize || 7,
            matchType: lobby?.matchType || 'solo',
            matchPrivacy: lobby?.matchPrivacy || 'public',
            privateKey: lobby?.privateKey,
            hasGoalkeeper: lobby?.goalkeeper || false,
            hasReferee: lobby?.referee || false,
            hasCamera: lobby?.camera || false,
            goalTeam1: lobby?.goalTeam1 || 0,
            goalTeam2: lobby?.goalTeam2 || 0,
            matchFormat: payment.matchFormat || 'N/A'
          },
          team: team ? {
            id: team._id,
            name: getTeamName(team),
            logo: getTeamLogo(team)
          } : null,
          isTournament: false
        };
      }

      // Tournament Fee Payment (Team payment for tournament)
      if (payment.paymentType === 'tournament fee' && tournament) {
        return {
          ...baseData,
          type: 'TOURNAMENT_FEE',
          title: 'Tournament Registration',
          subtitle: tournament?.name || 'Unknown Tournament',
          team: team ? {
            id: team._id,
            name: getTeamName(team),
            logo: getTeamLogo(team),
            totalMatch: team?.totalMatch || 0,
            win: team?.win || 0,
            draw: team?.draw || 0,
            loss: team?.loss || 0,
            players: team?.players?.length || 0
          } : null,
          tournament: {
            id: tournament?._id,
            name: tournament?.name || 'Unknown Tournament',
            type: tournament?.type || 'Standing',
            startDate: formatTournamentDate(tournament?.startDate),
            duration: tournament?.duration || 0,
            location: tournament?.location?.address || 'Unknown Location',
            fieldSize: tournament?.fieldSize || 5,
            maxTeams: tournament?.maxTeam || 16,
            currentTeams: tournament?.teams?.length || 0,
            status: tournament?.status || 'active'
          },
          isTournament: true
        };
      }

      // Fallback for unknown payment types
      return {
        ...baseData,
        type: 'UNKNOWN',
        title: 'Unknown Payment Type',
        subtitle: 'No information available',
        isTournament: false
      };
    });
  }, [payments]);

  // Transform refund request data
  const transformedRefundRequests = useMemo(() => {
    return refundRequests.map(refund => {
      const lobby = refund.lobbyId;
      const tournament = refund.tournamentId;
      const player = refund.playerId;
      const team = refund.teamId;

      // Base refund data
      const baseRefundData = {
        id: refund._id,
        rawData: refund,
        requestDate: formatPaymentDate(refund.createdAt),
        refundAmount: refund.price || 0,
        formattedRefundAmount: `${refund.price || 0} AED`,
        status: refund.status,
        paymentType: refund.paymentType || 'team fee',
        isTournament: !!tournament
      };

      // Lobby refund
      if (lobby) {
        return {
          ...baseRefundData,
          type: 'LOBBY_REFUND',
          title: 'Lobby Match Refund',
          player: player ? {
            id: player._id,
            name: player.FullName || 'Unknown Player',
            userName: player.userName || 'N/A'
          } : null,
          lobby: {
            id: lobby?._id,
            title: lobby?.title || 'Unknown Lobby',
            date: formatMatchDate(lobby?.date),
            time: formatMatchTime(lobby?.time),
            location: lobby?.location?.address || 'Unknown Location'
          },
          team: team ? {
            id: team._id,
            name: getTeamName(team),
            logo: getTeamLogo(team)
          } : null
        };
      }

      // Tournament refund
      if (tournament) {
        return {
          ...baseRefundData,
          type: 'TOURNAMENT_REFUND',
          title: 'Tournament Refund',
          team: team ? {
            id: team._id,
            name: getTeamName(team),
            logo: getTeamLogo(team)
          } : null,
          tournament: {
            id: tournament?._id,
            name: tournament?.name || 'Unknown Tournament',
            startDate: formatTournamentDate(tournament?.startDate)
          }
        };
      }

      // Fallback
      return {
        ...baseRefundData,
        type: 'UNKNOWN_REFUND',
        title: 'Unknown Refund Request'
      };
    });
  }, [refundRequests]);

  // Filter payments based on active tab
  const filteredPayments = useMemo(() => {
    let filtered = transformedPayments;

    // Filter by payment type
    if (activeTab === 'Team Fees') {
      filtered = filtered.filter(payment => payment.type === 'TEAM_FEE');
    } else if (activeTab === 'Tournament Fees') {
      filtered = filtered.filter(payment => payment.type === 'TOURNAMENT_FEE');
    } else if (activeTab === 'Refund Requests') {
      return transformedRefundRequests;
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.player?.name?.toLowerCase().includes(searchLower) ||
          item.player?.userName?.toLowerCase().includes(searchLower) ||
          item.team?.name?.toLowerCase().includes(searchLower) ||
          item.lobby?.title?.toLowerCase().includes(searchLower) ||
          item.tournament?.name?.toLowerCase().includes(searchLower) ||
          item.title?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Additional filters
    if (activeTab !== 'Refund Requests') {
      if (filters.paymentMethod !== 'all') {
        filtered = filtered.filter(payment => payment.method === filters.paymentMethod);
      }
      if (filters.paymentStatus !== 'all') {
        filtered = filtered.filter(payment => payment.status === filters.paymentStatus);
      }
      if (filters.matchType !== 'all') {
        filtered = filtered.filter(payment =>
          payment.lobby?.matchType?.toLowerCase().includes(filters.matchType.toLowerCase())
        );
      }
      if (filters.position !== 'all') {
        filtered = filtered.filter(payment =>
          payment.playerPosition?.toLowerCase() === filters.position.toLowerCase()
        );
      }
    }

    return filtered;
  }, [transformedPayments, transformedRefundRequests, activeTab, searchTerm, filters]);

  // Get positions from team fee payments
  const availablePositions = useMemo(() => {
    const positions = new Set();
    transformedPayments.forEach(payment => {
      if (payment.type === 'TEAM_FEE' && payment.playerPosition) {
        positions.add(payment.playerPosition);
      }
    });
    return Array.from(positions).sort();
  }, [transformedPayments]);

  // Status badge component
  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { color: 'bg-green-100 text-green-800', text: 'Paid', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed', icon: XCircle },
      refund: { color: 'bg-blue-100 text-blue-800', text: 'Refunded', icon: DollarSign },
      accept: { color: 'bg-green-100 text-green-800', text: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.text}</span>
      </span>
    );
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      paymentMethod: 'all',
      paymentStatus: 'all',
      matchType: 'all',
      position: 'all'
    });
  };

  // Loading state
  const isLoading = loading || (activeTab === 'Refund Requests' && refundLoading);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  // Render Team Fee Payment Card
  const renderTeamFeeCard = (payment) => (
    <div key={payment.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Trophy className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{payment.title}</h3>
            <p className="text-sm text-gray-600">{payment.subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">{payment.formattedAmount}</div>
          <div className="text-xs text-gray-500 mt-1">{payment.paymentDate}</div>
        </div>
      </div>

      {/* Payment Status & Details */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getStatusBadge(payment.status)}
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
            {payment.method.toUpperCase()}
          </span>
          {payment.guestPlayer && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              Guest Player
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600">
          Position: <span className="font-medium">{payment.playerPosition}</span>
        </div>
      </div>

      {/* Player Information */}
      <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4" />
            Player Details
          </h4>
          {payment.player?.stats && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{payment.player.stats.rating}</span>
            </div>
          )}
        </div>
        {payment.player ? (
          <>
            <div className="flex items-center gap-3">
              {payment.player.avatar}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{payment.player.name}</div>
                <div className="text-sm text-gray-600">@{payment.player.userName}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{payment.player.nationality}</span>
                  <span>•</span>
                  <span>Age: {payment.player.age}</span>
                </div>
              </div>
            </div>
            {payment.player.stats && (
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-blue-200">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{payment.player.stats.matches}</div>
                  <div className="text-xs text-gray-500">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{payment.player.stats.goals}</div>
                  <div className="text-xs text-gray-500">Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{payment.player.stats.assists}</div>
                  <div className="text-xs text-gray-500">Assists</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-2 text-gray-500">
            No player information available
          </div>
        )}
      </div>

      {/* Lobby Information */}
      <div className="bg-green-50 rounded-lg p-3 mb-3 border border-green-100">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Gamepad2 className="w-4 h-4" />
          Match Information
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Date:</span>
              <span className="text-gray-700">{payment.lobby?.date || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Time:</span>
              <span className="text-gray-700">{payment.lobby?.time || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Location:</span>
              <span className="text-gray-700 truncate">{payment.lobby?.location || 'N/A'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Format:</span>
              <span className="text-gray-700">{payment.lobby?.teamSize || 'N/A'}v{payment.lobby?.teamSize || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="font-medium">Duration:</span>
              <span className="text-gray-700">{payment.lobby?.matchTime || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Type:</span>
              <span className="text-gray-700 capitalize">{payment.lobby?.matchType || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Match Format */}
        {payment.lobby?.matchFormat && payment.lobby.matchFormat !== 'N/A' && (
          <div className="mt-2 pt-2 border-t border-green-200">
            <span className="text-sm font-medium text-gray-700">Formation: </span>
            <span className="text-sm text-gray-900">{payment.lobby.matchFormat}</span>
          </div>
        )}

        {/* Team Information */}
        {payment.team && (
          <div className="mt-2 pt-2 border-t border-green-200 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Team: </span>
            <div className="flex items-center gap-1">
              {payment.team.logo}
              <span className="text-sm text-gray-900">{payment.team.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Match Features */}
      <div className="flex flex-wrap gap-2 mb-3">
        {payment.lobby?.hasGoalkeeper && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            🥅 Goalkeeper
          </span>
        )}
        {payment.lobby?.hasReferee && (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
            👨‍⚖️ Referee
          </span>
        )}
        {payment.lobby?.hasCamera && (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            📹 Camera
          </span>
        )}
        {payment.lobby?.matchPrivacy === 'private' && (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            Private Match
          </span>
        )}
      </div>

      {/* Score if available */}
      {(payment.lobby?.goalTeam1 > 0 || payment.lobby?.goalTeam2 > 0) && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 text-center">
            Score: <span className="text-gray-900">{payment.lobby.goalTeam1} - {payment.lobby.goalTeam2}</span>
          </div>
        </div>
      )}

      {/* Private Key Section */}
      {payment.lobby?.matchPrivacy === 'private' && payment.lobby?.privateKey && (
        <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-purple-800">Private Key:</span>
              <span className={`text-sm font-mono ${showPrivateKey[payment.id] ? 'text-purple-600' : 'text-purple-400'}`}>
                {showPrivateKey[payment.id] ? payment.lobby.privateKey : '••••••••••••••••'}
              </span>
            </div>
            <button
              onClick={() => togglePrivateKeyVisibility(payment.id)}
              className="p-1 text-purple-600 hover:bg-purple-100 rounded"
            >
              {showPrivateKey[payment.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons for cash payments */}
      {payment.method === "cash" && payment.status === "pending" && (
        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            onClick={() => updatePaymentStatus(payment.rawPayment._id, 'success')}
            className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve Payment
          </button>
          <button
            onClick={() => updatePaymentStatus(payment.rawPayment._id, 'failed')}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Reject Payment
          </button>
        </div>
      )}
    </div>
  );

  // Render Tournament Fee Payment Card
  const renderTournamentFeeCard = (payment) => {
    const team = payment.team || {};
    const tournament = payment.tournament || {};

    return (
      <div key={payment.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{payment.title}</h3>
              <p className="text-sm text-gray-600">{payment.subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{payment.formattedAmount}</div>
            <div className="text-xs text-gray-500 mt-1">{payment.paymentDate}</div>
          </div>
        </div>

        {/* Payment Status & Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusBadge(payment.status)}
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
              {payment.method.toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Tournament Registration Fee
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-100">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Team Details
          </h4>
          {team.id ? (
            <>
              <div className="flex items-center gap-3">
                {getTeamLogo(team)}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{team.name}</div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{team.players || 0} Players</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3" />
                      <span>{team.totalMatch || 0} Matches</span>
                    </div>
                  </div>
                </div>
              </div>
              {team.totalMatch > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-purple-200">
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">{team.win || 0}</div>
                    <div className="text-xs text-gray-500">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-yellow-600">{team.draw || 0}</div>
                    <div className="text-xs text-gray-500">Draws</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-red-600">{team.loss || 0}</div>
                    <div className="text-xs text-gray-500">Losses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-600">
                      {((team.win / team.totalMatch) * 100 || 0).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">Win Rate</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-2 text-gray-500">
              No team information available
            </div>
          )}
        </div>

        {/* Tournament Information */}
        <div className="bg-green-50 rounded-lg p-3 mb-3 border border-green-100">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Tournament Information
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Start Date:</span>
                <span className="text-gray-700">{tournament.startDate || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Location:</span>
                <span className="text-gray-700 truncate">{tournament.location || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="font-medium">Duration:</span>
                <span className="text-gray-700">{tournament.duration || 0} days</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Format:</span>
                <span className="text-gray-700">{tournament.fieldSize || 5}v{tournament.fieldSize || 5}</span>
              </div>
            </div>
          </div>

          {/* Tournament Status and Teams */}
          <div className="mt-2 pt-2 border-t border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tournament.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {tournament.status || 'N/A'}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                Teams: <span className="font-medium">{tournament.currentTeams || 0}/{tournament.maxTeams || 0}</span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-sm font-medium text-gray-700">Type: </span>
              <span className="text-sm text-gray-900">{tournament.type || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons for cash payments */}
        {payment.method === "cash" && payment.status === "pending" && (
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              onClick={() => updatePaymentStatus(payment.rawPayment._id, 'success')}
              className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Payment
            </button>
            <button
              onClick={() => updatePaymentStatus(payment.rawPayment._id, 'failed')}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject Payment
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render Refund Request Card
  const renderRefundRequestCard = (refund) => {
    const team = refund.team || {};
    const player = refund.player || {};
    const lobby = refund.lobby || {};
    const tournament = refund.tournament || {};

    return (
      <div key={refund.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <LogOut className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{refund.title}</h3>
              <p className="text-sm text-gray-600">
                {refund.type === 'LOBBY_REFUND' ? lobby?.title : tournament?.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-600 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {refund.formattedRefundAmount}
            </div>
            <div className="text-xs text-gray-500 mt-1">{refund.requestDate}</div>
          </div>
        </div>

        {/* Refund Status */}
        <div className="flex items-center justify-between mb-4">
          {getStatusBadge(refund.status)}
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
            {refund.isTournament ? 'Tournament' : 'Lobby'}
          </span>
        </div>

        {/* Player/Team Information */}
        <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            {team.id ? 'Team Details' : 'Player Details'}
          </h4>
          {team.id ? (
            <div className="flex items-center gap-3">
              {getTeamLogo(team)}
              <div>
                <div className="font-medium text-gray-900">{team.name}</div>
                <div className="text-sm text-gray-600">Team Registration</div>
              </div>
            </div>
          ) : player.id ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{player.name}</div>
                <div className="text-sm text-gray-600">@{player.userName}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2 text-gray-500">
              No information available
            </div>
          )}
        </div>

        {/* Event Information */}
        <div className="bg-green-50 rounded-lg p-3 mb-3 border border-green-100">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            {refund.isTournament ? <Award className="w-4 h-4" /> : <Gamepad2 className="w-4 h-4" />}
            {refund.isTournament ? 'Tournament Info' : 'Lobby Info'}
          </h4>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Date:</span>
              <span className="text-gray-700">
                {refund.isTournament ? tournament.startDate : lobby.date}
              </span>
            </div>
            {!refund.isTournament && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Time:</span>
                <span className="text-gray-700">{lobby.time}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Location:</span>
              <span className="text-gray-700">
                {refund.isTournament ? tournament.location : lobby.location}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {refund.status === 'pending' && (
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              onClick={() => handleApproveRefund(refund.rawData)}
              className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Refund
            </button>
            <button
              onClick={() => handleRejectRefund(refund.rawData)}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject Refund
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Payments Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage all payment transactions and refund requests
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:flex-none">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'Refund Requests' ? "Search refund requests..." :
                    activeTab === 'Team Fees' ? "Search player payments..." :
                      activeTab === 'Tournament Fees' ? "Search team payments..." :
                        "Search all payments..."
                }
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab !== 'Refund Requests' && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg ${showFilters ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Filter className="w-5 h-5" />
              </button>
            )}
            <div className="flex hidden items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 ${viewMode === 'cards' ? 'bg-gray-100 text-gray-700' : 'text-gray-400'}`}
              >
                <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400'}`}
              >
                <div className="space-y-1 w-5 h-5">
                  <div className="bg-current h-1 rounded-full"></div>
                  <div className="bg-current h-1 rounded-full"></div>
                  <div className="bg-current h-1 rounded-full"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm text-gray-600">Total Payments</div>
            <div className="text-xl font-bold text-gray-900">{transformedPayments.length}</div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {transformedPayments.filter(p => p.type === 'TEAM_FEE').length} Team Fees
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              {transformedPayments.filter(p => p.type === 'TOURNAMENT_FEE').length} Tournament Fees
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm text-gray-600">Pending Payments</div>
            <div className="text-xl font-bold text-yellow-600">
              {transformedPayments.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Require action</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-xl font-bold text-green-600">
              {transformedPayments.reduce((sum, p) => sum + p.amount, 0)} AED
            </div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm text-gray-600">Refund Requests</div>
            <div className="text-xl font-bold text-orange-600">{transformedRefundRequests.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {transformedRefundRequests.filter(r => r.status === 'pending').length} pending
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && activeTab !== 'Refund Requests' && (
        <div className="bg-white px-4 py-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Filter Payments</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.paymentMethod}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.paymentStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="success">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refund">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Match Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.matchType}
                onChange={(e) => setFilters(prev => ({ ...prev, matchType: e.target.value }))}
              >
                <option value="all">All Types</option>
                <option value="solo">Solo</option>
                <option value="teams">Teams</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Player Position</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.position}
                onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
              >
                <option value="all">All Positions</option>
                {availablePositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white flex overflow-x-auto border-b">
        {['All Payments', 'Team Fees', 'Tournament Fees', 'Refund Requests'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            {tab}
            {tab === 'Team Fees' && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {transformedPayments.filter(p => p.type === 'TEAM_FEE').length}
              </span>
            )}
            {tab === 'Tournament Fees' && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                {transformedPayments.filter(p => p.type === 'TOURNAMENT_FEE').length}
              </span>
            )}
            {tab === 'Refund Requests' && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
                {transformedRefundRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
              <DollarSign className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {activeTab === 'Refund Requests'
                ? 'No refund requests are currently pending or match your search criteria.'
                : 'No payments match your current filters or search criteria.'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'list' ? 'space-y-2' : 'space-y-4'}>
            {activeTab === 'Refund Requests'
              ? filteredPayments.map(renderRefundRequestCard)
              : filteredPayments.map(payment =>
                payment.type === 'TEAM_FEE'
                  ? renderTeamFeeCard(payment)
                  : renderTournamentFeeCard(payment)
              )
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;