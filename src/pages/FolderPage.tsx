// pages/FolderPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStorageItems, getFileUrl } from '../utils/storage';
import NameCards from '../components/NameCards';
import Header from '../components/Header';

interface StorageItem {
  name: string;
  isFolder: boolean;
}

const FolderPage: React.FC = () => {
    const { folderName } = useParams<{ folderName?: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<StorageItem[]>([]);

   useEffect(() => {
    async function fetchFiles() {
      try {
        const pathToFetch = folderName ? decodeURIComponent(folderName) : '';
        const items = await getStorageItems('resources', pathToFetch);
        setItems(items);
      } catch (error) {
        console.error('Error loading items:', error);
      }
    }

    fetchFiles();
  }, [folderName]);

   const handleItemClick = (item: StorageItem) => {
    if (item.isFolder) {
      const newPath = folderName ? `${folderName}/${item.name}` : item.name;
      navigate(`/folder/${encodeURIComponent(newPath)}`);
    } else {
      const filePath = folderName ? `${folderName}/${item.name}` : item.name;
      const fileUrl = getFileUrl('resources', filePath);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
    {/* 
    <div className="folder-page p-4">
      <h1 className="text-xl font-bold mb-4">{folderName}</h1>
      <NameCards items={files} isFolder={false} />
    </div> */}

    <Header/>
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        {folderName ? folderName : 'Root Directory'}
      </h1>
      <NameCards 
        items={items} 
        onItemClick={handleItemClick}
        emptyMessage="This folder is empty"
      />
    </div>
    </>
  );
};

export default FolderPage;