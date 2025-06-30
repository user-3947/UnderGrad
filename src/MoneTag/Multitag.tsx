import { useEffect } from "react";

const Multitag = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://fpyf8.com/88/tag.min.js";
    script.setAttribute("data-zone", "154616");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default Multitag;