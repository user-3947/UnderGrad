import Header from '../components/Header'

const About = () => {
  return (
    <>
        <Header/>
        <div className='about border w-[90%] mx-auto'>
        <p className='text-center'>
            <b className='text-2xl'>what is UnderGrad -</b> An e-library for students in their undergraduate program. It is a platform that provides access to all papers required from exam point of view including Machine Learning, Internet of Things, and other subjects. It is a free resource for students to access and download papers. No login required.
            <br/>Any issues regarding notes, application or adding resources feel free to mention it in the feedback section or can contact me personally
        </p>
    </div>
    </>
  )
}

export default About
