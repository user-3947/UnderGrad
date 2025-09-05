import { useEffect, useState } from "react";
const VideoReferences = ({name}: {name: string}) => {
  const [fileContent, setFileContent] = useState(null);

  useEffect(() => {
    const filePath = `../Video References/${name}`;
    import(filePath)
      .then((module) => {
        setFileContent(module.default);
      })
      .catch(() => {
      });
  }, [name]);

  return (
    <div>
      {fileContent ? (
        <>{fileContent}</>
      ) : (
        <p className="text-text">Loading...</p>
      )}
    </div>
  )
}

export default VideoReferences
