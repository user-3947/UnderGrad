import { useLocation } from "react-router-dom";

const FileDownloader: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fileUrl = params.get("url");

  // Use fileUrl to trigger download or show download UI
  return (
    // <div className="border rounded-md p-4 bg-card text-text w-[80%] mx-auto">
    //   {fileUrl && (
    //     <a href={fileUrl} download className="">
    //       Download
    //     </a>
    //   )}
    // </div>
    <>
      {fileUrl && (
         <a href={fileUrl} download className="border rounded-md p-4 bg-card text-text w-[80%] mx-auto">
           Download
         </a>
       )}
    </>
  );
};

export default FileDownloader;
