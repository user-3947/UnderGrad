import Feedback from "../components/Feedback";
import Header from "../components/Header";
import NameCards from "../components/NameCards";
// import SearchBar from "../components/SearchBar";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStorageItems, getFileUrl } from '../utils/storage';
// import PushNotification from "../MoneTag/PushNotification";
import InPagePush from "../MoneTag/InPagePush";

interface StorageItem {
  name: string;
  isFolder: boolean;
}

interface Option {
  label: string;
  id: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<StorageItem[]>([]);
  const [CourseSelectedValue, setCourseSelectedValue] = useState<Option | null>(null);
  const [BatchSelectedValue, setBatchSelectedValue] = useState<Option | null>(null);

  const courses = [
    { label: 'B.Sc. (C.S.)', id: 0 },
    { label: 'B.C.A.', id: 1 }
  ];
  const batches = [
    { label: '30', id: 0 },
    { label: '29', id: 1 },
    { label: '28', id: 2 },
    { label: '27', id: 3 },
    { label: '26', id: 4 },
    { label: '25', id: 5 },
    { label: '24', id: 6 },
    { label: '23', id: 7 },
    { label: '22', id: 8 }
  ];

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
      window.open(fileUrl, '_blank', 'noopener,noreferrer'); {/*file opener*/}
    }
  };

  return (
    <>
    <Header/>
    {/* <PushNotification/> */}
    <InPagePush/>
    <div className="p-4 lg:h-[90vh] h-[100vh] overflow-y-auto">
      <h1 className="title text-xl font-bold mb-4 text-text">Resources</h1>
      <NameCards 
        items={items} 
        onItemClick={handleItemClick}
        emptyMessage="No items found in root directory"
      />
     </div>
    {/* <SearchBar/> */}
    <Feedback
      courses={courses}
      batches={batches}
      CourseSelected={CourseSelectedValue}
      CourseOnChange={id => setCourseSelectedValue(courses.find(c => c.id === id) || null)}
      BatchSelected={BatchSelectedValue}
      BatchOnChange={id => setBatchSelectedValue(batches.find(b => b.id === id) || null)}
    />
    </>
  );
};

export default Home;

