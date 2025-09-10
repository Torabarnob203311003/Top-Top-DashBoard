import React from "react";

function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <form>
          <input className="w-full mb-3 p-2 border rounded" type="text" placeholder="Username" />
          <input className="w-full mb-3 p-2 border rounded" type="password" placeholder="Password" />
          <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
