import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import CreateLobbyForm from './CreateLobbyForm'; // Make sure this file exists

function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const lobbies = [
    {
      id: 1,
      homeTeam: { name: 'Raging Bulls FC', short: 'RB' },
      awayTeam: { name: 'Thunder Strikers', short: 'TS' },
      date: '22 Jul 2025',
      location: 'New Westbury',
      time: '05:45 PM',
      duration: '60 Minutes',
      category: '7v7',
      prize: '$13',
      joined: '5/18'
    },
    {
      id: 2,
      homeTeam: { name: 'Raging Bulls FC', short: 'RB' },
      awayTeam: { name: 'Thunder Strikers', short: 'TS' },
      date: '22 Jul 2025',
      location: 'New Westbury',
      time: '05:45 PM',
      duration: '60 Minutes',
      category: '7v7',
      prize: '$13',
      joined: '5/18'
    },
    {
      id: 3,
      homeTeam: { name: 'Mighty Eagles', short: 'ME' },
      awayTeam: { name: 'Storm Chasers', short: 'SC' },
      date: '23 Jul 2025',
      location: 'Eastfield',
      time: '06:15 PM',
      duration: '45 Minutes',
      category: '8v8',
      prize: '$15',
      joined: '3/10'
    },
    {
      id: 4,
      homeTeam: { name: 'Fierce Falcons', short: 'FF' },
      awayTeam: { name: 'Lightning Warriors', short: 'LW' },
      date: '24 Jul 2025',
      location: 'Southridge',
      time: '07:00 PM',
      duration: '30 Minutes',
      category: '6v6',
      prize: '$12',
      joined: '4/12'
    }
  ];

  if (showCreate) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <CreateLobbyForm onClose={() => setShowCreate(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">All Lobbies</h1>
          <div className="flex items-center space-x-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2   rounded-lg flex items-center space-x-2 transition-colors"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Create Lobby</span>
            </button>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Today</option>
              <option>Tomorrow</option>
              <option>This Week</option>
            </select>
          </div>
        </div>

        {/* Lobbies List */}
        <div className="space-y-6">
          {lobbies
            .filter(lobby =>
              lobby.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              lobby.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((lobby) => (
            <div key={lobby.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                {/* Left Team */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{lobby.homeTeam.short}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lobby.homeTeam.name}</p>
                  </div>
                </div>

                {/* Center - Date and VS */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-500">{lobby.date}</p>
                  <p className="text-lg font-bold text-gray-900">VS</p>
                </div>

                {/* Right Team */}
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 text-right">{lobby.awayTeam.name}</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{lobby.awayTeam.short}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className="flex flex-wrap gap-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{lobby.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{lobby.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{lobby.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{lobby.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">{lobby.prize}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{lobby.joined} joined</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Products;