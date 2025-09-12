import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, Calendar, Clock, MapPin } from 'lucide-react';

const CreateLobbyForm = ({ onClose }) => {
  const [matchType, setMatchType] = useState('Solo');
  const [matchPrivacy, setMatchPrivacy] = useState('Public');
  const [teamSize, setTeamSize] = useState('7v7');
  const [goalkeeper, setGoalkeeper] = useState(true);
  const [camera, setCamera] = useState(true);

  const ToggleSwitch = ({ isOn, onToggle }) => (
    <div 
      className={`w-12 h-6 rounded-full cursor-pointer transition-colors duration-300 ${
        isOn ? 'bg-green-400' : 'bg-gray-200'
      }`}
      onClick={onToggle}
    >
      <div 
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 mt-0.5 ${
          isOn ? 'translate-x-6 ml-0.5' : 'translate-x-0 ml-0.5'
        }`}
      />
    </div>
  );

  return (
    <div className="bg-white min-h-screen w-5/6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <button
            className="flex items-center font-semibold text-black mb-6"
            onClick={onClose}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            <span>Back to Lobbies</span>
          </button>
          {/* <h1 className="text-lg font-semibold text-gray-900">Create Lobby</h1> */}
        </div>
        <button className="bg-green-400 text-white px-4 py-2 rounded-lg font-medium">
          Create Lobby
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Lobby Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lobby Title</label>
          <input
            type="text"
            placeholder="Friendly Practice Match"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          />
        </div>

        {/* Team Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team 1</label>
            <div className="relative">
              <select className="w-full p-3 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-500">
                <option>Select Team 1</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team 2</label>
            <div className="relative">
              <select className="w-full p-3 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-500">
                <option>Select Team 2</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Match Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Match Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMatchType('Solo')}
              className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                matchType === 'Solo'
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              Solo
            </button>
            <button
              onClick={() => setMatchType('Team')}
              className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                matchType === 'Team'
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
              onClick={() => setMatchPrivacy('Public')}
              className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                matchPrivacy === 'Public'
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setMatchPrivacy('Private')}
              className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                matchPrivacy === 'Private'
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              Private
            </button>
          </div>
        </div>

        {/* Match Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Match Duration</label>
          <div className="relative">
            <select className="w-full p-3 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-700">
              <option>90 minutes</option>
              <option>60 minutes</option>
              <option>45 minutes</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select Date"
                className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-500"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select Time"
                className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-500"
              />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Select Location"
              className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-gray-500"
            />
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Team Size Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Team Size (Format)</label>
          <div className="grid grid-cols-4 gap-2">
            {['7v7', '8v8', '9v9', '10v10', '11v11'].map((size) => (
              <button
                key={size}
                onClick={() => setTeamSize(size)}
                className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                  teamSize === size
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Switches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Goalkeeper</span>
            <ToggleSwitch 
              isOn={goalkeeper} 
              onToggle={() => setGoalkeeper(!goalkeeper)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Referee</span>
            <ToggleSwitch 
              isOn={false} 
              onToggle={() => {}} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Camera</span>
            <ToggleSwitch 
              isOn={camera} 
              onToggle={() => setCamera(!camera)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLobbyForm;