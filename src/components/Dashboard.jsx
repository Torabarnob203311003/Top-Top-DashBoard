/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, Users, Activity, Calendar, MapPin, DollarSign, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This week');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('https://api.toptopfootball.com/api/v1/admin/admin-data');
        const result = await response.json();

        if (result.success) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format revenue bar graph data for the chart
  const formatChartData = () => {
    if (!dashboardData?.revenueBarGraph) return [];

    return dashboardData.revenueBarGraph.map(item => ({
      name: `Day ${item._id.day} - ${item._id.hour}:00`,
      hour: `${item._id.hour}:00`,
      value: item.total
    }));
  };

  // Format traffic data for the donut chart
  const formatTrafficData = () => {
    if (!dashboardData?.trafficByCountry) return [];

    return dashboardData.trafficByCountry.map(item => ({
      name: item.country,
      value: item.percentage,
      count: item.count
    }));
  };

  // Format organizer pie usage data
  const formatOrganizerData = () => {
    if (!dashboardData?.organizerPieUsage) return [];

    return dashboardData.organizerPieUsage.map(item => ({
      name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
      value: item.count
    }));
  };

  // Format most playable days data
  const formatMostPlayableDays = () => {
    if (!dashboardData?.mostPlayableDays) return [];

    return dashboardData.mostPlayableDays.map(item => ({
      day: item.day,
      players: item.players
    }));
  };

  // Format most preferred areas data
  const formatMostPreferredAreas = () => {
    if (!dashboardData?.mostPreferredAreas) return [];

    return dashboardData.mostPreferredAreas.map(item => ({
      area: item.area,
      players: item.players
    }));
  };

  const StatCard = ({ icon: Icon, title, value, change, changeType, bgColor, iconColor, description }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex  items-start justify-between">
        <div className={`p-3 rounded-lg ${bgColor} mb-4`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <span className={`text-sm hidden font-semibold ${changeType === 'positive' ? 'text-green-600 bg-green-50' :
          changeType === 'negative' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
          } px-3 py-1 rounded-full`}>
          {changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→'} {change}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load dashboard data</div>
      </div>
    );
  }

  const chartData = formatChartData();
  const trafficData = formatTrafficData();
  const organizerData = formatOrganizerData();
  const playableDaysData = formatMostPlayableDays();
  const preferredAreasData = formatMostPreferredAreas();

  // Colors arrays
  const trafficColors = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#8B5CF6'];
  const organizerColors = ['#3B82F6', '#10B981', '#F59E0B'];
  const daysColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
  const areaColors = ['#10B981', '#3B82F6', '#8B5CF6'];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            {payload[0].dataKey === 'value' ? 'Revenue:' : 'Players:'} <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome to your sports management dashboard</p>
          </div>
          <div className="flex items-center hidden   space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option>This week</option>
              <option>This month</option>
              <option>This year</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`${dashboardData.totalRevenue?.toLocaleString() || '0'} AED`}
            // change={`${dashboardData.revenueGrowth || 0}%`}
            changeType={dashboardData.revenueGrowth > 0 ? 'positive' : dashboardData.revenueGrowth < 0 ? 'negative' : 'neutral'}
            bgColor="bg-green-50"
            iconColor="text-green-600"
            description="Revenue from all matches"
          />
          <StatCard
            icon={Package}
            title="Active Lobbies"
            value={dashboardData.lobbyCount?.toString() || '0'}
            // change={`${dashboardData.lobbyGrowth || 0}%`}
            changeType={dashboardData.lobbyGrowth > 0 ? 'positive' : dashboardData.lobbyGrowth < 0 ? 'negative' : 'neutral'}
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
            description="Active playing lobbies"
          />
          <StatCard
            icon={Users}
            title="Matches Played"
            value={dashboardData.totalMatches?.toString() || '0'}
            // change={`${dashboardData.matchGrowth || 0}%`}
            changeType={dashboardData.matchGrowth > 0 ? 'positive' : dashboardData.matchGrowth < 0 ? 'negative' : 'neutral'}
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
            description="Total matches completed"
          />
          <StatCard
            icon={Activity}
            title="Active Players"
            value={dashboardData.activePlayers?.toString() || '0'}
            // change={`${dashboardData.playerGrowth || 0}%`}
            changeType={dashboardData.playerGrowth > 0 ? 'positive' : dashboardData.playerGrowth < 0 ? 'negative' : 'neutral'}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
            description="Currently active players"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <p className="text-sm text-gray-500">Hourly revenue distribution</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Revenue (AED)</span>
              </div>
            </div>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    tick={{ fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10B981' }}
                    activeDot={{ r: 8, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Organizer Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
                <p className="text-sm text-gray-500">By user roles</p>
              </div>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-center">
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={organizerData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {organizerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={organizerColors[index % organizerColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              {organizerData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: organizerColors[index % organizerColors.length] }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Playable Days and Most Preferred Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Playable Days */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Most Playable Days</h3>
                  <p className="text-sm text-gray-500">Player activity by day</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {playableDaysData.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: daysColors[index % daysColors.length] }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{day.day}</p>
                      <p className="text-xs text-gray-500">{day.players} players</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(day.players / Math.max(...playableDaysData.map(d => d.players))) * 100}%`,
                          backgroundColor: daysColors[index % daysColors.length]
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{day.players}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Preferred Areas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Most Preferred Areas</h3>
                  <p className="text-sm text-gray-500">Player distribution by area</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {preferredAreasData.map((area, index) => (
                <div key={area.area} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{area.area}</span>
                    <span className="text-sm font-semibold text-gray-900">{area.players} players</span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{
                        width: `${(area.players / Math.max(...preferredAreasData.map(a => a.players))) * 100}%`,
                        backgroundColor: areaColors[index % areaColors.length]
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-xs text-gray-500">
                      {((area.players / preferredAreasData.reduce((sum, a) => sum + a.players, 0)) * 100).toFixed(1)}% of total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions & Traffic by Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <p className="text-sm text-gray-500">Latest payment activities</p>
                </div>
              </div>
              <Link to="/payments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentTransactions?.slice(0, 5).map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${transaction.status === 'success' ? 'bg-green-50' :
                      transaction.status === 'pending' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                      <div className={`w-2 h-2 rounded-full ${transaction.status === 'success' ? 'bg-green-500' :
                        transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.paymentType === 'tournament fee' ? 'Tournament' : 'Team'} Fee
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{transaction.matchFormat}</span>
                        <span>•</span>
                        <span>{transaction.method}</span>
                        <span>•</span>
                        <span className="capitalize">{transaction.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{transaction.price} AED</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic by Location */}
          <div className="bg-white rounded-xl p-6 shadow-sm border h-[600px] overflow-y-auto border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Traffic by Country</h3>
                  <p className="text-sm text-gray-500">User distribution worldwide</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-center lg:space-x-8 space-y-8 lg:space-y-0">
              {/* Donut Chart */}
              <div className="relative">
                <svg className="w-40 h-40" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                  {trafficData.map((item, index) => {
                    const total = trafficData.reduce((sum, i) => sum + i.value, 0);
                    const startAngle = trafficData.slice(0, index).reduce((sum, i) => sum + (i.value / total) * 360, 0);
                    const arcAngle = (item.value / total) * 360;

                    return (
                      <circle
                        key={item.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={trafficColors[index % trafficColors.length]}
                        strokeWidth="12"
                        strokeDasharray={`${arcAngle} 360`}
                        strokeDashoffset={-startAngle}
                        transform="rotate(-90 50 50)"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {trafficData.reduce((sum, item) => sum + item.count, 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total Users</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-4 flex-1 min-w-0">
                {trafficData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: trafficColors[index % trafficColors.length] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{item.value.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{item.count} users</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;