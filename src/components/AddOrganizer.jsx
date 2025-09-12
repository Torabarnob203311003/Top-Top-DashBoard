import React from 'react';
import { ChevronLeft, Upload } from 'lucide-react';

function AddOrganizer({ onClose }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-5/6">
      <button
        className="flex items-center text-black font-semibold mb-6"
        onClick={onClose}
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        <span>Back to Organizers</span>
      </button>
      <h2 className="text-xl font-bold mb-4">Add Organizer</h2>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Organizer username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organizer username
          </label>
          <input
            type="text"
            placeholder="John Marx"
            className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          />
        </div>

        {/* Organizer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organizer Name
          </label>
          <input
            type="email"
            placeholder="marcjohn@gmail.com"
            className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          />
        </div>

        {/* Organizer Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organizer Photo
          </label>
          <div className="w-full">
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-12 text-center hover:border-green-400 transition-colors">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm">
                    <span className="text-green-500 font-medium cursor-pointer hover:text-green-600">
                      Browse
                    </span>
                    <span className="text-gray-600"> your file</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Images only</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddOrganizer;