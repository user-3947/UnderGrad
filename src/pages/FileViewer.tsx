import { useLocation } from "react-router-dom";
import { getFileUrl } from "../utils/storage";

const FileViewer: React.FC = () => {
  const location = useLocation();
  const filePath = decodeURIComponent(
    location.pathname.replace(/^\/file\//, "")
  );
  const fileUrl = getFileUrl("resources", filePath);

  const isPdf = filePath.endsWith(".pdf");
  const isWord = filePath.endsWith(".doc") || filePath.endsWith(".docx");
  const isExcel = filePath.endsWith(".xls") || filePath.endsWith(".xlsx");
  const isPpt = filePath.endsWith(".ppt") || filePath.endsWith(".pptx");

  const isGoogleViewable = isWord || isExcel || isPpt || isPdf;
  

  return (
    <>
      
        {isGoogleViewable ? (
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(
              fileUrl
            )}&embedded=true`}
            className="w-full h-[100vh]"
            title="Office Document"
          />
        ) : (
          <div className="p-4 text-gray-500">
            If the document does not load, please disable your ad blocker for this
            site.
          </div>
        )}
    </>
  );
};

export default FileViewer;
