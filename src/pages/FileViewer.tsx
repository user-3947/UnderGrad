import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation, useParams } from "react-router-dom";

import { resolveFileUrl } from "../utils/storage";
import TextFileViewer from "../components/TextFileViewer";

// File type definitions
const FILE_TYPES = {
  PDF: /\.pdf$/i,
  WORD: /\.(doc|docx)$/i,
  EXCEL: /\.(xls|xlsx)$/i,
  PPT: /\.(ppt|pptx)$/i,
  IMAGE: /\.(jpe?g|png|gif|bmp|webp|svg)$/i,
  TEXT: /\.(txt|md|json|csv|xml|html?|css|js|jsx|ts|tsx)$/i,
  AUDIO: /\.(mp3|wav|ogg|aac|flac)$/i,
  VIDEO: /\.(mp4|webm|ogv|mov|avi)$/i
};

// Reusable download button component
interface DownloadButtonProps {
  fileUrl: string;
  label?: string;
  className?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ fileUrl, label = "Download File", className = "" }) => (
  <a 
    href={fileUrl} 
    download 
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${className}`}
  >
    {label}
  </a>
);

// Media container component
interface MediaContainerProps {
  children: ReactNode;
  fileName: string;
  fileUrl: string;
  downloadLabel?: string;
  className?: string;
}

const MediaContainer: React.FC<MediaContainerProps> = ({ 
  children, 
  fileName, 
  fileUrl, 
  downloadLabel,
  className = "bg-gray-100" 
}) => (
  <div className={`flex flex-col items-center justify-center h-full p-4 ${className}`}>
    <div className="max-w-full max-h-[80vh] overflow-auto bg-white shadow-lg p-2">
      {children}
    </div>
    <DownloadButton 
      fileUrl={fileUrl} 
      label={downloadLabel || `Download ${fileName}`} 
      className="mt-4" 
    />
  </div>
);

const FileViewer: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ bucket: string; filePath: string }>();
  
  // Combined state for better management
  const [fileState, setFileState] = useState<{
    fileUrl: string;
    isLoading: boolean;
    error: string | null;
    gviewerError: boolean;
  }>({
    fileUrl: "",
    isLoading: true,
    error: null,
    gviewerError: false
  });

  // Get bucket from route params
  const bucket = params.bucket || "resources";
  // Get file path from location
  const filePath = location.pathname.replace(`/file/${bucket}/`, "") || "";
  const fileName = filePath.split('/').pop() || 'File';
  
  // Destructure state for easier access
  const { fileUrl, isLoading, error, gviewerError } = fileState;
  
  useEffect(() => {
    if (!filePath) {
      setFileState(prev => ({
        ...prev,
        error: "No file path provided",
        isLoading: false
      }));
      return;
    }
    
    let cancelled = false;
    async function load() {
      try {
        const decodedPath = decodeURIComponent(filePath);
        const url = await resolveFileUrl(bucket, decodedPath);
        if (cancelled) return;
        setFileState(prev => ({
          ...prev,
          fileUrl: url,
          isLoading: false
        }));

        if (FILE_TYPES.PDF.test(decodedPath)) {
          fetch(url, { method: 'HEAD' })
            .then(() => { /* ok */ })
            .catch(() => { /* ignore */ });
        }
      } catch (err) {
        if (cancelled) return;
        setFileState(prev => ({
          ...prev,
          error: "Failed to generate file URL",
          isLoading: false
        }));
      }
    }
    load();
    return () => { cancelled = true; };
  }, [bucket, filePath]);

  // File type detection using the regex patterns
  const fileType = Object.entries(FILE_TYPES).find(
    ([_, regex]) => regex.test(filePath)
  )?.[0] || "UNKNOWN";
  
  // Determine if file can be viewed with Google Docs viewer
  const isGoogleViewable = ["PDF", "WORD", "EXCEL", "PPT"].includes(fileType);
  

  // Render appropriate viewer based on file type
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-text">Loading document...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      );
    }

    // Special handling for Google Docs viewable files and PDF direct view
    if (fileType === "PDF" && gviewerError && fileUrl) {
      // Direct PDF viewer when Google Docs viewer fails
      return (
        <div className="w-full h-full flex flex-col">
          <iframe
            src={fileUrl}
            className="w-full h-full"
            title="PDF Document"
            onError={() => setFileState(prev => ({ ...prev, error: "Failed to load PDF directly. Try downloading instead." }))}
          />
        </div>
      );
    }

    if (isGoogleViewable && !gviewerError) {
      return (
        <div className="w-full h-full relative">
          {fileType === "PDF" && (
            <div className="absolute top-0 right-0 z-10 p-2 bg-white rounded-bl shadow-md">
              <button
                onClick={() => setFileState(prev => ({ ...prev, gviewerError: true }))}
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
            onError={() => setFileState(prev => ({ ...prev, gviewerError: true }))}
            onLoad={(e) => {
              // Check if the iframe loaded with an error page
              setTimeout(() => {
                try {
                  const iframe = e.target as HTMLIFrameElement;
                  if (iframe.contentWindow?.document.body.innerText.includes('Sorry, we were unable to find the document')) {
                    setFileState(prev => ({ ...prev, gviewerError: true }));
                  }
                } catch (err) {
                  // Ignore cross-origin errors
                }
              }, 2000); // Give it time to load
            }}
          />
        </div>
      );
    }

    // Handle different file types
    switch (fileType) {
      case "IMAGE":
        return (
          <MediaContainer fileName={fileName} fileUrl={fileUrl} downloadLabel="Download Image">
              <img 
                src={fileUrl} 
                alt={fileName || 'Image preview'} 
                className="max-w-full max-h-full object-contain"
                onError={() => setFileState(prev => ({ ...prev, error: "Failed to load image. The file might be corrupted or inaccessible." }))}
              />
          </MediaContainer>
        );
        
      case "VIDEO":
        return (
          <MediaContainer fileName={fileName} fileUrl={fileUrl} downloadLabel="Download Video" className="bg-gray-100">
            <video 
              src={fileUrl} 
              controls 
              className="max-w-full max-h-full"
              onError={() => setFileState(prev => ({ ...prev, error: "Failed to load video. The format might not be supported by your browser." }))}
            >
              Your browser does not support the video tag.
            </video>
          </MediaContainer>
        );
        
      case "AUDIO":
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">{fileName}</h2>
              <audio 
                src={fileUrl} 
                controls 
                className="w-full"
                onError={() => setFileState(prev => ({ ...prev, error: "Failed to load audio. The format might not be supported by your browser." }))}
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
            <DownloadButton fileUrl={fileUrl} label="Download Audio" className="mt-4" />
          </div>
        );
        
      case "TEXT":
        return (
          <div className="flex flex-col h-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{fileName}</h2>
              <DownloadButton fileUrl={fileUrl} />
            </div>
            <div className="flex-grow bg-white shadow-lg rounded-lg p-4 overflow-auto">
              <TextFileViewer fileUrl={fileUrl} />
            </div>
          </div>
        );
        
      
        
      default:
        if (fileUrl) {
          // Fallback for unsupported file types or when Google viewer fails
          return (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {gviewerError && fileType !== "PDF" 
                    ? "Preview not available" 
                    : "This file type cannot be previewed directly"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {gviewerError && fileType !== "PDF"
                    ? "Google Docs viewer couldn't display this document. You can download it instead." 
                    : "You can download the file to view it on your device."}
                </p>
                <DownloadButton fileUrl={fileUrl} className="inline-block" />
                <p className="mt-4 text-gray-500 text-sm">
                  If the download doesn't work, please disable your ad blocker for this site.
                </p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-xl text-red-500">Unable to load file. Please try again later.</div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {renderContent()}
    </div>
  );
};

export default FileViewer;
