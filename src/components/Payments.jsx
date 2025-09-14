import React, { useState } from 'react';
import { Search, Filter, TrendingUp, User, MapPin, Calendar, Clock, Trophy, Star } from 'lucide-react';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('History');

  const payments = [
    {
      id: 1,
      type: 'Friendly Match',
      player: 'Demir',
      location: 'New Westbury',
      date: '02/08/25',
      time: '08:30 PM',
      duration: '60 Minutes',
      score: '7v7',
      rating: '$13',
      amount: '60USD(30USD Cash)',
      color: 'text-green-500'
    },
    {
      id: 2,
      type: 'Friendly Challenge',
      player: 'Yusuf',
      location: 'Lakeside',
      date: '07/22/25',
      time: '05:00 PM',
      duration: '90 Minutes',
      score: '5v6',
      rating: '$14',
      amount: '55USD(25USD Cash)',
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'Championship Game',
      player: 'Murat',
      location: 'Green Valley',
      date: '03/15/25',
      time: '08:00 PM',
      duration: '90 Minutes',
      score: '11v11',
      rating: '$9',
      amount: '100USD(50USD Cash)',
      color: 'text-green-500'
    },
    {
      id: 4,
      type: 'Final Showdown',
      player: 'Cemil',
      location: 'City Stadium',
      date: '08/30/25',
      time: '08:00 PM',
      duration: '90 Minutes',
      score: '11v11',
      rating: '$11',
      amount: '150USD(75USD Cash)',
      color: 'text-green-500'
    },
    {
      id: 5,
      type: 'Charity Event',
      player: 'Abdullah',
      location: 'Central Park',
      date: '04/20/25',
      time: '03:00 PM',
      duration: '60 Minutes',
      score: '5v5',
      rating: '$15',
      amount: '75USD(40USD Cash)',
      color: 'text-green-500'
    },
    {
      id: 6,
      type: 'Pre-Season Tournament',
      player: 'Ekrem',
      location: 'Sunny Fields',
      date: '09/18/25',
      time: '04:30 PM',
      duration: '60 Minutes',
      score: '7v7',
      rating: '$10',
      amount: '120USD(60USD Cash)',
      color: 'text-green-500'
    },
    {
      id: 7,
      type: 'Pre-Season Tournament',
      player: 'Ekrem',
      location: 'Sunny Fields',
      date: '09/18/25',
      time: '04:30 PM',
      duration: '60 Minutes',
      score: '7v7',
      rating: '$10',
      amount: '120USD(60USD Cash)',
      color: 'text-green-500'
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'Championship Game':
      case 'Final Showdown':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'Charity Event':
        return <Star className="w-4 h-4 text-purple-500" />;
      default:
        return <User className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <h1 className="text-lg font-medium text-gray-900">Payments</h1>
        <div className="flex items-center space-x-3">
          <Search className="w-5 h-5 text-gray-400" />
          <Filter className="w-5 h-5 text-gray-400" />
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white flex">
        <button
          onClick={() => setActiveTab('History')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'History'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('Cash Requests')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'Cash Requests'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Cash Requests
        </button>
      </div>

      {/* Payment List */}
      <div className="px-4 py-2">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-white rounded-lg mb-3 p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-900">{payment.type}</h3>
              <span className={`text-sm font-medium ${payment.color}`}>
                {payment.amount}
              </span>
            </div>

            <div className="grid grid-cols-8 gap-y-2 text-sm">
              <div className="flex items-center space-x-2">
                {getIcon(payment.type)}
                <span className="text-gray-600">{payment.player}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{payment.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{payment.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{payment.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">{payment.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-7  bg-green-500 rounded-xl ps-6 pr-6 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{payment.score}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <Star className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">{payment.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payments;