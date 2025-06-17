import Feedback from "../components/Feedback";
import Header from "../components/Header";
import NameCards from "../components/NameCards";
// import SearchBar from "../components/SearchBar";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStorageItems, getFileUrl } from '../utils/storage';

interface StorageItem {
  name: string;
  isFolder: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<StorageItem[]>([]);

useEffect(() => {
    async function fetchItems() {
      try {
        const items = await getStorageItems('resources');
        setItems(items);
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
      }
    }

    fetchItems();
  }, []);

   const handleItemClick = (item: StorageItem) => {
    if (item.isFolder) {
      navigate(`/folder/${encodeURIComponent(item.name)}`);
    } else {
      // Handle file click in root directory
      const fileUrl = getFileUrl('resources', item.name);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
    <Header/>
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Resources</h1>
      <NameCards 
        items={items} 
        onItemClick={handleItemClick}
        emptyMessage="No items found in root directory"
      />
    </div>
    {/* <SearchBar/> */}
    {/* <Feedback/> */}
    </>
  );
};

export default Home;