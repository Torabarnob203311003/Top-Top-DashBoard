/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronDown, Calendar, Clock, MapPin } from 'lucide-react';

const CreateLobbyForm = ({ onClose, onLobbyCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    team1: { teamId: "" },
    team2: { teamId: "" },
    matchTime: "90 minutes",
    location: { lat: 0, lng: 0, address: "" },
    price: "",
    teamSize: 7,
    goalkeeper: true,
    referee: false,
    camera: false,
    date: "",
    time: "",
    maxSlot: "",
    positionRequired: ["Forward", "Midfielder", "Defender", "Goalkeeper"],
    matchPrivacy: "public",
    matchType: "solo",
    privateKey: ""
  });

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Time format conversion function - 24h to 12h with AM/PM
  const formatTimeTo12Hour = (timeString) => {
    if (!timeString) return '';

    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const twelveHour = hour % 12 || 12;

      return `${twelveHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  // Convert date and time to ISO string for backend (date field)
  const formatDateToISO = (date, time) => {
    if (!date || !time) return '';

    try {
      // Combine date and time and convert to ISO string
      const dateTime = new Date(`${date}T${time}`);
      return dateTime.toISOString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Get 12-hour format time for backend (time field)
  const get12HourTime = (timeString) => {
    if (!timeString) return '';
    return formatTimeTo12Hour(timeString);
  };

  // Fetch teams from API
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.toptopfootball.com/api/v1/team/all-teams');
        const data = await response.json();

        if (Array.isArray(data)) {
          setTeams(data);
        } else if (data && Array.isArray(data.data)) {
          setTeams(data.data);
        } else if (data && Array.isArray(data.teams)) {
          setTeams(data.teams);
        } else {
          setTeams([]);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Handle location search with YOUR BACKEND API
  const handleLocationSearch = async (query) => {
    setLocationSearch(query);

    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
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
      console.log('Backend API response:', data);

      if (data.predictions && Array.isArray(data.predictions)) {
        setLocationSuggestions(data.predictions);
        setShowSuggestions(true);
      } else if (data.suggestions && Array.isArray(data.suggestions)) {
        // Jodi different structure hoy
        setLocationSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        console.log('No suggestions found');
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle location selection with YOUR BACKEND API
  const handleLocationSelect = async (placeId) => {
    try {
      // Apnar backend place details API use korchi
      const response = await fetch(
        `https://api.toptopfootball.com/api/place-details?place_id=${placeId}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Place details response:', data);

      // Different possible response structures handle korchi
      if (data) {
        // Google API structure
        const { lat, lng, address } = data;

        setFormData(prev => ({
          ...prev,
          location: { lat, lng, address }
        }));
        setLocationSearch(data.address);
        setShowSuggestions(false);
      } else if (data.location && data.location.lat && data.location.lng) {
        // Custom backend structure
        const { lat, lng } = data.location;
        setFormData(prev => ({
          ...prev,
          location: { lat, lng, address: data.name || data.address || "Selected Location" }
        }));
        setLocationSearch(data.name || data.address || "Selected Location");
        setShowSuggestions(false);
      } else if (data.lat && data.lng) {
        // Simple lat/lng structure
        const { lat, lng } = data;
        setFormData(prev => ({
          ...prev,
          location: { lat, lng, address: data.formatted_address || data.name || "Selected Location" }
        }));
        setLocationSearch(data.formatted_address || data.name || "Selected Location");
        setShowSuggestions(false);
      } else {
        console.error('Unexpected place details structure:', data);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  // Handle form data changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle team selection
  const handleTeamSelect = (teamField, teamId) => {
    setFormData(prev => ({
      ...prev,
      [teamField]: { teamId }
    }));
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a lobby title' });
      return false;
    }

    if (!formData.date) {
      setMessage({ type: 'error', text: 'Please select a date' });
      return false;
    }

    if (!formData.time) {
      setMessage({ type: 'error', text: 'Please select a time' });
      return false;
    }

    if (formData.location.lat === 0 && formData.location.lng === 0) {
      setMessage({ type: 'error', text: 'Please select a location' });
      return false;
    }

    if (formData.matchType === 'teams') {
      if (!formData.team1.teamId || !formData.team2.teamId) {
        setMessage({ type: 'error', text: 'Please select both teams for team match' });
        return false;
      }

      if (formData.team1.teamId === formData.team2.teamId) {
        setMessage({ type: 'error', text: 'Please select different teams' });
        return false;
      }
    }

    if (formData.matchPrivacy === 'private' && !formData.privateKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter a private key for private match' });
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Clear previous messages
    setMessage({ type: '', text: '' });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare data for backend with the specific format you need
      const submitData = {
        title: formData.title,
        matchTime: formData.matchTime,
        location: formData.location,
        price: Number(formData.price) || 0,
        teamSize: formData.teamSize,
        goalkeeper: formData.goalkeeper,
        referee: formData.referee,
        camera: formData.camera,
        date: formatDateToISO(formData.date, formData.time),
        time: get12HourTime(formData.time),
        maxSlot: Number(formData.maxSlot) || formData.teamSize * 2,
        positionRequired: formData.positionRequired,
        matchPrivacy: formData.matchPrivacy,
        matchType: formData.matchType,
        privateKey: formData.privateKey
      };

      // Add team data only if match type is teams
      if (formData.matchType === 'teams') {
        submitData.team1 = formData.team1;
        submitData.team2 = formData.team2;
      }

      console.log('Submitting data to backend:', submitData);

      const response = await fetch('https://api.toptopfootball.com/api/v1/lobby/create-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();
      console.log('Create lobby response:', result);

      if (response.ok && result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Lobby created successfully!'
        });

        // Call the refresh function from parent
        if (onLobbyCreated) {
          onLobbyCreated();
        }

        // Close form after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to create lobby. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error creating lobby:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const ToggleSwitch = ({ isOn, onToggle }) => (
    <div
      className={`w-12 h-6 rounded-full cursor-pointer transition-colors duration-300 ${isOn ? 'bg-green-400' : 'bg-gray-200'
        }`}
      onClick={onToggle}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 mt-0.5 ${isOn ? 'translate-x-6 ml-0.5' : 'translate-x-0 ml-0.5'
          }`}
      />
    </div>
  );

  // Get selected team details for display - with safe access
  const getSelectedTeam = (teamId) => {
    if (!teamId || !Array.isArray(teams)) return null;
    const team = teams.find(team => team._id === teamId);
    return team || null;
  };

  // Team size options with display format
  const teamSizeOptions = [
    { display: "7v7", value: 7 },
    { display: "8v8", value: 8 },
    { display: "9v9", value: 9 },
    { display: "10v10", value: 10 },
    { display: "11v11", value: 11 }
  ];

  return (
    <div className="bg-white min-h-screen w-5/6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <button
            className="flex items-center font-semibold text-black"
            onClick={onClose}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            <span>Back to Lobbies</span>
          </button>
        </div>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${submitting
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-green-400 text-white hover:bg-green-500'
            }`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Lobby'}
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mx-4 mt-4 p-3 rounded-lg ${message.type === 'error'
          ? 'bg-red-100 text-red-700 border border-red-300'
          : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
          {message.text}
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* Lobby Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lobby Title *</label>
          <input
            type="text"
            placeholder="Friendly Practice Match"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
        </div>

        {/* Team Selection - Only show when matchType is teams */}
        {formData.matchType === 'teams' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team 1 *</label>
              <div className="relative">
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-500"
                  value={formData.team1.teamId}
                  onChange={(e) => handleTeamSelect('team1', e.target.value)}
                >
                  <option value="">Select Team 1</option>
                  {Array.isArray(teams) && teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.teamName || 'Unnamed Team'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {formData.team1.teamId && getSelectedTeam(formData.team1.teamId) && (
                <div className="flex items-center mt-2">
                  {getSelectedTeam(formData.team1.teamId).image && (
                    <img
                      src={getSelectedTeam(formData.team1.teamId).image}
                      alt={getSelectedTeam(formData.team1.teamId).teamName || 'Team 1'}
                      className="w-6 h-6 rounded-full mr-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-sm text-gray-600">
                    {getSelectedTeam(formData.team1.teamId).teamName || 'Selected Team'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team 2 *</label>
              <div className="relative">
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-500"
                  value={formData.team2.teamId}
                  onChange={(e) => handleTeamSelect('team2', e.target.value)}
                >
                  <option value="">Select Team 2</option>
                  {Array.isArray(teams) && teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.teamName || 'Unnamed Team'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {formData.team2.teamId && getSelectedTeam(formData.team2.teamId) && (
                <div className="flex items-center mt-2">
                  {getSelectedTeam(formData.team2.teamId).image && (
                    <img
                      src={getSelectedTeam(formData.team2.teamId).image}
                      alt={getSelectedTeam(formData.team2.teamId).teamName || 'Team 2'}
                      className="w-6 h-6 rounded-full mr-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-sm text-gray-600">
                    {getSelectedTeam(formData.team2.teamId).teamName || 'Selected Team'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Match Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Match Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleInputChange('matchType', 'solo')}
              className={`p-3 rounded-lg border-2 font-medium transition-colors ${formData.matchType === 'solo'
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-white border-gray-200 text-gray-500'
                }`}
            >
              Solo
            </button>
            <button
              onClick={() => handleInputChange('matchType', 'teams')}
              className={`p-3 rounded-lg border-2 font-medium transition-colors ${formData.matchType === 'teams'
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-white border-gray-200 text-gray-500'
                }`}
            >
              Team
            </button>
          </div>
        </div>

        {/* Match Privacy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Match Privacy</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleInputChange('matchPrivacy', 'public')}
              className={`p-3 rounded-lg border-2 font-medium transition-colors ${formData.matchPrivacy === 'public'
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-white border-gray-200 text-gray-500'
                }`}
            >
              Public
            </button>
            <button
              onClick={() => handleInputChange('matchPrivacy', 'private')}
              className={`p-3 rounded-lg border-2 font-medium transition-colors ${formData.matchPrivacy === 'private'
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-white border-gray-200 text-gray-500'
                }`}
            >
              Private
            </button>
          </div>
        </div>

        {/* Private Key Input - Only show when privacy is private */}
        {formData.matchPrivacy === 'private' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Private Key *</label>
            <input
              type="text"
              placeholder="Enter private key for the match"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              value={formData.privateKey}
              onChange={(e) => handleInputChange('privateKey', e.target.value)}
            />
          </div>
        )}

        {/* Match Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Match Duration</label>
          <div className="relative">
            <select
              className="w-full p-3 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-700"
              value={formData.matchTime}
              onChange={(e) => handleInputChange('matchTime', e.target.value)}
            >
              <option value="90 minutes">90 minutes</option>
              <option value="60 minutes">60 minutes</option>
              <option value="45 minutes">45 minutes</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <div className="relative">
              <input
                type="date"
                className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-500"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
            <div className="relative">
              <input
                type="time"
                className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-500"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
              />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {/* AM/PM Display */}
            {formData.time && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                Selected Time: {formatTimeTo12Hour(formData.time)}
              </div>
            )}
          </div>
        </div>

        {/* Backend Format Preview */}
        {(formData.date && formData.time) && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Backend Data Format:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>date:</strong> "{formatDateToISO(formData.date, formData.time)}"</div>
              <div><strong>time:</strong> "{get12HourTime(formData.time)}"</div>
            </div>
          </div>
        )}

        {/* Location with YOUR BACKEND API Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search location..."
              className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-500"
              value={locationSearch}
              onChange={(e) => handleLocationSearch(e.target.value)}
              onFocus={() => locationSearch.length >= 3 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

            {/* Location Suggestions */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {locationSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onMouseDown={(e) => e.preventDefault()} // Prevents immediate blur
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
          {formData.location.lat !== 0 && formData.location.lng !== 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Selected Location: Lat: {formData.location.lat.toFixed(6)}, Lng: {formData.location.lng.toFixed(6)}
              {formData.location.address && ` - ${formData.location.address}`}
            </div>
          )}
        </div>

        {/* Team Size Format - UPDATED */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Team Size (Format)</label>
          <div className="grid grid-cols-5 gap-2">
            {teamSizeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('teamSize', option.value)}
                className={`p-3 rounded-lg border-2 font-medium transition-colors ${formData.teamSize === option.value
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-white border-gray-200 text-gray-500'
                  }`}
              >
                {option.display}
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Selected: {formData.teamSize} players per team ({formData.teamSize}v{formData.teamSize})
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (AED)</label>
          <input
            type="number"
            placeholder="Enter match price"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        {/* Max Slots */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Slots</label>
          <input
            type="number"
            placeholder="Enter maximum slots"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            value={formData.maxSlot}
            onChange={(e) => handleInputChange('maxSlot', e.target.value)}
            min={formData.teamSize * 2}
          />
          <div className="mt-1 text-xs text-gray-500">
            Recommended: {formData.teamSize * 2} slots ({formData.teamSize}v{formData.teamSize})
          </div>
        </div>

        {/* Toggle Switches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Goalkeeper</span>
            <ToggleSwitch
              isOn={formData.goalkeeper}
              onToggle={() => handleInputChange('goalkeeper', !formData.goalkeeper)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Referee</span>
            <ToggleSwitch
              isOn={formData.referee}
              onToggle={() => handleInputChange('referee', !formData.referee)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Camera</span>
            <ToggleSwitch
              isOn={formData.camera}
              onToggle={() => handleInputChange('camera', !formData.camera)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLobbyForm;