/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, Users, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
          <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
            }`}>
            {changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→'} {change}
          </span>
          <span className="text-sm text-gray-500">vs last month</span>
        </div>
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

  // Colors for traffic chart
  const trafficColors = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#8B5CF6'];

  // Calculate total dash offset for donut chart
  const calculateDashArrays = (data) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentOffset = 0;
    return data.map(item => {
      const dashArray = `${(item.value / total) * 100} ${100}`;
      const dashOffset = -currentOffset;
      currentOffset += (item.value / total) * 100;
      return { ...item, dashArray, dashOffset };
    });
  };

  const trafficWithDash = calculateDashArrays(trafficData);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={TrendingUp}
            title="Total Revenue"
            value={`${dashboardData.totalRevenue?.toLocaleString() || '0'} AED`}
            change={`${dashboardData.revenueGrowth || 0}%`}
            changeType={dashboardData.revenueGrowth > 0 ? 'positive' : dashboardData.revenueGrowth < 0 ? 'negative' : 'neutral'}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            icon={Package}
            title="Lobbies"
            value={dashboardData.lobbyCount?.toString() || '0'}
            change={`${dashboardData.lobbyGrowth || 0}%`}
            changeType={dashboardData.lobbyGrowth > 0 ? 'positive' : dashboardData.lobbyGrowth < 0 ? 'negative' : 'neutral'}
            bgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={Users}
            title="Matches Played"
            value={dashboardData.totalMatches?.toString() || '0'}
            change={`${dashboardData.matchGrowth || 0}%`}
            changeType={dashboardData.matchGrowth > 0 ? 'positive' : dashboardData.matchGrowth < 0 ? 'negative' : 'neutral'}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            icon={Activity}
            title="Active Players"
            value={dashboardData.activePlayers?.toString() || '0'}
            change={`${dashboardData.playerGrowth || 0}%`}
            changeType={dashboardData.playerGrowth > 0 ? 'positive' : dashboardData.playerGrowth < 0 ? 'negative' : 'neutral'}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
        </div>

        {/* Revenue Chart */}
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
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions & Traffic by Location side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {dashboardData.recentTransactions?.slice(0, 4).map((transaction, index) => (
                <div key={transaction._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.paymentType === 'tournament fee' ? 'Tournament Fee' : 'Team Fee'}
                      {transaction.method && ` (${transaction.method})`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      Status: {transaction.status}
                    </p>
                  </div>
                  <span className={`font-semibold ${transaction.status === 'success' ? 'text-green-600' :
                    transaction.status === 'refund' ? 'text-red-500' : 'text-yellow-600'
                    }`}>
                    {transaction.price} AED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic by Location */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic by Location</h3>
            <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-6 md:space-y-0">
              {/* Donut Chart */}
              <div className="relative mb-4 md:mb-0">
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#f3f4f6" strokeWidth="10" />

                  {/* Segments */}
                  {trafficWithDash.map((item, index) => (
                    <circle
                      key={item.name}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={trafficColors[index % trafficColors.length]}
                      strokeWidth="10"
                      strokeDasharray={item.dashArray}
                      strokeDashoffset={item.dashOffset}
                      transform="rotate(-90 50 50)"
                    />
                  ))}
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-3 flex-1">
                {trafficData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: trafficColors[index % trafficColors.length] }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{item.value.toFixed(1)}%</span>
                      <span className="text-xs text-gray-500 block">({item.count} users)</span>
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