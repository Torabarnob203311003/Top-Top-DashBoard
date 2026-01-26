/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Flag, DollarSign, Shield, ShieldOff, Plus, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create tournament form state - Updated according to schema
  const [createFormData, setCreateFormData] = useState({
    name: "",
    type: "Standing",
    price: 0,
    location: {
      lat: 0,
      lng: 0,
      address: ""
    },
    startDate: "",
    duration: 1,
    fieldSize: 5,
    maxTeam: 16
  });
  const [tournamentImage, setTournamentImage] = useState(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [creatingTournament, setCreatingTournament] = useState(false);

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

  // Handle create tournament form input changes
  const handleCreateFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCreateFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCreateFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle location search
  const handleLocationSearch = async (query) => {
    setLocationSearch(query);

    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.toptopfootball.com/api/autocomplete?input=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.predictions && Array.isArray(data.predictions)) {
        setLocationSuggestions(data.predictions);
        setShowLocationSuggestions(true);
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  // Handle location selection
  const handleLocationSelect = async (placeId) => {
    try {
      const response = await fetch(
        `https://api.toptopfootball.com/api/place-details?place_id=${placeId}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data) {
        const { lat, lng } = data;
        const address = data.formatted_address || data.name || "Selected Location";

        setCreateFormData(prev => ({
          ...prev,
          location: {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            address
          }
        }));
        setLocationSearch(address);
        setShowLocationSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      toast.error('Failed to fetch location details');
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG, JPEG)');
        return;
      }
      setTournamentImage(file);
      toast.success('Image selected successfully');
    }
  };

  // Create tournament - Updated according to schema requirements
  // Update the handleCreateTournament function - FIXED VERSION
  const handleCreateTournament = async () => {
    // Validate required fields according to schema
    if (!createFormData.name.trim()) {
      toast.error('Tournament name is required');
      return;
    }

    if (!createFormData.startDate) {
      toast.error('Start date is required');
      return;
    }

    if (!createFormData.duration || createFormData.duration < 1) {
      toast.error('Duration must be at least 1 day');
      return;
    }

    if (!createFormData.location.address.trim() ||
      createFormData.location.lat === 0 ||
      createFormData.location.lng === 0) {
      toast.error('Valid location is required');
      return;
    }

    if (!tournamentImage) {
      toast.error('Tournament image is required');
      return;
    }

    setCreatingTournament(true);

    try {
      // Prepare FormData exactly as your backend expects
      const formData = new FormData();

      // Append the tournament data as a JSON string in 'data' field
      const tournamentData = {
        name: createFormData.name,
        type: createFormData.type,
        price: Number(createFormData.price),
        location: {
          lat: Number(createFormData.location.lat),
          lng: Number(createFormData.location.lng),
          address: createFormData.location.address
        },
        startDate: new Date(createFormData.startDate).toISOString(),
        duration: Number(createFormData.duration),
        fieldSize: Number(createFormData.fieldSize),
        maxTeam: Number(createFormData.maxTeam),
        teams: [],
        qualifiedTeams: [],
        winner: null
      };

      console.log('Sending tournament data:', tournamentData);

      // Convert to JSON string
      const jsonData = JSON.stringify(tournamentData);
      console.log('JSON data:', jsonData);

      formData.append('data', jsonData);

      // Append image file with key 'images' (not 'image')
      formData.append('images', tournamentImage);

      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Get authorization token if available
      const token = localStorage.getItem('accessToken');
      console.log('Authorization token available:', !!token);

      // Prepare headers
      const headers = {};
      if (token) {
        headers['Authorization'] = token;
      }
      // DO NOT set Content-Type for FormData - browser will set it automatically

      // Send request to create tournament
      const response = await fetch('https://api.toptopfootball.com/api/v1/tournament/create-tournament', {
        method: 'POST',
        headers: headers, // Only authorization header, no Content-Type
        body: formData,
      });

      console.log('Response status:', response.status);

      // Try to get the response text first for debugging
      const responseText = await response.text();
      console.log('Response text:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }

      console.log('Create tournament response:', result);

      if (result.success) {
        toast.success('Tournament created successfully!');
        // Close modal and reset form
        setShowCreateModal(false);
        resetCreateForm();
        // Refresh tournaments list
        fetchTournaments();
      } else {
        toast.error(result.message || 'Failed to create tournament');
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Error creating tournament: ' + (error.message || 'Unknown error'));
    } finally {
      setCreatingTournament(false);
    }
  };
  // Reset create form
  const resetCreateForm = () => {
    setCreateFormData({
      name: "",
      type: "Standing",
      price: 0,
      location: {
        lat: 0,
        lng: 0,
        address: ""
      },
      startDate: "",
      duration: 1,
      fieldSize: 5,
      maxTeam: 16
    });
    setTournamentImage(null);
    setLocationSearch("");
    setLocationSuggestions([]);
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
    return `${price} AED`;
  };

  // Format duration
  const formatDuration = (days) => {
    return `${days} ${days === 1 ? 'Day' : 'Days'}`;
  };

  // Format field size according to schema enum
  const formatFieldSize = (size) => {
    const fieldSizeMap = {
      5: "5v5",
      7: "7v7",
      8: "8v8",
      9: "9v9",
      11: "11v11"
    };
    return fieldSizeMap[size] || `${size}v${size}`;
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Tournament
          </button>
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
                  src={tournament.imageUrl || '/default-tournament.png'}
                  alt={tournament.name}
                  className="w-16 h-16 object-contain rounded"
                  onError={(e) => {
                    e.target.src = '/default-tournament.png';
                  }}
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
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 text-sm">{formatPrice(tournament.price)}</span>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  <span>Type: {tournament.type}</span>
                  <span className="mx-2">•</span>
                  <span>Max Teams: {tournament.maxTeam}</span>
                  <span className="mx-2">•</span>
                  <span>Registered: {tournament.teams?.length || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Tournament Modal - Updated according to schema */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Create New Tournament</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={creatingTournament}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Tournament Name (Required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => handleCreateFormChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter tournament name"
                  disabled={creatingTournament}
                />
              </div>

              {/* Tournament Type (Required - according to schema) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Type *
                </label>
                <select
                  value={createFormData.type}
                  onChange={(e) => handleCreateFormChange('type', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={creatingTournament}
                >
                  <option value="Standing">Standing</option>
                  <option value="Knockout">Knockout</option>
                </select>
              </div>

              {/* Price (Required in schema) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (AED) *
                </label>
                <input
                  type="number"
                  value={createFormData.price}
                  onChange={(e) => handleCreateFormChange('price', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter tournament price"
                  min="0"
                  step="0.01"
                  disabled={creatingTournament}
                />
              </div>

              {/* Location (Required in schema) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    onFocus={() => locationSearch.length >= 3 && setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Search location..."
                    disabled={creatingTournament}
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

                  {/* Location Suggestions */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {locationSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.place_id}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleLocationSelect(suggestion.place_id)}
                        >
                          <div className="text-sm text-gray-700">
                            {suggestion.description || suggestion.name || 'Location'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {createFormData.location.lat !== 0 && createFormData.location.lng !== 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {createFormData.location.address}
                    (Lat: {createFormData.location.lat.toFixed(6)}, Lng: {createFormData.location.lng.toFixed(6)})
                  </div>
                )}
              </div>

              {/* Start Date and Duration (Both Required) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={createFormData.startDate}
                    onChange={(e) => handleCreateFormChange('startDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                    disabled={creatingTournament}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    value={createFormData.duration}
                    onChange={(e) => handleCreateFormChange('duration', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Number of days"
                    min="1"
                    disabled={creatingTournament}
                  />
                </div>
              </div>

              {/* Field Size and Max Teams */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Size *
                  </label>
                  <select
                    value={createFormData.fieldSize}
                    onChange={(e) => handleCreateFormChange('fieldSize', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={creatingTournament}
                  >
                    <option value="5">5v5</option>
                    <option value="7">7v7</option>
                    <option value="8">8v8</option>
                    <option value="9">9v9</option>
                    <option value="11">11v11</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Teams *
                  </label>
                  <input
                    type="number"
                    value={createFormData.maxTeam}
                    onChange={(e) => handleCreateFormChange('maxTeam', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Maximum number of teams"
                    min="2"
                    max="100"
                    disabled={creatingTournament}
                  />
                </div>
              </div>

              {/* Tournament Image (Required for imageUrl in schema) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="tournament-image"
                    disabled={creatingTournament}
                  />
                  <label htmlFor="tournament-image" className={`cursor-pointer ${creatingTournament ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="flex flex-col items-center justify-center">
                      {tournamentImage ? (
                        <>
                          <img
                            src={URL.createObjectURL(tournamentImage)}
                            alt="Tournament preview"
                            className="h-32 w-auto object-contain rounded mb-2"
                          />
                          <p className="text-sm text-gray-600">{tournamentImage.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Click to change image (Max 5MB)
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                            <Plus className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Click to upload tournament image
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                {!tournamentImage && (
                  <p className="mt-1 text-sm text-red-600">Image is required</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={creatingTournament}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTournament}
                disabled={creatingTournament}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${creatingTournament
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
              >
                {creatingTournament ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  'Create Tournament'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tournaments;