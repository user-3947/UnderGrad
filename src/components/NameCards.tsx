import { FaDownload } from "react-icons/fa";
import { useState } from "react";
import Popunder from "../MoneTag/Popunder";

interface StorageItem {
  name: string;
  isFolder: boolean;
  bucket: string;
  url?: string;
}

interface NameCardsProps {
  items: StorageItem[];
  onItemClick: (item: StorageItem) => void;
  emptyMessage?: string;
  isResources?: boolean; // New prop to differentiate between resources and exam notes
}

const NameCards: React.FC<NameCardsProps> = ({
  items,
  onItemClick,
  emptyMessage = "No items found",
}) => {
  if (items.length === 0) {
    return <div className="p-4 text-gray-500">{emptyMessage}</div>;
  }

  // Separate folders and files for better organization
  const folders = items.filter((item) => item.isFolder);
  const files = items.filter((item) => !item.isFolder);

  return (
    <div className="space-y-6">
      {folders.length > 0 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {folders.map((item, index) => (
              <Card item={item} onClick={onItemClick} key={`folder-${index}`} />
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((item, index) => (
              <Card item={item} onClick={onItemClick} key={`file-${index}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to construct file URLs (adjust as needed)
function getFileUrl(bucket: string, fileName: string): string {
  // Example: `/resources/filename`
  return `/${bucket}/${encodeURIComponent(fileName)}`;
}

// Reusable Card component
const Card: React.FC<{
  item: StorageItem;
  onClick: (item: StorageItem) => void;
}> = ({ item, onClick }) => {
  // Construct the file URL if it's a file. Prefer provided public `url` if present.
  const fileUrl = !item.isFolder
    ? (item.url ? item.url : getFileUrl(item.bucket, item.name))
    : null;

    const [showPopunder, setShowPopunder] = useState(false);    const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowPopunder(true); // Show popunder
    if (fileUrl) {
      // Pass fileUrl as a query parameter
      window.open(`/filedownloader?url=${encodeURIComponent(fileUrl)}`, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div
      className="p-4 text-center rounded-lg bg-card active:bg-card-active flex flex-col items-center cursor-pointer"
      onClick={() => onClick(item)}
    >
      <div className="w-full text-text flex justify-center items-center">
        <div className="truncate r-4">{item.name}</div>
        <div className="items-center flex ml-2">
          {!item.isFolder && fileUrl && (
            <>
              <FaDownload onClick={handleDownload} />
              {showPopunder && <Popunder/>}
            </>
        )}
        </div>
      </div>
      
    </div>
  );
};

export default NameCards;
