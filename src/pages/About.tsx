import Header from "../components/Header";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const About = () => {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    fetch("/README.md")
      .then((res) => res.text())
      .then(setMarkdown);
  }, []);

  return (
    <>
      <Header />
      <div className="container p-4 text-text ">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </>
  );
};

export default About;
