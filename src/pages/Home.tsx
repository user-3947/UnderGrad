import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Feedback from "../components/Feedback";
import Header from "../components/Header";
import NameCards from "../components/NameCards";
// import SearchBar from "../components/SearchBar";
import { getStorageItems, isSectionEnabled } from '../utils/storage';
// MoneTag components (ads/scripts) disabled by default to avoid injecting third-party code
// that may be blocked by adblockers and break the UI. To re-enable, import
// and render them explicitly.
// import Multitag from "../MoneTag/Multitag";
import { supabase } from "../lib/supabaseClient";

interface StorageItem {
  name: string;
  isFolder: boolean;
  bucket: string;
}

interface Option {
  label: string;
  id: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<StorageItem[]>([]);
  const [notes, setNotes] = useState<StorageItem[]>([]);
  const [CourseSelectedValue, setCourseSelectedValue] = useState<Option | null>(null);
  const [BatchSelectedValue, setBatchSelectedValue] = useState<Option | null>(null);
  
  const [showExamNotes, setShowExamNotes] = useState(false);

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
      const [rawItems, rawNotes] = await Promise.all([
        getStorageItems('resources'),
        isSectionEnabled('examNotes') ? getStorageItems('examNotes') : Promise.resolve([]),
      ]);
      const items = rawItems.map(item => ({ ...item, bucket: 'resources' }));
      const notes = rawNotes.map(item => ({ ...item, bucket: 'examNotes' }));
      setItems(items);
      setNotes(notes);
    } catch (error) {
      // handle error
    }
  }

  fetchItems();
}, []);

  useEffect(() => {
    const checkEnroll = async () => {
      const id = localStorage.getItem("enroll_id");
      if (!id) return;

      const { data } = await supabase
        .from("enroll")
        .select("*")
        .eq("rno", id)
        .single();

      if (data) setShowExamNotes(true);
    };

    checkEnroll();
  }, []);

   const handleItemClick = (item: StorageItem) => {
    if (item.isFolder) {
      navigate(`/folder/${encodeURIComponent(item.name)}`);
      return;
    }
    const viewerPath = `/file/${item.bucket}/${encodeURIComponent(item.name)}`;
    window.open(viewerPath, '_blank', 'noopener,noreferrer');
  };

     const handleExamNotesClick = (note: StorageItem) => {
    if (note.isFolder) {
      navigate(`/folder/${encodeURIComponent(note.name)}`);
      return;
    }
    const viewerPath = `/file/${note.bucket}/${encodeURIComponent(note.name)}`;
    window.open(viewerPath, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
    <Header/>
    {/* <Multitag /> */}
    <div className="p-4 lg:h-[90vh] h-[100vh] overflow-y-auto">
      <h1 className="title text-xl font-bold mb-4 text-text">Resources</h1>
      <NameCards 
        items={items} 
        onItemClick={handleItemClick}
        emptyMessage="No items found in root directory"
        isResources={true}
      />

      {/* {showExamNotes ? (
        <>
          <div className="title text-xl font-bold text-text mt-4">Entrance Exam Notes</div> 
          <div className="mb-2 text-red text-xs">Note: The notes are meant only for reference. Kindly DON'T share with anyone.</div>
          <NameCards 
            items={notes} 
            onItemClick={handleExamNotesClick}
            emptyMessage="No Entrance Exam Notes found"
            isResources={false}
          />
        </>
      ): (
        <>
        <hr className="my-4" />
        <div className=" mb-4 text-text mt-4">Enroll to access Entrance Exam Notes</div>
        </>
      )}       */}
      
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

