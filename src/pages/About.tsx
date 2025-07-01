import Header from "../components/Header";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
// import PushNotification from "../MoneTag/PushNotification";
import VignetteBanner from "../MoneTag/VignetteBanner";
import InPagePush from "../MoneTag/InPagePush";

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
      {/* <PushNotification /> */}
      <InPagePush />
      <VignetteBanner />
      <div className="container p-4 text-text ">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </>
  );
};

export default About;
