import { useNavigate } from 'react-router-dom'

const SideBar = () => {
    const navigate = useNavigate();

  return (
    <div className='side-bar backdrop-blur-xs absolute right-0 top-10 h-[10vh] w-[12vh] flex flex-col items-center justify-around'>
    <div onClick={() => {navigate('/About')}} className="about">About</div>
    <div className="theme">
      Theme
    </div>
</div>
  )
}

export default SideBar
