import React from 'react'
import { Link } from 'react-router-dom'

function Products() {
  return (
    <div className='bg-yellow-200'>
       <p > this is products </p> <Link to="/products"> go to products</Link>
    </div>
  )
}

export default Products
