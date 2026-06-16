import { useEffect, useState } from "react";

type FC = (props: Record<string, unknown>) => React.ReactNode;

type ComponentModule = {
  default: FC;
};

const VideoReferences = ({name}: {name: string}) => {
  const [fileContent, setFileContent] = useState<FC | null>(null);

  useEffect(() => {
    if (!name) {
      setFileContent(null);
      return;
    }

    // Use import.meta.glob for static analysis by Vite
    const modules = import.meta.glob<ComponentModule>(
      '../Video References/*.tsx',
      { eager: false }
    );

    // Find the matching module by filename
    const modulePath = Object.keys(modules).find((path) =>
      path.includes(`${name}.tsx`)
    );

    if (modulePath) {
      modules[modulePath]().then((module) => {
        setFileContent(() => module.default);
      }).catch(() => {
        setFileContent(null);
      });
    } else {
      setFileContent(null);
    }
  }, [name]);

  return (
    <div>
      {fileContent ? (
        fileContent({})
      ) : (
        <p className="text-text">Loading...</p>
      )}
    </div>
  )
}

export default VideoReferences
