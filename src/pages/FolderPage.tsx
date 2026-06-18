import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { getStorageItems } from "../utils/storage";
import NameCards from "../components/NameCards";
import Header from "../components/Header";
// import InPagePush from '../MoneTag/InPagePush';
// import Multitag from "../MoneTag/Multitag";
// import VideoReferences from "../components/VideoReferences";

interface StorageItem {
  name: string;
  isFolder: boolean;
  bucket: string;
}

const FolderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<StorageItem[]>([]);
  const [debugInfo, setDebugInfo] = useState<{ resourceItems: any[]; examNotesItems: any[]; error?: any } | null>(null);

  const rawPath = location.pathname.replace(/^\/folder\/?/, "");
  const folderName = rawPath ? decodeURIComponent(rawPath) : "";

  const encodePath = (path: string) =>
    path
      .split("/")
      .map((s) => encodeURIComponent(s))
      .join("/");


  useEffect(() => {

    async function fetchFiles() {
      try {
        const pathToFetch = folderName;
        const [resourceItems, examNotesItems] = await Promise.all([
          getStorageItems("resources", pathToFetch),
          getStorageItems("examNotes", pathToFetch)
        ]);
        console.debug('FolderPage: fetched resourceItems, examNotesItems', { pathToFetch, resourceItems, examNotesItems });
        setDebugInfo({ resourceItems, examNotesItems });
        // Add bucket property to each item
        const resourcesWithBucket = resourceItems.map(item => ({
          ...item,
          bucket: "resources"
        }));
        const examNotesWithBucket = examNotesItems.map(item => ({
          ...item,
          bucket: "examNotes"
        }));
        // Combine both arrays
        setItems([...resourcesWithBucket, ...examNotesWithBucket]);
      } catch (error) {
        console.error('FolderPage: fetchFiles error', error);
        setDebugInfo(prev => ({ ...(prev || { resourceItems: [], examNotesItems: [] }), error }));
      }
    }

    fetchFiles();
  }, [location.pathname]);

  const [showPopunder, setShowPopunder] = useState(false);
  const handleItemClick = (item: StorageItem) => {
    if (item.isFolder) {
      const newPath = folderName ? `${folderName}/${item.name}` : item.name;
      setShowPopunder(true);
      setTimeout(() => setShowPopunder(false), 5000);
      navigate(`/folder/${encodePath(newPath)}`);
      return;
    }

    const filePath = folderName ? `${folderName}/${item.name}` : item.name;
    const viewerPath = `/file/${item.bucket}/${encodePath(filePath)}`;
    window.open(viewerPath, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Header />
      {/* <Multitag/> */}
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4 text-text">{folderName}</h1>
          {items.length === 0 && debugInfo && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-sm text-yellow-800 font-medium mb-2">Debug: no items found — raw fetch results</div>
              <pre className="text-xs overflow-auto max-h-48">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        <NameCards
          items={items}
          onItemClick={handleItemClick}
          emptyMessage="This folder is empty"
        />
        {showPopunder && null}
      </div>
      {/* <Multitag /> */}

      {/* <hr className="my-4 border-t-2" /> */}
      
      {/* <VideoReferences name={folderName || ''} /> */}
    </>
  );
};

export default FolderPage;