import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStorageItems} from '../utils/storage';
import NameCards from '../components/NameCards';
import Header from '../components/Header';
// import PushNotification from '../MoneTag/PushNotification';
// import VignetteBanner from '../MoneTag/VignetteBanner';
import Popunder from '../MoneTag/Popunder';
// import InPagePush from '../MoneTag/InPagePush';
import Multitag from '../MoneTag/Multitag';

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
    if (item.isFolder) {
      const newPath = folderName ? `${folderName}/${item.name}` : item.name;
      setShowPopunder(true);
      setTimeout(() => setShowPopunder(false), 5000); // Hide after 5 seconds
      navigate(`/folder/${encodeURIComponent(newPath)}`);
    } else {
      const filePath = folderName ? `${folderName}/${item.name}` : item.name;
      setShowPopunder(true);
      setTimeout(() => setShowPopunder(false), 5000); // Hide after 5 seconds
      window.open(`/file/${encodeURIComponent(filePath)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
    <Header/>
    {/* <PushNotification/> */}
    {/* <InPagePush/> */}
    {/* <VignetteBanner/> */}
    <Multitag/>
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