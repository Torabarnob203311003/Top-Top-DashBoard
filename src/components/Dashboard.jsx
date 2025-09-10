import React from 'react'
import { Link } from 'react-router-dom'
function Dashboard() {
  return (
    <div className='text-sky-500'>
     <p > this is dashboard </p> <Link to="/"> go to dashboard</Link>
    </div>
  )
}

export default Dashboard
