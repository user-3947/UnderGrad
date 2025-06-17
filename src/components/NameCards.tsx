import React from "react";

interface StorageItem {
  name: string;
  isFolder: boolean;
}

interface NameCardsProps {
  items: StorageItem[];
  onItemClick: (item: StorageItem) => void;
  emptyMessage?: string;
}

const NameCards: React.FC<NameCardsProps> = ({ 
  items, 
  onItemClick, 
  emptyMessage = "No items found" 
}) => {

if (items.length === 0) {
    return <div className="p-4 text-gray-500">{emptyMessage}</div>;
  }

// Separate folders and files for better organization
  const folders = items.filter(item => item.isFolder);
  const files = items.filter(item => !item.isFolder);

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

// Reusable Card component
const Card: React.FC<{ item: StorageItem; onClick: (item: StorageItem) => void }> = ({ 
  item, 
  onClick 
}) => {
  
  return (
    <div
      className={`p-4 text-center rounded-lg transition-all cursor-pointer
        ${item.isFolder ? 'bg-blue-50 hover:bg-blue-100' : 'bg-green-50 hover:bg-green-100'}
        hover:-translate-y-1 hover:shadow-md flex flex-col items-center`}
      onClick={() => onClick(item)}
    >
      <div className="truncate w-full">{item.name}</div>
    </div>
  );
};

export default NameCards