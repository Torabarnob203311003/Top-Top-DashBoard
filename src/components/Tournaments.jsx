import React, { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Flag, DollarSign, Shield, ShieldOff } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch tournaments from API
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.toptopfootball.com/api/v1/tournament/all-tournament');
      const result = await response.json();

      if (result.success) {
        setTournaments(result.data);
        setFilteredTournaments(result.data);
      } else {
        toast.error('Failed to fetch tournaments');
      }
    } catch (error) {
      toast.error('Error fetching tournaments');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update tournament status
  const updateTournamentStatus = async (tournamentId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      const response = await fetch(`https://api.toptopfootball.com/api/v1/tournament/update-tournament/${tournamentId}`, {
        method: 'PATCH',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Tournament ${newStatus === 'block' ? 'blocked' : 'activated'} successfully`);
        // Refresh the tournaments list
        fetchTournaments();
      } else {
        toast.error(`Failed to ${newStatus === 'block' ? 'block' : 'activate'} tournament`);
      }
    } catch (error) {
      toast.error('Error updating tournament status');
      console.error('Error:', error);
    }
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredTournaments(tournaments);
    } else {
      const filtered = tournaments.filter(tournament =>
        tournament.name.toLowerCase().includes(term.toLowerCase()) ||
        tournament.location.address.toLowerCase().includes(term.toLowerCase()) ||
        tournament.type.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredTournaments(filtered);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format price
  const formatPrice = (price) => {
    return `$${price}`;
  };

  // Format duration
  const formatDuration = (days) => {
    return `${days} ${days === 1 ? 'Day' : 'Days'}`;
  };

  // Format field size
  const formatFieldSize = (size) => {
    return `${size}v${size}`;
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading tournaments...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 min-h-screen">
      {/* Toast Container */}
      <ToastContainer />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
        <div className="flex items-center gap-4">
          {/* <button className="bg-green-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600">
            Create Tournament
          </button>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600">Today</span>
            <span className="ml-1 text-gray-400">&#9660;</span>
          </div> */}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tournaments by name, location, or type..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tournament Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTournaments.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            {searchTerm ? 'No tournaments found matching your search.' : 'No tournaments available.'}
          </div>
        ) : (
          filteredTournaments.map((tournament) => (
            <div key={tournament._id} className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-5">
              {/* Logo */}
              <div className="w-20 h-20 flex items-center justify-center">
                <img
                  src={tournament.imageUrl}
                  alt={tournament.name}
                  className="w-16 h-16 object-contain rounded"
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-lg">{tournament.name}</h3>
                  <button
                    onClick={() => updateTournamentStatus(
                      tournament._id,
                      tournament.status === 'active' ? 'block' : 'active'
                    )}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${tournament.status === 'active'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                  >
                    {tournament.status === 'active' ? (
                      <>
                        <ShieldOff className="w-4 h-4" />
                        Block
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Unblock
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 text-sm font-medium">
                    {formatDuration(tournament.duration)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${tournament.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {tournament.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 text-sm">{tournament.location.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 text-sm">{formatDate(tournament.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flag className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 text-sm">{formatFieldSize(tournament.fieldSize)}</span>
                  </div>
                  <div className="flex items-center gap-1">

                    <span className="text-gray-600 text-sm">{formatPrice(tournament.price)}</span>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  <span>Type: {tournament.type}</span>
                  <span className="mx-2">•</span>
                  <span>Max Teams: {tournament.maxTeam}</span>
                  <span className="mx-2">•</span>
                  <span>Registered: {tournament.teams.length}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tournaments;