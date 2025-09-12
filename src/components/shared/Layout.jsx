import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'

function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#FEFEFE] border-r border-t border-[#EEEEEE] p-4 flex flex-col fixed top-0 left-0 h-screen z-20">
        <div className="flex items-center ps-14 gap-0">
          <img src="/logo.svg" alt="Logo" className="h-18 w-18" />
        </div>
        <br />
        <nav className="flex flex-col gap-6">
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
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col pb-24 ml-64">
        {/* Header */}
        <header className="bg-white shadow p-8 flex items-center justify-end pr-10 fixed top-0 left-64 right-0 z-10">
          <div className="flex items-center gap-4">
            {/* Bell icon (Heroicons bell demo) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-8 text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.933 23.933 0 0 1-5.714 0M6.5 10c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5c0 2.386.416 4.042 1.09 5.184a.563.563 0 0 1-.49.816H5.9a.563.563 0 0 1-.49-.816C6.084 14.042 6.5 12.386 6.5 10z" />
            </svg>
            {/* User profile image demo */}
            <img src="/vite.svg" alt="User" className="h-8 w-8 rounded-full border" />
            <span className="text-gray-700 font-semibold">Halid</span>
          </div>
        </header>
        {/* Page content */}
        <main
          className="flex-1 p-6 bg-gray-50 overflow-auto"
          style={{
            marginTop: '80px',
            height: 'calc(100vh - 80px)',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE 10+
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
