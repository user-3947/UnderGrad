// import React from 'react'

const Feedback = () => {
  
  // const [formData, setformData] = React.useState([
  //   { name: '', yoj: '', course: '' , description: ''}
  // ]);

    return (
    <>
        <div className="bg-green-400">
      <p className="title flex justify-center font-bold text-5xl my-2">Feedback</p>
      
      <form className="form sticky bottom-0 mt-15 bg-amber-400 flex flex-col border">
        <input type="text" name="name" id="" placeholder="Enter name" className='border w-[80%] mx-auto'/>
        <input type="text" name="batch" id="" placeholder="Enter year of joining" className='border w-[40%]'/>
        <input type="text" name="course" id="" placeholder="Enter your course name" className='border w-[40%]'/>
        <input type="range" name="" id="" />
        <textarea name="description" id="" placeholder="Comments max 20 words" className='border w-[80%] mx-auto'/>
        <button type="submit" className='my-1'>submit</button>
    </form>
    </div>
    </>
    
  )
}

export default Feedback
