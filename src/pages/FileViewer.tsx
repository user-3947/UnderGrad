import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

import { getFileUrl } from "../utils/storage";
import TextFileViewer from "../components/TextFileViewer";

const FileViewer: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ bucket: string; filePath: string }>(); // Use useParams to get route parameters
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get bucket from route params
  const bucket = params.bucket || "resources";
  // Since we're using a wildcard (*) route, we need to get the rest of the path from location
  const filePath = location.pathname.replace(`/file/${bucket}/`, "") || "";
  
  useEffect(() => {
    if (!filePath) {
      setError("No file path provided");
      setIsLoading(false);
      return;
    }
    
    try {
      // The filePath from useParams might include the encoded characters
      // We need to ensure it's properly decoded before passing to getFileUrl
      const decodedPath = decodeURIComponent(filePath);
      // console.log removed
      
      const url = getFileUrl(bucket, decodedPath);
      setFileUrl(url);
      
      // For PDF files, check if they're directly accessible
      if (decodedPath.toLowerCase().endsWith('.pdf')) {
        fetch(url, { method: 'HEAD' })
          .then(response => {
            if (!response.ok) {
            }
          })
          .catch();
      }
    } catch (err) {
      setError("Failed to generate file URL");
    } finally {
      setIsLoading(false);
    }
  }, [bucket, filePath]);

  // File type detection
  const isPdf = filePath.toLowerCase().endsWith(".pdf");
  const isWord = filePath.toLowerCase().endsWith(".doc") || filePath.toLowerCase().endsWith(".docx");
  const isExcel = filePath.toLowerCase().endsWith(".xls") || filePath.toLowerCase().endsWith(".xlsx");
  const isPpt = filePath.toLowerCase().endsWith(".ppt") || filePath.toLowerCase().endsWith(".pptx");
  
  // Image file types
  const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(filePath);
  
  // Text file types
  const isText = /\.(txt|md|json|csv|xml|html?|css|js|jsx|ts|tsx)$/i.test(filePath);
  
  // Audio and video file types
  const isAudio = /\.(mp3|wav|ogg|aac|flac)$/i.test(filePath);
  const isVideo = /\.(mp4|webm|ogv|mov|avi)$/i.test(filePath);
  
  // Files that can be viewed with Google Docs viewer
  const isGoogleViewable = isWord || isExcel || isPpt || isPdf;
  
  // State for Google Docs viewer errors
  const [gviewerError, setGviewerError] = useState<boolean>(false);
  

  return (
    <div className="w-full h-screen flex flex-col">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-text">Loading document...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      ) : isImage ? (
        // Direct image preview
        <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-100">
          <div className="max-w-full max-h-[80vh] overflow-auto bg-white shadow-lg p-2">
            <img 
              src={fileUrl} 
              alt={filePath.split('/').pop() || 'Image preview'} 
              className="max-w-full max-h-full object-contain"
              onError={() => setError("Failed to load image. The file might be corrupted or inaccessible.")}
            />
          </div>
          <a 
            href={fileUrl} 
            download 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Download Image
          </a>
        </div>
      ) : isVideo ? (
        // Direct video preview
        <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-100">
          <div className="max-w-full max-h-[80vh] overflow-auto bg-black shadow-lg">
            <video 
              src={fileUrl} 
              controls 
              className="max-w-full max-h-full"
              onError={() => setError("Failed to load video. The format might not be supported by your browser.")}>
              Your browser does not support the video tag.
            </video>
          </div>
          <a 
            href={fileUrl} 
            download 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Download Video
          </a>
        </div>
      ) : isAudio ? (
        // Direct audio preview
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">{filePath.split('/').pop() || 'Audio file'}</h2>
            <audio 
              src={fileUrl} 
              controls 
              className="w-full"
              onError={() => setError("Failed to load audio. The format might not be supported by your browser.")}>
              Your browser does not support the audio tag.
            </audio>
          </div>
          <a 
            href={fileUrl} 
            download 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Download Audio
          </a>
        </div>
      ) : isText ? (
        // Text file preview
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{filePath.split('/').pop() || 'Text file'}</h2>
            <a 
              href={fileUrl} 
              download 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Download File
            </a>
          </div>
          <div className="flex-grow bg-white shadow-lg rounded-lg p-4 overflow-auto">
            <TextFileViewer fileUrl={fileUrl} />
          </div>
        </div>
      ) : isGoogleViewable && !gviewerError ? (
        // Google Docs viewer for office documents with direct fallback for PDFs
        <div className="w-full h-full relative">
          {isPdf && (
            <div className="absolute top-0 right-0 z-10 p-2 bg-white rounded-bl shadow-md">
              <button 
                onClick={() => setGviewerError(true)} 
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                View PDF directly
              </button>
            </div>
          )}
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            className="w-full h-[100vh]"
            title="Office Document"
            onError={() => {
              setGviewerError(true);
            }}
            onLoad={(e) => {
              // Check if the iframe loaded with an error page
              setTimeout(() => {
                try {
                  const iframe = e.target as HTMLIFrameElement;
                  if (iframe.contentWindow?.document.body.innerText.includes('Sorry, we were unable to find the document')) {
                    // console.log removed
                    setGviewerError(true);
                  }
                } catch (err) {
                  // Ignore cross-origin errors
                }
              }, 2000); // Give it time to load
            }}
          />
        </div>
      ) : isPdf && gviewerError && fileUrl ? (
        // Direct PDF viewer when Google Docs viewer fails for PDFs
        <div className="w-full h-full flex flex-col">
          <iframe 
            src={fileUrl} 
            className="w-full h-full" 
            title="PDF Document"
            onError={() => setError("Failed to load PDF directly. Try downloading instead.")} 
          />
        </div>
      ) : fileUrl ? (
        // Fallback for unsupported file types or when Google viewer fails
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {gviewerError && !isPdf ? "Preview not available" : "This file type cannot be previewed directly"}
            </h3>
            <p className="text-gray-500 mb-6">
              {gviewerError && !isPdf
                ? "Google Docs viewer couldn't display this document. You can download it instead." 
                : "You can download the file to view it on your device."}
            </p>
            <a 
              href={fileUrl} 
              download 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-block"
            >
              Download File
            </a>
            <p className="mt-4 text-gray-500 text-sm">
              If the download doesn't work, please disable your ad blocker for this site.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-red-500">Unable to load file. Please try again later.</div>
        </div>
      )}
    </div>
  );
};

export default FileViewer;
