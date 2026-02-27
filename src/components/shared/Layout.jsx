import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast';

function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Show success message
    toast.success('Logged out successfully!');

    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#FEFEFE] border-r border-t border-[#EEEEEE] p-4 flex flex-col fixed top-0 left-0 h-screen z-20">
        <div className="flex items-center ps-14 gap-0">
          <img src="/logo.svg" alt="Logo" className="h-18 w-18" />
        </div>
        <br />
        <nav className="flex flex-col gap-6 flex-1">
          <NavLink to="/" end className={({ isActive }) =>
            `p-2 rounded transition-colors ${isActive ? 'bg-[#2EDB95] text-white' : 'text-[#AEAEAE] hover:bg-[#2EDB95] hover:text-white'}`
          }>Dashboard</NavLink>
          <NavLink to="/products" className={({ isActive }) =>
            `p-2 rounded transition-colors ${isActive ? 'bg-[#2EDB95] text-white' : 'text-[#AEAEAE] hover:bg-[#2EDB95] hover:text-white'}`
          }>Lobbies Management</NavLink>
          <NavLink to="/organizers" className={({ isActive }) =>
            `p-2 rounded transition-colors ${isActive ? 'bg-[#2EDB95] text-white' : 'text-[#AEAEAE] hover:bg-[#2EDB95] hover:text-white'}`
          }>Organizers</NavLink>
          <NavLink to="/tournaments" className={({ isActive }) =>
            `p-2 rounded transition-colors ${isActive ? 'bg-[#2EDB95] text-white' : 'text-[#AEAEAE] hover:bg-[#2EDB95] hover:text-white'}`
          }>Tournaments</NavLink>
          <NavLink to="/user-management" className={({ isActive }) =>
            `p-2 rounded transition-colors ${isActive ? 'bg-[#2EDB95] text-white' : 'text-[#AEAEAE] hover:bg-[#2EDB95] hover:text-white'}`
          }>User Management</NavLink>
          <NavLink to="/payments" className={({ isActive }) =>
            `p-2 rounded transition-colors ${isActive ? 'bg-[#2EDB95] text-white' : 'text-[#AEAEAE] hover:bg-[#2EDB95] hover:text-white'}`
          }>Payments</NavLink>
          <NavLink to="/insights" className={({ isActive }) =>
            `p-2 rounded transition-colors ${isActive ? 'bg-[#2EDB95] text-white' : 'text-[#AEAEAE] hover:bg-[#2EDB95] hover:text-white'}`
          }>Insights</NavLink>
          <NavLink to="/settings" className={({ isActive }) =>
            `p-2 rounded transition-colors ${isActive ? 'bg-[#2EDB95] text-white' : 'text-[#AEAEAE] hover:bg-[#2EDB95] hover:text-white'}`
          }>Settings</NavLink>

          {/* Logout Button in Sidebar */}
          <button
            onClick={handleLogout}
            className="p-2 rounded transition-colors text-[#AEAEAE] hover:bg-red-500 hover:text-white mt-auto flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Logout
          </button>
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col pb-24 ml-64">
        {/* Header */}
        <header className="bg-white shadow p-8 flex items-center justify-between pr-10 fixed top-0 left-64 right-0 z-10">
          <div></div> {/* Empty div for spacing */}
          <div className="flex items-center gap-4">
            {/* Bell icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-8 text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.933 23.933 0 0 1-5.714 0M6.5 10c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5c0 2.386.416 4.042 1.09 5.184a.563.563 0 0 1-.49.816H5.9a.563.563 0 0 1-.49-.816C6.084 14.042 6.5 12.386 6.5 10z" />
            </svg>

            {/* User profile with dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="https://top-top-images.s3.us-east-1.amazonaws.com/images-1769499415714-910364937.png" alt="User" className="h-8 w-8 rounded-full border" />
                <span className="text-gray-700 font-semibold">Halit</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>

              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30 border">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-semibold">Halid</p>
                  <p className="text-gray-500">Admin</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        {/* Page content */}
        <main
          className="flex-1 p-6 bg-gray-50 overflow-auto"
          style={{
            marginTop: '80px',
            height: 'calc(100vh - 80px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>
            {`
              main::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;