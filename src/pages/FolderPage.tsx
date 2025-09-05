import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getStorageItems } from "../utils/storage";
import NameCards from "../components/NameCards";
import Header from "../components/Header";
import PushNotification from '../MoneTag/PushNotification';
import VignetteBanner from '../MoneTag/VignetteBanner';
import Popunder from "../MoneTag/Popunder";
import Interstitial from "../MoneTag/Interstitial";
// import InPagePush from '../MoneTag/InPagePush';
// import Multitag from "../MoneTag/Multitag";
import VideoReferences from "../components/VideoReferences";

interface StorageItem {
  name: string;
  isFolder: boolean;
  bucket: string;
}

const FolderPage: React.FC = () => {
  const { folderName } = useParams<{ folderName?: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<StorageItem[]>([]);
  // const [notes, setNotes] = useState<StorageItem[]>([]); //for exam notes


  useEffect(() => {

    async function fetchFiles() {
      try {
        const pathToFetch = folderName ? decodeURIComponent(folderName) : "";
        const [resourceItems, examNotesItems] = await Promise.all([
          getStorageItems("resources", pathToFetch),
          getStorageItems("examNotes", pathToFetch)
        ]);
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
      
      // For file paths, we need to ensure they're properly formatted for the router
      // The + in the route definition means we need to ensure the path is correctly formatted
      // Don't over-encode the path as React Router will handle some of this
      const fileViewerPath = `/file/${item.bucket}/${filePath}`;
            
      window.open(
        fileViewerPath,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <>
      <Header />
      <PushNotification/>
      {/* <InPagePush/> */}
      <Interstitial/>
      <VignetteBanner/>
      <Popunder/>
      {/* <Multitag/> */}
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4 text-text">{folderName}</h1>
        <NameCards
          items={items}
          onItemClick={handleItemClick}
          emptyMessage="This folder is empty"
        />
        {showPopunder && <Popunder />}
      </div>
      {/* <Multitag /> */}

      <hr className="my-4 border-t-2" />
      
      <VideoReferences name={folderName || ''} />
    </>
  );
};

export default FolderPage;