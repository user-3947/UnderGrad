// import React from 'react'

const SearchBar = () => {
  return (
    <div className='search-bar mb-15 sticky bottom-15 justify-center flex gap-1'>
      <div className="search flex borde rounded justify-center backdrop-blur-xs w-3/4">
        <img src="src\assets\search.svg" alt="search-icon" />
        <input className=" bg-gree-600 w-3/4" type="search" name="search-bar" id="search-bar" placeholder='Search papers' />
      </div>
      <img src="src\assets\bot.svg" alt="bot" className="bot" />
    </div>
  )
}

export default SearchBar
