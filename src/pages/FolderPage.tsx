import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStorageItems} from '../utils/storage';
import NameCards from '../components/NameCards';
import Header from '../components/Header';
import PushNotification from '../MoneTag/PushNotification';
import VignetteBanner from '../MoneTag/VignetteBanner';
import Popunder from '../MoneTag/Popunder';

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

  const [showPopunder, setShowPopunder] = useState(false);
  const handleItemClick = (item: StorageItem) => {
    setShowPopunder(true);
    if (item.isFolder) {
      const newPath = folderName ? `${folderName}/${item.name}` : item.name;
      navigate(`/folder/${encodeURIComponent(newPath)}`);
    } else {
      const filePath = folderName ? `${folderName}/${item.name}` : item.name;
      window.open(`/file/${encodeURIComponent(filePath)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
    <Header/>
    <PushNotification/>
    <VignetteBanner/>
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-text">{folderName}</h1>
      <NameCards 
        items={items} 
        onItemClick={handleItemClick}
        emptyMessage="This folder is empty"
      />
      {showPopunder && <Popunder />}
    </div>
    </>
  );
};

export default FolderPage;