import React, { useState } from 'react';
import { ChevronLeft, Upload, X, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

function AddOrganizer({ onClose, onOrganizerAdded }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Create FormData object
      const formData = new FormData();

      // Append text fields
      formData.append('FullName', data.FullName);
      formData.append('userName', data.userName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('role', 'organizer');

      // Append image if selected
      if (selectedImage) {
        formData.append('images', selectedImage);
      }

      // Debug: Log form data contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (key === 'image') {
          console.log(`${key}:`, value.name, value.type, value.size);
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await fetch('https://api.toptopfootball.com/api/v1/auth/create-player', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);

      const result = await response.json();
      console.log('API Response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        toast.success('Organizer created successfully!');
        reset();
        setSelectedImage(null);
        setImagePreview(null);

        if (onOrganizerAdded) {
          onOrganizerAdded();
        }

        onClose();
      } else {
        toast.error(result.message || 'Failed to create organizer');
      }
    } catch (error) {
      console.error('Error creating organizer:', error);

      // More specific error messages
      if (error.message.includes('401')) {
        toast.error('Unauthorized: Please check your authentication');
      } else if (error.message.includes('409')) {
        toast.error('User already exists with this email or username');
      } else if (error.message.includes('400')) {
        toast.error('Invalid data provided. Please check all fields.');
      } else if (error.message.includes('500')) {
        toast.error('Server error. Please try again later.');
      } else if (error.message.includes('Network Error')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'Failed to create organizer. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-5/6 max-w-2xl">
      <button
        className="flex items-center text-black font-semibold mb-6 hover:text-gray-700 transition-colors"
        onClick={onClose}
        disabled={loading}
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        <span>Back to Organizers</span>
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Organizer</h2>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            {...register("FullName", {
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Full name must be at least 2 characters"
              }
            })}
            className={`w-full p-3 bg-white border rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent ${errors.FullName ? 'border-red-500' : 'border-gray-200'
              }`}
          />
          {errors.FullName && (
            <p className="text-red-500 text-sm mt-1">{errors.FullName.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username *
          </label>
          <input
            type="text"
            placeholder="Enter username"
            {...register("userName", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters"
              }
            })}
            className={`w-full p-3 bg-white border rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent ${errors.userName ? 'border-red-500' : 'border-gray-200'
              }`}
          />
          {errors.userName && (
            <p className="text-red-500 text-sm mt-1">{errors.userName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            placeholder="organizer@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address"
              }
            })}
            className={`w-full p-3 bg-white border rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            placeholder="Enter password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
            className={`w-full p-3 bg-white border rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Organizer Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organizer Photo
          </label>

          {imagePreview ? (
            <div className="relative w-32 h-32 mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg border-2 border-green-400"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-full">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="image-upload">
                <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-8 text-center hover:border-green-400 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="text-green-500 font-medium hover:text-green-600">
                          Browse
                        </span>
                        <span className="text-gray-600"> your file</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Images only (max 5MB)</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Organizer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddOrganizer;