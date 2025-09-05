import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import FolderPage from "./pages/FolderPage";
import About from "./pages/About";
import FileViewer from "./pages/FileViewer";
import FileDownloader from "./pages/FileDownloader";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/file/:bucket/*" element={<FileViewer />} />

        <Route path="/folder">
          <Route index element={<Home />} />
          <Route path=":folderName" element={<FolderPage />} />
          <Route path=":folderName/*" element={<FolderPage />} />
        </Route>
        {/* <Route path="/file/:filePath" element={<FileViewer />} /> */}
        <Route path="/filedownloader" element={<FileDownloader />} />
        <Route path="/About" element={<About />} />
        {/* <Route path="/video-references" element={<VideoReferences />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
