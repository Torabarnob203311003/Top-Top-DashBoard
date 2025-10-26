import React, { useState } from 'react';
import { ChevronDown, Play, Plus, X, Calendar, Link } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// Modal Component
function AddGoalModal({ isOpen, onClose, onGoalAdded }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      goalTitle: '',
      goalLink: '',
      scheduledDate: '',
      status: 'pending'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Here you would typically send data to your API
      console.log('Goal data:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const goalData = {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      toast.success('Goal added successfully!');
      reset();
      onGoalAdded(goalData);
      onClose();
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add Goal of the Week</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Goal Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              placeholder="Enter goal title..."
              {...register("goalTitle", {
                required: "Goal title is required",
                minLength: {
                  value: 3,
                  message: "Goal title must be at least 3 characters"
                }
              })}
              className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.goalTitle ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                }`}
            />
            {errors.goalTitle && (
              <p className="text-red-500 text-sm mt-2">{errors.goalTitle.message}</p>
            )}
          </div>

          {/* Goal Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Video Link *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="url"
                placeholder="https://example.com/video.mp4"
                {...register("goalLink", {
                  required: "Video link is required",
                  pattern: {
                    value: /^(https?:\/\/).+/,
                    message: "Please enter a valid URL"
                  }
                })}
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.goalLink ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
              />
            </div>
            {errors.goalLink && (
              <p className="text-red-500 text-sm mt-2">{errors.goalLink.message}</p>
            )}
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="datetime-local"
                {...register("scheduledDate")}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-300"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Leave empty to make it active immediately
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${watch('status') === 'pending'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}>
                <input
                  type="radio"
                  value="pending"
                  {...register("status", { required: "Status is required" })}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium">Scheduled</span>
                </div>
              </label>

              <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${watch('status') === 'active'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}>
                <input
                  type="radio"
                  value="active"
                  {...register("status", { required: "Status is required" })}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                    <Play className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Active</span>
                </div>
              </label>
            </div>
            {errors.status && (
              <p className="text-red-500 text-sm mt-2">{errors.status.message}</p>
            )}
          </div>

          {/* Video Preview */}
          {watch('goalLink') && !errors.goalLink && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Video Preview</h4>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Video will appear here</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Goal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

  // Goal of the Week state
  const [playingVideo, setPlayingVideo] = useState(null);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [goalVideos, setGoalVideos] = useState([
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
  ]);

  const handlePlayVideo = (videoId) => {
    setPlayingVideo(videoId);
  };

  const handleAddGoal = () => {
    setIsAddGoalModalOpen(true);
  };

  const handleGoalAdded = (newGoal) => {
    // Add the new goal to the list
    const newGoalVideo = {
      id: goalVideos.length + 1,
      title: newGoal.status === 'active' ? 'Active' : `Scheduled: ${new Date(newGoal.scheduledDate).toLocaleDateString()}`,
      thumbnail: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=250&fit=crop',
      videoUrl: newGoal.goalLink,
      isActive: newGoal.status === 'active'
    };

    setGoalVideos(prev => [newGoalVideo, ...prev]);
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

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onGoalAdded={handleGoalAdded}
      />
    </div>
  );
}

export default Insights;