import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import EnrollForm from './EnrollForm';

const Header = () => {
  const [isEnrollOpen, setEnrollOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <div className="flex my-3 mx-3 justify-between"> {/* Header */}
      <div className="flex gap-1"> {/* Header - icon, name, about */}
        <div onClick={() => navigate('/')} className="header-name flex justify-center gap-1 cursor-pointer"> {/* icon, name */}
          <svg width="22" height="20" className='logo fill-title mt-1'>
            <g><path d="M16.25 14.436 11 17.39l-5.25-2.954v-3.12l-1.5-.833v4.83L11 19.11l6.75-3.796v-4.831l-1.5.833v3.12Z"/>
            <path d="M11 .155.5 5.6v1.3L11 12.733l9-5v4.142h1.5V5.6L11 .155Zm7.5 6.695-1.5.834-6 3.333-6-3.333-1.5-.834-1.04-.577L11 1.845l8.54 4.428-1.04.577Z"/></g>
          </svg>
        <div className="app-name text-2xl font-bold text-title">UnderGrad</div>
        </div>
        <div className="flex felx-col items-end mb-0.5"> {/* Header - about */}
          <svg width="20" height="20" className='fill-title mb-0.5' onClick={() => navigate('/About')}>
            <path d="M10 2.167a7.834 7.834 0 1 1 0 15.667 7.834 7.834 0 0 1 0-15.667ZM10 9.5a.5.5 0 0 0-.5.5v3.334a.5.5 0 0 0 1 0V10a.5.5 0 0 0-.5-.5Zm0-3.333a.5.5 0 0 0 0 1h.008a.5.5 0 0 0 .101-.99l-.1-.01h-.01Z"/>
          </svg>
        </div>
      </div>
      <div onClick={() => setEnrollOpen(!isEnrollOpen)}
      className="mr-2 rounded-lg bg-button px-2 py-1 justify-end cursor-pointer"> {/* Enroll / Joined */}
        <span className="text-text">Enroll</span>
        <EnrollForm isOpen={isEnrollOpen} onClose={() => setEnrollOpen(!isEnrollOpen)} />
      </div>

      <button
            onClick={() => {
              localStorage.removeItem("enroll_id"); // 👈 clear for dev/test
              window.location.reload(); // refresh app
            }}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Reset (Dev)
          </button>

    </div>
  )
}

export default Header
