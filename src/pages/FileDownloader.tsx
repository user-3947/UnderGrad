import { useLocation } from "react-router-dom";
import Multitag from "../MoneTag/Multitag";

const FileDownloader: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fileUrl = params.get("url");

  return (
    <>
    <Multitag/>
      {fileUrl && (
         <a href={fileUrl} download className="border rounded-md p-4 bg-card text-text w-[80%] mx-auto">
           Download
         </a>
       )}
    </>
  );
};

export default FileDownloader;
