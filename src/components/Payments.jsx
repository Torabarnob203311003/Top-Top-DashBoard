/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, TrendingUp, User, MapPin, Calendar, Clock, Trophy, Star, X, Users, Shield, Footprints, DollarSign, LogOut, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('History');
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
      const response = await fetch('http://localhost:5000/api/v1/payment/all-payment', {
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
      const response = await fetch('http://localhost:5000/api/v1/refund/all-refund-request', {
        method: 'GET',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setRefundRequests(result.data);
        toast.success('Refund requests loaded successfully');
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
        const response = await fetch(`http://localhost:5000/api/v1/payment/payment-success?paymentId=${paymentId}`, {
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
        const response = await fetch(`http://localhost:5000/api/v1/payment/payment-cancel?paymentId=${paymentId}`, {
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
    console.log(refundRequest)

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

      const response = await fetch('http://localhost:5000/api/v1/refund/accept-refund-request', {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log(response)

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

  // Get team logo or default avatar
  const getTeamLogo = (team) => {
    if (team?.image || team?.imageUrl) {
      return (
        <img
          src={team.image || team.imageUrl}
          alt={team.teamName || team.FullName}
          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200">
        <Shield className="w-4 h-4 text-gray-600" />
      </div>
    );
  };

  // Get team name safely
  const getTeamName = (team) => {
    if (!team) return 'Unknown Team';
    return team.teamName || team.FullName || 'Unknown Team';
  };

  // Transform API data to match your component structure for payments
  const transformedPayments = useMemo(() => {
    return payments.map(payment => {
      const lobby = payment.lobbyId;
      const player = payment.playerId;
      const team = payment.teamId;

      return {
        id: payment._id,
        type: lobby?.title || 'Match Payment',
        player: player?.FullName || 'Unknown Player',
        userName: player?.userName || 'N/A',
        location: lobby?.location?.address || 'Unknown Location',
        matchDate: formatMatchDate(lobby?.date),
        matchTime: formatMatchTime(lobby?.time),
        paymentDate: formatPaymentDate(payment.createdAt),
        duration: lobby?.matchTime || 'N/A',
        score: `${lobby?.goalTeam1 || 0}v${lobby?.goalTeam2 || 0}`,
        rating: `$${payment.price}`,
        amount: `${payment.price} USD`,
        color: payment.status === 'success' ? 'text-green-500' :
          payment.status === 'pending' ? 'text-yellow-500' : 'text-red-500',
        status: payment.status,
        method: payment.method || (payment.paymentType === 'team fee' ? 'online' : 'cash'),
        pending: payment.status === 'pending',
        rawData: payment,

        matchType: lobby?.matchType || 'teams',
        teamSize: lobby?.teamSize || 7,
        position: payment.matchPosition || 'Player',
        hasGoalkeeper: lobby?.goalkeeper || false,
        hasReferee: lobby?.referee || false,
        hasCamera: lobby?.camera || false,
        matchPrivacy: lobby?.matchPrivacy || 'public',
        privateKey: lobby?.privateKey || null,
        price: payment.price || 0,

        // Lobby details
        lobbyTitle: lobby?.title || 'Unknown Lobby',
        lobbyDescription: lobby?.description || 'No description available',
        lobbyId: lobby?._id || 'N/A'
      };
    });
  }, [payments]);

  // Transform refund request data
  const transformedRefundRequests = useMemo(() => {
    return refundRequests.map(refund => {
      const lobby = refund.lobbyId;
      const player = refund.playerId;
      const team = refund.teamId;
      const matchDate = lobby?.date;
      const matchTime = lobby?.time;
      const requestDate = refund.createdAt;

      return {
        id: refund._id,
        lobbyId: lobby?._id,
        lobbyTitle: lobby?.title || 'Unknown Lobby',
        playerName: player?.FullName || 'Unknown Player',
        playerUserName: player?.userName || 'N/A',
        playerEmail: player?.email || 'N/A',
        playerId: player?._id,
        teamName: team?.teamName || 'Unknown Team',
        teamUserName: team?.userName || 'N/A',
        teamId: team?._id,
        location: lobby?.location?.address || 'Unknown Location',
        matchDate: formatMatchDate(matchDate),
        matchTime: formatMatchTime(matchTime),
        requestDate: formatPaymentDate(requestDate),
        refundAmount: `${refund.price} USD`,
        originalPrice: refund.price,
        status: refund.status,
        matchType: lobby?.matchType || 'teams',
        teamSize: lobby?.teamSize || 7,
        matchPrivacy: lobby?.matchPrivacy || 'public',
        hasGoalkeeper: lobby?.goalkeeper || false,
        hasReferee: lobby?.referee || false,
        hasCamera: lobby?.camera || false,
        rawData: refund // Keep original data for API calls
      };
    });
  }, [refundRequests]);

  // Available positions from payment data
  const availablePositions = useMemo(() => {
    const positions = [...new Set(transformedPayments.map(payment => payment.position))].filter(Boolean);
    return positions.sort();
  }, [transformedPayments]);

  const filteredPayments = useMemo(() => {
    let filtered = activeTab === 'History' ? transformedPayments : transformedRefundRequests;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.player?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.playerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lobbyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Additional filters for payment history
    if (activeTab === 'History') {
      if (filters.paymentMethod !== 'all') {
        filtered = filtered.filter(payment => payment.method === filters.paymentMethod);
      }
      if (filters.paymentStatus !== 'all') {
        filtered = filtered.filter(payment => payment.status === filters.paymentStatus);
      }
      if (filters.matchType !== 'all') {
        filtered = filtered.filter(payment =>
          payment.type.toLowerCase().includes(filters.matchType.toLowerCase())
        );
      }
      if (filters.position !== 'all') {
        filtered = filtered.filter(payment =>
          payment.position.toLowerCase() === filters.position.toLowerCase()
        );
      }
    }

    return filtered;
  }, [transformedPayments, transformedRefundRequests, activeTab, searchTerm, filters]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
      refund: { color: 'bg-green-100 text-green-800', text: 'Refund' },
      accept: { color: 'bg-green-100 text-green-800', text: 'accept' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getMatchTypeIcon = (matchType) => {
    switch (matchType) {
      case 'teams':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'individual':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <Trophy className="w-4 h-4 text-yellow-500" />;
    }
  };

  const clearFilters = () => {
    setFilters({
      paymentMethod: 'all',
      paymentStatus: 'all',
      matchType: 'all',
      position: 'all'
    });
  };

  const isLoading = loading || (activeTab === 'Refund Requests' && refundLoading);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {activeTab === 'Refund Requests' ? 'Loading refund requests...' : 'Loading payments...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <h1 className="text-lg font-medium text-gray-900">Payments</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'Refund Requests' ? "Search refund requests..." : "Search payments..."}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg ${showFilters ? 'bg-green-100 text-green-600' : 'text-gray-400'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Filters - Only show for History tab */}
      {showFilters && activeTab === 'History' && (
        <div className="bg-white px-4 py-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="w-3 h-3 mr-1" />
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
                <option value="success">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
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
                <option value="friendly">Friendly</option>
                <option value="championship">Championship</option>
                <option value="tournament">Tournament</option>
                <option value="charity">Charity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
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
      <div className="bg-white flex">
        <button
          onClick={() => setActiveTab('History')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'History'
            ? 'bg-green-500 text-white'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Payment History
        </button>
        <button
          onClick={() => setActiveTab('Refund Requests')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'Refund Requests'
            ? 'bg-green-500 text-white'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Refund Requests
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {activeTab === 'Refund Requests' ? 'No refund requests found' : 'No payments found'}
          </div>
        ) : (
          filteredPayments.map((item) => (
            <div key={item.id} className="bg-white rounded-lg mb-3 p-4 shadow-sm border border-gray-200">

              {activeTab === 'History' ? (
                // Payment History View - SHOW ONLY LOBBY AND PLAYER INFO
                <>
                  {/* Header with Lobby Title and Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{item.lobbyTitle}</h3>
                      {getStatusBadge(item.status)}
                      {item.matchPrivacy === 'private' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${item.color}`}>
                        {item.amount}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Paid on: {item.paymentDate}
                      </div>
                    </div>
                  </div>

                  {/* Player Information */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      Player Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-700">Name:</span>
                          <span className="text-gray-900">{item.player}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">Username:</span>
                          <span className="text-gray-900">@{item.userName}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-700">Position:</span>
                          <span className="text-gray-900 capitalize">{item.position}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">Payment Method:</span>
                          <span className="text-gray-900 capitalize">{item.method}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lobby Information */}
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Trophy className="w-4 h-4 mr-2 text-green-500" />
                      Lobby Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-medium text-gray-700">Location:</span>
                            <div className="text-gray-900">{item.location}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-medium text-gray-700">Date:</span>
                            <div className="text-gray-900">{item.matchDate}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-medium text-gray-700">Time:</span>
                            <div className="text-gray-900">{item.matchTime}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-medium text-gray-700">Match Type:</span>
                            <div className="text-gray-900 capitalize">{item.matchType}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-medium text-gray-700">Team Size:</span>
                            <div className="text-gray-900">{item.teamSize}v{item.teamSize}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <div>
                            <span className="font-medium text-gray-700">Duration:</span>
                            <div className="text-gray-900">{item.duration}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lobby Description */}
                    {item.lobbyDescription && item.lobbyDescription !== 'No description available' && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <span className="font-medium text-gray-700 text-sm">Description:</span>
                        <div className="text-gray-900 text-sm mt-1">{item.lobbyDescription}</div>
                      </div>
                    )}
                  </div>

                  {/* Match Features */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.hasGoalkeeper && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        🥅 Goalkeeper
                      </span>
                    )}
                    {item.hasReferee && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        👨‍⚖️ Referee
                      </span>
                    )}
                    {item.hasCamera && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        📹 Camera
                      </span>
                    )}
                  </div>

                  {/* Private Key Section (Admin Only) */}
                  {item.matchPrivacy === 'private' && item.privateKey && (
                    <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-purple-800">Private Key:</span>
                          <span className={`text-sm font-mono ${showPrivateKey[item.id] ? 'text-purple-600' : 'text-purple-400'}`}>
                            {showPrivateKey[item.id] ? item.privateKey : '••••••••••••••••'}
                          </span>
                        </div>
                        <button
                          onClick={() => togglePrivateKeyVisibility(item.id)}
                          className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                        >
                          {showPrivateKey[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FIXED: Show Mark Complete button for cash payments with pending status */}
                  {item.method === "cash" && item.status === "pending" && (
                    <div className="flex justify-end space-x-2 pt-3 border-t">
                      <button
                        onClick={() => updatePaymentStatus(item.id, 'success')}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => updatePaymentStatus(item.id, 'failed')}
                        className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Mark Failed
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // Refund Requests View (Unchanged)
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <LogOut className="w-5 h-5 text-orange-500" />
                      <h3 className="font-medium text-gray-900">Refund Request</h3>
                      {getStatusBadge(item.status)}
                      {item.matchPrivacy === 'private' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-orange-600 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {item.refundAmount}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Requested: {item.requestDate}
                      </div>
                    </div>
                  </div>

                  {/* Refund Details Section */}
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          Player Information
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div><span className="font-medium">Name:</span> {item.playerName}</div>
                          <div><span className="font-medium">Username:</span> {item.playerUserName}</div>
                          <div><span className="font-medium">Email:</span> {item.playerEmail}</div>
                          <div><span className="font-medium">Player ID:</span> {item.playerId}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lobby Information */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Trophy className="w-4 h-4 mr-2 text-purple-500" />
                      Lobby Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 font-medium">Lobby:</span>
                        <span className="text-gray-900">{item.lobbyTitle}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{item.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{item.matchDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{item.matchTime}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">Lobby ID:</span> {item.lobbyId}
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {item.teamSize}v{item.teamSize}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs capitalize">
                      {item.matchType}
                    </span>
                    {item.hasGoalkeeper && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        🥅 Goalkeeper
                      </span>
                    )}
                    {item.hasReferee && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        👨‍⚖️ Referee
                      </span>
                    )}
                    {item.hasCamera && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        📹 Camera
                      </span>
                    )}
                  </div>

                  {/* Action Buttons for Pending Requests */}
                  {item.status === 'pending' && (
                    <div className="flex justify-end space-x-2 pt-3 border-t">
                      <button
                        onClick={() => handleApproveRefund(item.rawData)}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center"
                      >
                        <span>Approve Refund</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Payments;