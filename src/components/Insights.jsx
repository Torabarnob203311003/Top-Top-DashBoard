import React, { useState } from 'react';
import { ChevronDown, Play, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

function Insights() {
  // Revenue chart data
  const revenueData = [
    { time: '09:00 AM', revenue: 0 },
    { time: '10:00 AM', revenue: 15000 },
    { time: '11:00 AM', revenue: 25000 },
    { time: '12:00 PM', revenue: 40000 },
    { time: '01:00 PM', revenue: 5000 },
    { time: '02:00 PM', revenue: 38000 },
    { time: '03:00 PM', revenue: 27000 },
    { time: '04:00 PM', revenue: 21000 },
    { time: '05:00 PM', revenue: 12000 },
    { time: '06:00 PM', revenue: 60000 }
  ];

  // Matches chart data
  const matchesData = [
    { time: '09:00 AM', played: 2, available: 4 },
    { time: '10:00 AM', played: 1, available: 3 },
    { time: '11:00 AM', played: 2, available: 5 },
    { time: '12:00 PM', played: 1, available: 2 },
    { time: '01:00 PM', played: 2, available: 2 },
    { time: '02:00 PM', played: 2, available: 6 },
    { time: '03:00 PM', played: 8, available: 3 },
    { time: '04:00 PM', played: 3, available: 2 },
    { time: '05:00 PM', played: 1, available: 1 },
    { time: '06:00 PM', played: 4, available: 3 }
  ];

  // Dropdown state
  const [revenueType, setRevenueType] = useState('Select Type');
  const [revenueTimeframe, setRevenueTimeframe] = useState('Today');
  const [matchesTimeframe, setMatchesTimeframe] = useState('Today');

  // Goal of the Week demo data
  const [playingVideo, setPlayingVideo] = useState(null);
  const goalVideos = [
    {
      id: 1,
      title: 'Active',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isActive: true
    },
    {
      id: 2,
      title: 'Scheduled: 04/16/25',
      thumbnail: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      isActive: false
    },
    {
      id: 3,
      title: 'Scheduled: 04/16/25',
      thumbnail: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=400&h=250&fit=crop',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isActive: false
    }
  ];

  const handlePlayVideo = (videoId) => {
    setPlayingVideo(videoId);
  };

  const handleAddGoal = () => {
    console.log('Add Goal of the Week');
  };

  // Custom dropdown component
  const CustomDropdown = ({ value, setValue, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          {value}
          <ChevronDown className="w-4 h-4" />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setValue(option);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 first:rounded-t-lg last:rounded-b-lg"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Y axis formatter for revenue
  const formatYAxisRevenue = (value) => {
    if (value === 0) return '0';
    if (value >= 1000) return `$${value / 1000}K`;
    return `$${value}`;
  };

  return (
    <div className="bg-white min-h-screen p-8">
      {/* Goal of the Week Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Goal of the week</h2>
          <button
            onClick={handleAddGoal}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Goal of the Week
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goalVideos.map((video) => (
            <div key={video.id} className="relative group">
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                {playingVideo === video.id ? (
                  <video
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    onEnded={() => setPlayingVideo(null)}
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover rounded-xl transition-transform duration-300 ease-in-out"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => handlePlayVideo(video.id)}
                        className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center transition-colors duration-300 ease-in-out hover:bg-opacity-70"
                      >
                        <Play className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </>
                )}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-800 truncate">{video.title}</h3>
              <div className="mt-2">
                {video.isActive ? (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-600">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    Scheduled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Revenue Overview</h2>
          <div className="flex items-center gap-3">
            <CustomDropdown
              value={revenueType}
              setValue={setRevenueType}
              options={['Select Type', 'Total Revenue', 'Average Revenue']}
            />
            <CustomDropdown
              value={revenueTimeframe}
              setValue={setRevenueTimeframe}
              options={['Today', 'This Week', 'This Month']}
            />
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} barCategoryGap="30%" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14, fill: "#222", fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14, fill: "#222", fontWeight: 500 }}
                tickFormatter={formatYAxisRevenue}
                domain={[0, 100000]}
                ticks={[0, 25000, 50000, 75000, 100000]}
              />
              <Bar
                dataKey="revenue"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Matches Chart Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Matches Overview</h2>
            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ background: "#60A5FA", borderRadius: "9999px" }}></div>
                <span className="text-sm font-medium" style={{ color: "#60A5FA" }}>Played</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ background: "#FBBF24", borderRadius: "9999px" }}></div>
                <span className="text-sm font-medium" style={{ color: "#FBBF24" }}>Available</span>
              </div>
            </div>
          </div>
          <CustomDropdown
            value={matchesTimeframe}
            setValue={setMatchesTimeframe}
            options={['Today', 'This Week', 'This Month']}
          />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={matchesData} barCategoryGap="30%" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14, fill: "#222", fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14, fill: "#222", fontWeight: 500 }}
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
              />
              <Legend
                wrapperStyle={{
                  paddingBottom: 16,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#222"
                }}
                iconType="circle"
                align="left"
                verticalAlign="top"
              />
              <Bar
                dataKey="played"
                fill="#96ECC9"
                radius={[8, 8, 0, 0]}
                maxBarSize={20}
                name="Played"
              />
              <Bar
                dataKey="available"
                fill="#2EDB95"
                radius={[8, 8, 0, 0]}
                maxBarSize={20}
                name="Available"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Insights;

