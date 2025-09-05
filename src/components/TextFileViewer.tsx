import { useState, useEffect } from 'react';

interface TextFileViewerProps {
  fileUrl: string;
}

const TextFileViewer: React.FC<TextFileViewerProps> = ({ fileUrl }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTextContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        // console.error removed
        setError(err instanceof Error ? err.message : 'Failed to load text file');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTextContent();
  }, [fileUrl]);

  if (isLoading) {
    return <div className="text-center py-4">Loading text content...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  return (
    <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
  );
};

export default TextFileViewer;