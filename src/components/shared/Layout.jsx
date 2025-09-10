import React from 'react'
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Sidebar</h2>
        <nav className="flex flex-col gap-2">
          <a href="/" className="hover:bg-gray-700 p-2 rounded">Dashboard</a>
          <a href="/products" className="hover:bg-gray-700 p-2 rounded">Lobbies Management</a>
          <a href="/organizers" className="hover:bg-gray-700 p-2 rounded">Organizers</a>
          <a href="/tournaments" className="hover:bg-gray-700 p-2 rounded">Tournaments</a>
          <a href="/user-management" className="hover:bg-gray-700 p-2 rounded">User Management</a>
          <a href="/payments" className="hover:bg-gray-700 p-2 rounded">Payments</a>
          <a href="/insights" className="hover:bg-gray-700 p-2 rounded">Insights</a>
          <a href="/settings" className="hover:bg-gray-700 p-2 rounded">Settings</a>
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Header</h1>
          <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Login</a>
        </header>
        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
