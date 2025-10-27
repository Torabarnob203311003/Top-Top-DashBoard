/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, Users, Activity } from 'lucide-react';
// Add MUI Chart imports
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This week');

  // Sample data for the line chart
  const chartData = [
    { month: 'Jan', value: 10 },
    { month: 'Feb', value: 25 },
    { month: 'Mar', value: 30 },
    { month: 'Apr', value: 45 },
    { month: 'May', value: 20 },
    { month: 'Jun', value: 35 },
    { month: 'Jul', value: 15 },
    { month: 'Aug', value: 40 },
    { month: 'Sep', value: 35 },
    { month: 'Oct', value: 30 },
    { month: 'Nov', value: 40 },
    { month: 'Dec', value: 35 }
  ];

  const StatCard = ({ icon: Icon, title, value, change, changeType, bgColor, iconColor }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-medium ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-500'
          }`}>
            {changeType === 'positive' ? '↗' : '↘'} {change}
          </span>
          <span className="text-sm text-gray-500">vs last month</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={TrendingUp}
            title="Total Revenue"
            value="$42,350"
            change="+12% vs last month"
            changeType="positive"
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={Package}
            title="Lobbies"
            value="21"
            change="+7% vs last month"
            changeType="positive"
            bgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={Users}
            title="Matches Played"
            value="354"
            change="-4% vs last month"
            changeType="negative"
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            icon={Activity}
            title="Active Players"
            value="1,245"
            change="+2% vs last month"
            changeType="positive"
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
        </div>

        {/* Revenue Chart - full width with MUI Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm w-full mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>This week</option>
              <option>This month</option>
              <option>This year</option>
            </select>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions & Traffic by Location side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Apple Pay (***1274)</p>
                  <p className="text-sm text-gray-500">03/10/24</p>
                </div>
                <span className="text-green-600 font-semibold">$45</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Google Pay (***4631)</p>
                  <p className="text-sm text-gray-500">03/10/24</p>
                </div>
                <span className="text-green-600 font-semibold">$60</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">TopTop (32 Points)</p>
                  <p className="text-sm text-gray-500">03/10/24</p>
                </div>
                <span className="text-green-600 font-semibold">$30</span>
              </div>
            </div>
          </div>

          {/* Traffic by Location */}
          <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic by Location</h3>
            <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-6 md:space-y-0">
              {/* Donut Chart */}
              <div className="relative mb-4 md:mb-0">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#f3f4f6" strokeWidth="10"/>
                  
                  {/* Green segment (largest) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="35" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="10"
                    strokeDasharray="87 132"
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                  
                  {/* Orange segment */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="35" 
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="10"
                    strokeDasharray="44 176"
                    strokeDashoffset="-87"
                    transform="rotate(-90 50 50)"
                  />
                  
                  {/* Blue segment */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="35" 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="10"
                    strokeDasharray="33 187"
                    strokeDashoffset="-131"
                    transform="rotate(-90 50 50)"
                  />
                  
                  {/* Purple segment */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="35" 
                    fill="none" 
                    stroke="#8B5CF6" 
                    strokeWidth="10"
                    strokeDasharray="33 187"
                    strokeDashoffset="-164"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Country Name</span>
                  </div>
                  <span className="text-sm font-medium">39.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-600">Country Name</span>
                  </div>
                  <span className="text-sm font-medium">30.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Country Name</span>
                  </div>
                  <span className="text-sm font-medium">20.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-600">Country Name</span>
                  </div>
                  <span className="text-sm font-medium">15.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
