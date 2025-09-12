import React from "react";
import { Search, Calendar, MapPin, Flag, DollarSign } from 'lucide-react';

const tournaments = [
  {
    id: 1,
    logo: "/top-top-league.png", // Replace with your actual logo path
    name: "TopTop League",
    days: "5 Days",
    location: "New Westbury",
    date: "02 Aug 2025",
    category: "7v7",
    prize: "$13"
  },
  {
    id: 2,
    logo: "/top-top-cup.png", // Replace with your actual logo path
    name: "TopTop Cup",
    days: "7 Days",
    location: "Eastwood",
    date: "10 Aug 2025",
    category: "11v1",
    prize: "$22"
  },
  {
    id: 3,
    logo: "/champions-league.png", // Replace with your actual logo path
    name: "TopTop League",
    days: "2 Days",
    location: "Southtown Holster",
    date: "20 Aug 2025",
    category: "8v8",
    prize: "$25"
  },
  {
    id: 4,
    logo: "/northfield-league.png", // Replace with your actual logo path
    name: "TopTop League",
    days: "3 Days",
    location: "Northfield",
    date: "15 Aug 2025",
    category: "9v9",
    prize: "$19"
  }
];

function Tournaments() {
  return (
    <div className="bg-white p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
        <div className="flex items-center gap-4">
          <button className="bg-green-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600">
            Create Tournament
          </button>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600">Today</span>
            <span className="ml-1 text-gray-400">&#9660;</span>
          </div>
        </div>
      </div>

      {/* Tournament Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.map((tournament) => (
          <div key={tournament.id} className="bg-white border rounded-xl p-5 shadow-sm flex items-center gap-5">
            {/* Logo */}
            <div className="w-20 h-20 flex items-center justify-center">
              <img
                src={tournament.logo}
                alt={tournament.name}
                className="w-16 h-16 object-contain"
              />
            </div>
            {/* Info */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{tournament.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium">{tournament.days}</span>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 text-sm">{tournament.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 text-sm">{tournament.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flag className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 text-sm">{tournament.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 text-sm">{tournament.prize}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tournaments;