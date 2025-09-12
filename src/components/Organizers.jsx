import React, { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import AddOrganizer from './AddOrganizer'; // Make sure this file exists

const Organizers = () => {
  const [showAdd, setShowAdd] = useState(false);

  const organizersData = [
    {
      id: 1,
      name: "Marcus Reed",
      email: "marcusreed@gmail.com",
      phone: "(10) 555-0115",
      collection: "$425",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Sophia Bennett",
      email: "sophiabennett@yahoo.com",
      phone: "(10) 555-0127",
      collection: "$375",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Liam Wang",
      email: "liam.wang@gmail.com",
      phone: "(10) 555-0111",
      collection: "$390",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Omar El-Amin",
      email: "omar.elamin@live.com",
      phone: "(10) 555-0122",
      collection: "$450",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Emma Johnson",
      email: "emma.j@gmail.com",
      phone: "(10) 555-0101",
      collection: "$430",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 6,
      name: "Aisha Patel",
      email: "patelalsha@outlook.com",
      phone: "(10) 555-0128",
      collection: "$460",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face"
    }
  ];

  if (showAdd) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 flex items-center justify-center">
        <AddOrganizer onClose={() => setShowAdd(false)} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-black">Organizers</h1>
        <button
          className="bg-green-400 text-white px-6 py-2 rounded-md text-sm font-medium"
          onClick={() => setShowAdd(true)}
        >
          Add Organizer
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Phone</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Collection</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {organizersData.map((organizer) => (
              <tr key={organizer.id} className="border-b border-gray-100 hover:bg-gray-50">
                {/* Name with Avatar */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={organizer.avatar}
                      alt={organizer.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-black">{organizer.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-500">{organizer.email}</span>
                </td>

                {/* Phone */}
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-500">{organizer.phone}</span>
                </td>

                {/* Collection */}
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-500">{organizer.collection}</span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                      <Eye className="w-4 h-4 text-green-500" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Organizers;