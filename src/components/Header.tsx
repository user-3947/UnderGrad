// import React from 'react'
import education from '../assets/education.svg'
import menu from '../assets/menu.svg'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SideBar from './SideBar';

const Header = () => {
  const [showbar, setShowbar] = useState(false)
  const navigate = useNavigate();

  return (
    <>
    <div className="header flex justify-between my-3 mx-3">
      <div onClick={() => navigate('/')} className="header-name flex justify-center gap-1 cursor-pointer">
        <img src={education} alt="stud_edu" className="" />
        <div className="app-name text-2xl font-bold">UnderGrad</div>
      </div>
      <img src={menu} alt="menu" onClick={() => {setShowbar(!showbar)}} className='cursor-pointer' />
      {showbar && <SideBar/>}
    </div>
    </>
  )
}

export default Header
