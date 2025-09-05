import { useState, type SetStateAction, type JSX, useEffect } from 'react';

import arrow_down7F7F7F from '../assets/arrow_down7F7F7F.svg';
import arrow_up7F7F7F from '../assets/arrow_up7F7F7F.svg';
import { FaStar } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa";
import { FaStarHalf } from "react-icons/fa";

import { supabase } from '../lib/supabaseClient';

interface Option{
    label: string;
    id: number;
  }
  interface DropdownProps {
    CourseSelected: Option | null;
    BatchSelected: Option | null;
    courses: Option[];
    batches: Option[];
    CourseOnChange: (id: number) => void;
    BatchOnChange: (id: number) => void;
  }

  interface Feedback {
    name: string;
    description: string;
    course: string;
    batch: number; 
    rating: number;
    date: string;
  }

const Feedback: React.FC<DropdownProps> = ({
  courses, 
  batches, 
  CourseSelected, 
  BatchSelected, 
  CourseOnChange, 
  BatchOnChange
}) => {
  const [dropCourse, setDropCourse] = useState(false);
  const [dropBatch, setDropBatch] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState<Feedback[]>([]); {/*stores feedback from db*/}
  const [formData, setformData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const fetchFeedback = async () => { {/*fetches feedback from db*/}
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      // console.error removed
    } else {
      setFeedback(data as Feedback[]);
    }
  }
  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setformData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !formData.name ||
      !formData.description ||
      !CourseSelected ||
      !BatchSelected ||
      rating === 0
    ) {
      setError('All fields are required')
      setTimeout(() => {
      setError(null);
    }, 3000);
      return;
    } else {
      setError(null);
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            course: CourseSelected.label,
            batch: BatchSelected.label,  
            rating: rating
          }
        ]);
      if (error) {
        setError('An error occurred while submitting feedback');
        return;
      }
      setformData({
        name: '',
        description: ''
      });
      setRating(0);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
  }
  
  const star = (
    index: number,
    rating: number,
    setRating: React.Dispatch<SetStateAction<number>>
  ): JSX.Element => {
    const handleClick = (value: number) => {
      setRating(value);
    };

    let icon;
    if (rating >= index + 1) {
      icon = <FaStar />;
    } else if (rating >= index + 0.5) {
      icon = <FaStarHalf />;
    } else {
      icon = <FaRegStar />;
    }

    return (
      <div className="star relative w-6 text-star-gray">
        <span
          onClick={() => handleClick(index + 0.5)}
          className="absolute left-0 w-1/2 h-full z-2"
          aria-label={`Rate ${index + 0.5} stars`}
        />
        <span
          onClick={() => handleClick(index + 1)}
          className="absolute right-0 w-1/2 h-full z-2"
          aria-label={`Rate ${index + 1} stars`}
        />
        <span className="pointer-events-none">{icon}</span>
      </div>
    );
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.batch') && !target.closest('.course')) {
        setDropBatch(false);
        setDropCourse(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [])

  return (
    <div className="p-4 shadow-md mt-4 border-t-2"> {/*Feedback Component*/}
      <p className="title flex justify-center font-bold text-5xl my-2 text-title">Feedback</p>

      <ul className="feedback-list flex flex-col gap-3 my-6"> {/*Feedback List*/}
        {feedback.map((item: Feedback, key) => (
          <li key={key} className="feedback-container border-card rounded-md p-2 w-[90%] max-h-25 mx-auto bg-card shadow-md overflow-y-scroll">{/*Feedback Item*/}
          <div className="flex items-center gap-4 overflow-hidden text-nowrap">
            <p className=' overflow-hidden text-nowrap text-text'>{item.name}</p>
            <div className="flex gap-2 mt-1">
              <p className="text-xs text-gray-400 font-light">{item.batch}</p>
              <p className="text-xs text-gray-400 font-light">{item.course}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-xs flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, index: number) => (
                <span key={index}>
                  {item.rating >= index + 1 ? (
                    <FaStar className="text-star-gray" />
                  ) : item.rating >= index + 0.5 ? (
                    <FaStarHalf className="text-star-gray" />
                  ) : (
                    <FaRegStar className="text-card" />
                  )}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-400 font-light">{item.date}</div>
          </div>
          <div className="mt-1 text-desc">{item.description}</div>
        </li>
        ))}
      </ul>

      <form
  onSubmit={handleSubmit}
  className="sticky bottom-0 mt-20 grid grid-cols-2 gap-3 rounded-lg p-6 bg-card min-w-[320px] max-w-[400px] mx-auto "> {/*Feedback Form*/}
  {error && (
    <div className="col-span-2 text-red text-center mb-2">{error}</div> // Error message
  )}
  {success && (
    <div className="col-span-2 text-green text-center mb-2">Feedback submitted successfully!</div> // Success message
  )}
  <input
    type="text"
    name="name"
    value={formData.name}
    onChange={handleChange}
    placeholder="Enter name"
    className="border-border rounded-lg w-full col-span-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-input-focus placeholder:text-input-placeholder bg-input text-input-text"/> {/* Name Input */}
  <div className="batch relative col-span-1">
    <button
      type="button"
      onClick={() => setDropBatch(!dropBatch)}
      className="border-border flex rounded-lg bg-card-hover px-3 py-2 w-full justify-between items-center focus:outline-none"> {/* Batch Dropdown */}
      <span className="text-base text-[#7f7f7f]">{BatchSelected?.label || "Batch"}</span>
      {!dropBatch ? (
        <img src={arrow_down7F7F7F} alt="Arrow Down" />
      ) : (
        <img src={arrow_up7F7F7F} alt="Arrow Up" />
      )}
    </button>
    {dropBatch && (
      <ul
        onClick={() => setDropBatch(!dropBatch)}
        className="bg-card-hover text-text border rounded-lg p-2 text-base font-semibold absolute left-0 w-full max-h-40 overflow-y-auto z-10"
      >
        {batches.map(({ id, label }) => (
          <li
            key={id}
            onClick={() => BatchOnChange(id)}
            className={`pl-2 py-2`}
          >
            {label}
          </li>
        ))}
      </ul>
    )}
  </div>
  <div className="course relative col-span-1"> {/* Course Dropdown */}
    <button
      type="button"
      onClick={() => setDropCourse(!dropCourse)}
      className="border-border flex rounded-lg bg-card-hover px-3 py-2 w-full justify-between items-center focus:outline-none"
    >
      <span className="text-base text-[#7f7f7f]">{CourseSelected?.label || "Course"}</span>
      {!dropCourse ? (
        <img src={arrow_down7F7F7F} alt="Arrow Down" />
      ) : (
        <img src={arrow_up7F7F7F} alt="Arrow Up" />
      )}
    </button>
    {dropCourse && (
      <ul
        onClick={() => setDropCourse(!dropCourse)}
        className="bg-card-hover text-text border rounded-lg p-2 text-base font-semibold absolute left-0 w-full max-h-40 overflow-y-auto z-10 shadow"
      >
        {courses.map(({ id, label }) => (
          <li
            key={id}
            onClick={() => CourseOnChange(id)}
            className={`pl-2 py-2 rounded`}
          >
            {label}
          </li>
        ))}
      </ul>
    )}
  </div>
  <div className="rating flex justify-center items-center col-span-2 gap-2 text-3xl"> {/* Rating Section */}
    {Array.from({ length: 5 }, (_, index: number) => (
      <span key={index}>{star(index, rating, setRating)}</span>
    ))}
  </div>
  <textarea
    name="description"
    value={formData.description}
    onChange={handleChange}
    placeholder="Enter feedback"
    className="border-border rounded-lg w-full col-span-2 px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-input-focus placeholder:text-input-placeholder bg-input text-input-text"/> {/* Description */}
  <button
    type="submit"
    className="border rounded-lg bg-button text-button-text px-3 py-2 col-span-2 w-full mx-auto transition active:bg-button-click"> {/* Submit Button */}
    Submit
  </button>
</form>
    </div>
  );
}

export default Feedback;
