import { useState, type ChangeEvent} from 'react';

import { supabase } from '../lib/supabaseClient';

interface EnrollFormProps {
  isOpen: boolean;
  onClose: () => void;
}
interface FormData {
  rno: number;
  name: string;
}


const EnrollForm = ({ isOpen, onClose }: EnrollFormProps) => {
    const [formData, setFormData] = useState<FormData>({
      rno: 0,  
      name: '',
    });

    const [message, setMessage] = useState<string>('');
    const [status, setStatus] = useState<boolean>(false); 
     const [loading, setLoading] = useState(false);

    const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "rno" ? Number(value) : value,
    });
  };
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    // Submit the form data to the server or API

      if (!formData.rno || !formData.name) {
        setStatus(true);
        setMessage("Please fill in all fields.");
        setLoading(false);
        return;
      }else{
        setStatus(false);
      }
      
    try {
        const { error } = await supabase.from('enroll').insert([
          {
            rno: formData.rno,
            name: formData.name,
          }
        ]);
        if (error) {
          // console.log removed
          throw error;
        }
        localStorage.setItem("enroll_id", formData.rno.toString());
        setMessage("Successfully signed up! Close the form to continue.");
        setFormData({ rno: 0, name: "" });
        setStatus(false);
        setTimeout(() => {setMessage('');}, 3000);
        window.location.reload(); // refresh app
      } catch (error) {
        setStatus(true);
        setMessage("Error saving data. Try again");
        setTimeout(() => {setMessage('');}, 3000);
      } finally {
        setLoading(false);
      }
  };

 if (!isOpen) return null;

  return (
    <div onClick={onClose}
    className="backdrop-blur-xs fixed top-0 right-0 z-50 w-full h-full flex items-center justify-center"> {/* backdrop blur */}

    <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}
    className="bg-card text-text grid grid-cols-2 gap-4 px-3 py-4 rounded-lg">

        {message && (
          <div className={`col-span-2 text-center ${status ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </div>
        )}

        <input type="text" name='rno' onChange={handleChange} placeholder="Enter your roll number" className='col-span-2 w-auto rounded-lg placeholder:text-input-placeholder bg-input text-input-text px-3 py-1.5' />
        
        <input type="text" name="name" onChange={handleChange} placeholder="Enter your name"
        className='col-span-2 w-auto rounded-lg placeholder:text-input-placeholder bg-input text-input-text px-3 py-1.5'
        />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-button rounded-lg border text-button-text py-2 col-span-2  active:bg-button-click transition duration-300"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
    </form>
    </div>
  )
}

export default EnrollForm
